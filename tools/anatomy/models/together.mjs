export function buildModel() {
  return {
    kind: 'tv', body: '', projection: null,
    label: 'Together television with a coastal video, captions, language controls, and a two-foot stand.',
    parts: ['Television bezel', 'Two television feet', 'Local coastal video', 'Original caption layer', 'Translated caption layer', 'Playback timeline', 'On-screen language selector'],
    identity: {
      app: 'Together', platform: 'TV',
      sources: ['Together/Features/Video/Playback/Chrome/TogetherPlayerChrome+Controls.swift', 'Together/Features/Video/Playback/Chrome/TogetherPlayerChrome+CaptionMenus.swift', 'Together/Features/Video/Playback/Chrome/TogetherPlayerTimeline.swift', 'Documentation/Captions-Translation-Player.md'],
      regions: ['player', 'captions', 'timeline', 'languages']
    },
    screen: `<section class="together-screen" data-app-name="Together" aria-label="Together sample television">
      <div class="together-player" data-app-region="player">
        <video class="together-video" data-model-video muted playsinline preload="metadata" poster="/assets/media/together-coast.svg" aria-label="Coastal path and water sample video"><source src="/assets/media/together-coast.mp4" type="video/mp4"></video>
        <header class="together-topbar"><strong class="player-capsule">Together</strong><span class="app-sample-badge">LOCAL SAMPLE VIDEO</span></header>
        <div class="together-captions" data-app-region="captions" aria-live="off"><p class="together-caption-original" data-model-text="sourceCaption">The path follows the water.</p><p class="together-caption-translated" data-model-region="translatedCaption" data-model-text="translatedCaption" lang="es" hidden></p></div>
      </div>
      <div class="together-tv-chrome">
        <div class="together-timeline" data-app-region="timeline"><span data-model-text="elapsed">0:00</span><label class="screen-reader-only" for="together-seek">Sample video time</label><input id="together-seek" type="range" min="0" max="12" step=".1" value="0" data-model-action="time" aria-label="Sample video time in seconds" disabled><span data-model-text="remaining">−0:12</span></div>
        <div class="together-languages" data-app-region="languages"><span class="together-source">Source · English</span><label>Translation <select data-model-action="translation" aria-label="Caption translation" disabled><option value="off">Off</option><option value="es">Español</option><option value="ja">日本語</option></select></label><button type="button" data-model-action="play" data-model-icon-action aria-label="Play sample video" disabled><span data-model-text="playbackSymbol" aria-hidden="true">▶</span></button></div>
        <p class="together-media-status" data-model-text="mediaStatus" role="status">Sample ready to play.</p>
      </div>
    </section>`
  };
}
