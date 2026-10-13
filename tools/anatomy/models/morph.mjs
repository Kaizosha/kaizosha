import { appFrame } from '../screen-frame.mjs';

export function buildModel(k) {
  const frame = appFrame(k, { kind: 'browser', title: 'Morph in Safari' });
  return {
    ...frame,
    kind: 'browser',
    label: 'Morph in Safari. An original sample article beside the real live editor, with a page-change prompt, agent activity, and Undo and Keep draft decisions.',
    parts: [...frame.parts, 'Safari address field', 'Sample article', 'Article summary', 'Morph live editor', 'Model routing field', 'Page change prompt', 'Agent activity', 'Draft decision row'],
    identity: {
      app: 'Morph',
      platform: 'Safari',
      sources: ['Morph Extension/Resources/live.html', 'Morph Extension/Resources/live.css', 'Morph Extension/Resources/live.js', 'Morph Extension/Resources/content.js'],
      regions: ['browser-toolbar', 'article', 'live-editor', 'routing', 'prompt', 'activity', 'decision']
    },
    screen: `<section class="morph-screen" data-app-name="Morph" aria-label="Morph sample Safari page">
      <header class="morph-browser-toolbar" data-app-region="browser-toolbar">
        <span class="morph-browser-nav" aria-hidden="true">‹ ›</span>
        <span class="morph-address"><span aria-hidden="true">⌑</span> coast-journal.example</span>
        <span class="app-sample-badge">SAMPLE PAGE</span>
      </header>
      <div class="morph-page">
        <article class="morph-article" data-app-region="article">
          <div class="morph-publication"><span>COAST JOURNAL</span><span>Issue 04</span></div>
          <div class="morph-article-art" aria-hidden="true"><svg viewBox="0 0 360 130"><rect class="article-sky" width="360" height="130"/><circle class="article-sun" cx="271" cy="35" r="15"/><path class="article-sea" d="M0 65C92 50 218 75 360 59V130H0Z"/><path class="article-shore" d="M0 41C39 51 93 62 126 91L163 130H0Z"/><path class="article-waterline" d="M171 85C226 75 280 91 343 79M199 107C241 99 306 114 354 102"/></svg></div>
          <p class="morph-article-category">FIELD NOTES · 4 MIN READ</p>
          <h4 data-model-text="articleTitle">A slower way to see the coast</h4>
          <p class="morph-article-deck" data-model-text="articleDeck">An afternoon on the path above the water.</p>
          <p class="morph-article-body" data-model-text="articleBody">We left the car by the old harbor and took the narrow path along the cliffs. Every bend opened a different view. With no schedule to keep, we stopped to listen to the waves.</p>
          <div class="morph-article-summary" data-model-region="editedSummary" hidden><span>AT A GLANCE</span><p>Walk from the old harbor.<br>Follow the cliff path.<br>Leave time to stop.</p></div>
          <p class="morph-article-byline">Words by Alex Morgan · October 12</p>
        </article>
        <aside class="morph-editor" data-app-region="live-editor" aria-label="Morph live editor sample">
          <header class="morph-editor-header"><span class="morph-mark" aria-hidden="true">M</span><span class="morph-identity"><strong>Morph</strong><small data-model-text="editorStatus">Ready</small></span><span class="morph-window-actions" aria-hidden="true">… − ×</span></header>
          <div class="morph-editor-body">
            <div class="morph-routing" data-app-region="routing"><span>Auto · Best available <span aria-hidden="true">⌄</span></span><span>□ Priority</span></div>
            <div class="morph-prompt-box" data-app-region="prompt"><small>Change this page…</small><p data-model-text="editPrompt">Make the title clearer and add a short summary.</p><div class="morph-prompt-actions"><span aria-hidden="true">⌘↵</span><button type="button" disabled class="morph-edit-label" data-model-action="edit">Edit</button></div></div>
            <div class="morph-activity" data-app-region="activity"><span>Agent activity</span><p data-model-text="activity">Tell Morph what to change.</p></div>
            <div class="morph-decisions" data-app-region="decision" data-model-region="decision" hidden><button type="button" disabled data-model-action="undo">Undo</button><button type="button" disabled data-model-action="keep">Keep</button></div>
          </div>
        </aside>
      </div>
    </section>`
  };
}
