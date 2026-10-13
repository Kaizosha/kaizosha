import { appFrame } from '../screen-frame.mjs';

export function buildModel(k) {
  const frame = appFrame(k, { kind: 'mac-window', title: 'Hush' });
  return {
    ...frame,
    kind: 'mac-window',
    label: 'Hush for Mac. Its workspace sidebar, model picker, welcome suggestions, selected sample context, conversation, and Message Hush composer.',
    parts: [...frame.parts, 'Workspace sidebar', 'Conversation history', 'Model picker', 'Welcome suggestions', 'Selected context card', 'Sample conversation', 'Message composer'],
    identity: {
      app: 'Hush',
      platform: 'macOS',
      sources: ['Hush/Workspace/WorkspaceView.swift', 'Hush/Chat/ChatView.swift', 'Hush/Chat/MessageView.swift', 'Hush/Domain/ModelRecord.swift'],
      regions: ['sidebar', 'model-picker', 'welcome', 'context', 'conversation', 'composer']
    },
    screen: `<section class="hush-screen" data-app-name="Hush" aria-label="Hush sample Mac workspace">
      <aside class="hush-sidebar" data-app-region="sidebar" aria-label="Hush workspace sidebar">
        <div class="hush-wordmark"><span class="hush-mark" aria-hidden="true">h</span><span>hush</span></div>
        <span class="hush-search"><span aria-hidden="true">⌕</span> Find a conversation</span>
        <ul class="hush-navigation" aria-label="Workspace pages">
          <li class="hush-selected"><span aria-hidden="true">▤</span> Chat</li>
          <li><span aria-hidden="true">⊞</span> Discover</li>
          <li><span aria-hidden="true">▱</span> My models</li>
          <li><span aria-hidden="true">◴</span> Runtime</li>
        </ul>
        <div class="hush-history">
          <span class="hush-eyebrow">Conversations</span>
          <p data-model-region="saved" hidden><span aria-hidden="true">▤</span> <span data-model-text="conversationTitle">Tomorrow's meeting</span></p>
          <p class="hush-fresh" data-model-region="welcome">A fresh start.</p>
        </div>
        <span class="hush-settings"><span aria-hidden="true">⚙</span> Settings</span>
      </aside>
      <div class="hush-chat">
        <header class="hush-toolbar" data-app-region="model-picker">
          <span class="hush-model-picker"><span aria-hidden="true">◇</span><span data-model-text="modelName">Apple On-Device</span><span aria-hidden="true">⌄</span></span>
          <span class="app-sample-badge">SAMPLE</span>
        </header>
        <div class="hush-chat-body">
          <div class="hush-welcome" data-app-region="welcome" data-model-region="welcome">
            <p class="hush-eyebrow">A private place for your ideas</p>
            <h4>A clearer space<br>to think.</h4>
            <div class="hush-suggestions">
              <span><span aria-hidden="true">☼</span><strong>Untangle an idea</strong><small>Find the clear next step</small></span>
              <span><span aria-hidden="true">✎</span><strong>Make it well written</strong><small>A first draft, a fresh angle</small></span>
              <span><span aria-hidden="true">▧</span><strong>Bring your context</strong><small>Read an image or document</small></span>
              <span><span aria-hidden="true">◇</span><strong>Find your model</strong><small>Explore the open ecosystem</small></span>
            </div>
          </div>
          <div class="hush-context" data-app-region="context" data-model-region="context">
            <span class="hush-context-icon" aria-hidden="true">▤</span>
            <div><span class="hush-document-chip" data-model-text="contextLabel">meeting-notes.txt</span><strong data-model-text="contextTitle">Tomorrow's meeting</strong><p data-model-text="contextBody">Tomorrow's meeting is at 10. Bring the draft and decide who will send the follow-up.</p></div>
          </div>
          <div class="hush-conversation" data-app-region="conversation" data-model-region="conversation" hidden>
            <div class="hush-message hush-user"><span>You</span><p data-model-text="prompt">Turn this note into a short meeting checklist.</p></div>
            <div class="hush-message hush-answer"><span>Hush <small>SAMPLE RESPONSE</small></span><p data-model-text="response">Meet at 10. Bring the draft. Choose one person to send the follow-up.</p></div>
          </div>
        </div>
        <footer class="hush-composer-region" data-app-region="composer">
          <p class="hush-chat-status" data-model-text="chatStatus">Review the sample context to begin.</p>
          <div class="hush-composer"><span class="hush-attach" aria-hidden="true">+</span><span data-model-text="composer">Message Hush…</span><button type="button" class="hush-send" data-model-action="ask" data-model-icon-action aria-label="Send the sample question" disabled>↑</button></div>
        </footer>
      </div>
    </section>`
  };
}
