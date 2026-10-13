export function buildModel() {
  return {
    kind: 'monitor', body: '', projection: null,
    label: 'Hush desktop monitor with a sample document, spoken note, seeing and listening indicators, and an activity feed.',
    parts: ['Monitor bezel', 'Monitor pedestal', 'Monitor base', 'Sample desktop document', 'Hush activity orb', 'Seeing indicator', 'Listening waveform', 'Observation feed', 'Local model picker'],
    identity: {
      app: 'Hush', platform: 'macOS',
      sources: ['Hush/Workspace/WorkspaceView.swift', 'Hush/Chat/ChatView.swift', 'Hush/Chat/MessageView.swift', 'Hush/Domain/ModelRecord.swift'],
      regions: ['desktop', 'activity', 'model-picker', 'feed']
    },
    screen: `<section class="hush-screen" data-app-name="Hush" aria-label="Hush sample desktop activity monitor">
      <div class="hush-desktop" data-app-region="desktop">
        <div class="hush-desktop-bar"><span>● ● ●</span><strong>Desk · local sample</strong><span data-model-text="activityTime">09:41</span></div>
        <div class="hush-document"><div class="hush-document-bar"><span>◫</span><span data-model-text="documentApp">Notes</span><span>⋯</span></div><div class="hush-document-body"><small data-model-text="documentLabel">DOCUMENT</small><h4 data-model-text="documentTitle">Launch review notes</h4><p data-model-text="documentBody">Bring the release checklist to the 10:00 review.</p><p class="hush-document-detail" data-model-text="documentDetail">Owners and follow-up still need to be decided.</p></div></div>
        <section class="hush-activity" data-app-region="activity" aria-label="Hush sample activity view"><div class="hush-activity-header"><span class="hush-orb" aria-hidden="true">◉</span><strong>hush</strong><span class="app-sample-badge">SAMPLE ACTIVITY</span></div><div class="hush-signals"><span data-model-signal="seeing">◉ Seeing</span><span data-model-signal="listening">▂▆▃▇ Listening</span></div><p data-model-text="heardText">No spoken note yet.</p><p class="hush-summary" data-model-text="summary">Play to follow the sample activity.</p><div class="hush-model-picker" data-app-region="model-picker">◇ <span data-model-text="modelName">Apple On-Device</span></div></section>
      </div>
      <div class="hush-feed" data-app-region="feed"><strong>Observation feed</strong><span data-model-text="feed">Sample ready · no live capture</span></div>
    </section>`
  };
}
