import { appFrame } from '../screen-frame.mjs';

export function buildModel(k) {
  const frame = appFrame(k, { kind: 'tablet', title: 'Together' });
  return {
    ...frame,
    kind: 'tablet',
    label: 'Together on iPad. A sample coastal video with original captions, optional Spanish translation, playback controls, and a twelve-second timeline.',
    parts: [...frame.parts, 'Local video picture', 'Player control capsules', 'Original caption layer', 'Translated caption layer', 'Playback timeline', 'Source language pill', 'Translation language pill'],
    identity: {
      app: 'Together',
      platform: 'iPadOS',
      sources: [
        'Together/Features/Video/Playback/Chrome/TogetherPlayerChrome+Controls.swift',
        'Together/Features/Video/Playback/Chrome/TogetherPlayerChrome+CaptionMenus.swift',
        'Together/Features/Video/Playback/Chrome/TogetherPlayerTimeline.swift',
        'Documentation/Captions-Translation-Player.md'
      ],
      regions: ['player', 'captions', 'timeline', 'languages']
    },
    screen: `<section class="together-screen" data-app-name="Together" aria-label="Together sample iPad player">
      <div class="together-player" data-app-region="player">
        <svg class="together-video" viewBox="0 0 640 380" role="img" aria-label="Original sample scene of a coastal path above the water">
          <rect class="coast-sky" width="640" height="380"/>
          <circle class="coast-sun" cx="438" cy="88" r="30"/>
          <path class="coast-distant" d="M0 182 79 153 147 165 224 137 304 161 357 147 427 183 640 177V380H0Z"/>
          <path class="coast-water" d="M0 198C104 179 160 205 250 189S459 198 640 184V380H0Z"/>
          <path class="coast-wave" d="M255 219C342 208 418 228 515 215M293 243C398 230 504 252 614 237M349 270C434 260 524 278 622 266M409 302C481 294 548 310 633 297"/>
          <path class="coast-cliff" d="M0 125C91 152 143 181 156 222S182 265 245 294L302 380H0Z"/>
          <path class="coast-grass" d="M0 115C92 149 120 164 132 199S176 230 185 257L244 284 273 329C184 307 123 277 78 249L0 220Z"/>
          <path class="coast-path" d="M0 156C80 176 91 194 109 223S159 253 191 276 216 313 235 333L278 380H233L203 345C169 308 151 300 127 281S68 251 50 222 24 201 0 195Z"/>
          <path class="coast-plants" d="m18 124 5-19 8 23m17 8 5-23 8 27m37 23 7-17 4 20m42 24 5-12 6 16m33 40 6-13 5 17"/>
          <path class="coast-birds" d="m310 104 7-3 7 3m29 14 5-2 5 2"/>
        </svg>
        <header class="together-topbar">
          <span class="player-capsule together-app-title">Together</span>
          <span class="app-sample-badge">SAMPLE VIDEO</span>
          <span class="player-capsule together-window-symbol" aria-hidden="true">↗</span>
        </header>
        <div class="together-transport" aria-label="Sample playback controls">
          <span class="player-capsule player-skip" aria-hidden="true">↶<small>10</small></span>
          <button type="button" disabled class="player-capsule player-play" data-model-action="play" data-model-icon-action aria-label="Play sample video"><span data-model-text="playbackSymbol" aria-hidden="true">▶</span><span class="screen-reader-only" data-model-text="playbackState">Paused</span></button>
          <span class="player-capsule player-skip" aria-hidden="true">↷<small>10</small></span>
        </div>
        <div class="together-captions" data-app-region="captions">
          <p class="together-caption-original" data-model-text="sourceCaption">The path follows the water.</p>
          <p class="together-caption-translated" data-model-region="translatedCaption" data-model-text="translatedCaption" hidden>El sendero sigue el agua.</p>
        </div>
        <div class="together-video-info"><span>Coast walk</span><span>LOCAL SAMPLE · 12 s</span></div>
      </div>
      <div class="together-timeline" data-app-region="timeline" aria-label="Sample video timeline">
        <span data-model-text="elapsed">0:00</span>
        <progress data-model-progress="playbackProgress" max="12" value="0" aria-label="Sample playback position">0 of 12 seconds</progress>
        <span data-model-text="remaining">−0:12</span>
      </div>
      <div class="together-languages" data-app-region="languages">
        <span class="together-language"><small>Source</small><strong>English</strong><span aria-hidden="true">⌄</span></span>
        <span class="together-language"><small>Translation</small><strong data-model-text="translationLanguage">Off</strong><span aria-hidden="true">⌄</span></span>
      </div>
    </section>`
  };
}
