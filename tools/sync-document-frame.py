#!/usr/bin/env python3
import argparse
import hashlib
import re
import textwrap
from html import escape
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1]
COMPANY = "https://kaizosha.org"
SITES = {
    "kaizosha": "Kaizōsha",
    "together": "Together",
    "sekai": "Sekai",
    "hush": "Hush",
    "morph": "Morph",
    "modscan": "ModScan",
    "i": "i",
}

COMPACT_LABEL = {
    "Terms": "T",
    "Privacy": "P",
    "Contact": "C",
    "Back to top": "↑",
    "App Privacy": "APP",
    "Package Privacy": "PKG",
    "Tool Privacy": "TOOL",
    "Website Privacy": "WEB",
}

STYLE_LINK = r'    <link rel="stylesheet" href="[^"]*/document-frame\.css\?v=[^"]+">\n'
OLD_SCRIPT = r'^ *<script src="[^"]*/document-navigation\.js[^"]*" defer></script>\n'


def footer_link(link):
    match = re.fullmatch(r'<a([^>]+)>([^<]+)</a>', link)
    attrs, label = match.groups()
    compact = COMPACT_LABEL.get(label, "HOME")
    if ' aria-label=' not in attrs:
        attrs += f' aria-label="{label}"'
    return (
        f'<a{attrs}><span class="home-legal__full">{label}</span>'
        f'<span class="home-legal__compact" aria-hidden="true">{compact}</span></a>'
    )


def migrate(html, site, label, filename, css_url):
    html = re.sub(STYLE_LINK, "", html)
    html, count = re.subn(
        r'^( *)</head>',
        f'    <link rel="stylesheet" href="{css_url}">\n' + r'\1</head>',
        html,
        flags=re.M,
    )
    if count != 1:
        raise ValueError("Expected one closing head tag")
    if ' data-document-frame>' in html:
        return html

    html = re.sub(OLD_SCRIPT, "", html, flags=re.M)
    body = re.search(r'<body\b([^>]*)>', html)
    main = re.search(r'^ *<main\b([^>]*)>(.*?)^ *</main>', html, re.M | re.S)
    file_label = re.search(r' data-file="([^"]+)"', main[1])
    nav = re.search(r'<nav class="document-nav"[^>]*>(.*?)</nav>', main[2], re.S)
    footer = re.search(r'<footer class="document-footer"[^>]*>(.*?)</footer>', main[2], re.S)

    if nav and footer:
        back = re.search(r'<a\s[^>]+>.*?</a>', nav[1], re.S)[0]
        body_content = main[2][nav.end():footer.start()].rstrip()
        links = re.findall(r'<a\s[^>]+>.*?</a>', footer[1], re.S)
    elif filename == "404.html":
        heading = re.search(r'<h1>(.*?)</h1>', main[2], re.S)
        paragraphs = textwrap.indent(textwrap.dedent(main[2][heading.end():]).strip(), " " * 12)
        body_content = f"""
        <section class="section">
          <header class="section-head"><h1 class="section-title">{heading[1]}</h1></header>
          <div class="body-lines">
{paragraphs}
          </div>
        </section>"""
        back = f'<a class="document-back" href="/" aria-label="Back to {escape(label)}">← Back</a>'
        root = "" if site == "kaizosha" else COMPANY
        links = [
            f'<a href="{root}/terms">Terms</a>',
            '<a href="/privacy">Privacy</a>',
            f'<a href="{root}/contact">Contact</a>',
        ]
    else:
        raise ValueError("Expected document navigation and footer")

    attrs = re.sub(r' id="main-content"| tabindex="-1"', "", main[1])
    attrs = re.sub(r' class="[^"]+"', ' class="main document-frame"', attrs)
    separator = '\n          <span aria-hidden="true">/</span>\n'
    related = separator.join(f"          {footer_link(link)}" for link in links)
    has_picker = "site-language.js" in html
    picker = '<span data-language-slot></span>' if has_picker else ""
    frame = f"""    <main{attrs}>
      <header class="home-toolbar document-toolbar">
        <span class="home-toolbar__file">[ {file_label[1]} ]</span>
        {back}
      </header>
      <div class="document-scroll" id="main-content" role="region" aria-label="Document content" tabindex="0">
        <div id="top" tabindex="-1"></div>{body_content}
      </div>
      <footer class="home-statusbar document-statusbar">
        <nav class="home-legal" aria-label="Related pages">
{related}
        </nav>
        <div class="document-statusbar__end">{picker}<span aria-hidden="true">EOF</span></div>
      </footer>
    </main>"""
    html = html[:main.start()] + frame + html[main.end():]
    body_attrs = body[1].replace(' id="top"', '')
    body_attrs = body_attrs.replace('data-page-family="error"', 'data-page-family="document"')
    return html[:body.start()] + f"<body{body_attrs} data-document-frame>" + html[body.end():]


def main():
    parser = argparse.ArgumentParser(description="Sync the public document frame across the Kaizōsha site repos.")
    parser.add_argument("--workspace", type=Path, default=SOURCE.parent, help="parent directory of the sibling site repos")
    parser.add_argument("--check", action="store_true", help="report out-of-date output without writing files")
    args = parser.parse_args()
    css = (SOURCE / "assets/styles/document-frame.css").read_bytes()
    version = hashlib.sha256(css).hexdigest()[:12]
    outputs = {}

    for site, label in SITES.items():
        root = args.workspace / f"{site}-web"
        filenames = ["privacy.html", "404.html"]
        if site in {"kaizosha", "i"}:
            filenames += ["terms.html", "contact.html"]
        if site == "i":
            root /= "teaser"
        css_path = "document-frame.css" if site == "i" else "assets/styles/document-frame.css"
        outputs[root / css_path] = css
        for filename in filenames:
            page = root / filename
            try:
                rendered = migrate(page.read_text(encoding="utf-8"), site, label, filename, f"/{css_path}?v={version}")
            except (OSError, ValueError, TypeError, AttributeError) as error:
                parser.error(f"{page}: {error}")
            outputs[page] = rendered.encode("utf-8")

    out_of_date = False
    for path, content in outputs.items():
        if path.exists() and path.read_bytes() == content:
            continue
        out_of_date = True
        print(f"{'Out of date' if args.check else 'Updated'}: {path}")
        if not args.check:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
    return int(args.check and out_of_date)


if __name__ == "__main__":
    raise SystemExit(main())
