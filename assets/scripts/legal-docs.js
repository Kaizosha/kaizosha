const tableOfContentsLinks = [...document.querySelectorAll(".toc-link")];
const documentSections = [...document.querySelectorAll(".section")];

function setActiveSection(id) {
  tableOfContentsLinks.forEach((link) => {
    const active = link.dataset.section === id;
    link.dataset.active = String(active);
    if (active) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateActiveFromScroll() {
  if (!documentSections.length) return;

  const marker = window.scrollY + 120;
  let current = documentSections[0];
  const hashTarget = location.hash
    ? documentSections.find(
        (section) => section.id === decodeURIComponent(location.hash.slice(1))
      )
    : null;

  for (const section of documentSections) {
    if (section.offsetTop <= marker) {
      current = section;
    } else {
      break;
    }
  }

  if (window.scrollY < 40) {
    current = documentSections[0];
  }

  if (hashTarget) {
    const bounds = hashTarget.getBoundingClientRect();
    if (bounds.top >= 0 && bounds.top <= window.innerHeight - 64) {
      current = hashTarget;
    }
  }

  setActiveSection(current.id);
}

document.querySelectorAll(".entry-head-clickable").forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    const target = document.getElementById(button.getAttribute("aria-controls"));
    const nextExpanded = !expanded;
    const toggle = button.querySelector(".job-toggle");

    button.setAttribute("aria-expanded", String(nextExpanded));
    if (target) {
      target.hidden = !nextExpanded;
    }
    if (toggle) {
      toggle.textContent = nextExpanded ? "[-]" : "[+]";
    }
  });
});

window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
window.addEventListener("hashchange", updateActiveFromScroll);
window.addEventListener("resize", updateActiveFromScroll);
updateActiveFromScroll();
