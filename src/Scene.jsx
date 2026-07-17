// PAGE ONE of the scrapbook — "meet mini mri", the design origin story.
//
// RECOVERED, not rewritten. This file was written 25 June 2026 and deleted in
// the lotus rebuild before `git init` (9 July), so it exists in no commit; it
// was reconstructed verbatim from the session transcripts by replaying its
// Write + Edit chain and checking the result against the full-file Read
// snapshot taken 1 July. Treat it as an artifact: if you change the art,
// change it deliberately.
//
// The only edit made during restoration: `onOpen` used to open the retired
// ArchivePanel drawer. The profile it promised is now a real place, so the
// PROFILE.TXT tab and the "pull for profile" note navigate to #/design.
//
// The stage is 1700x956 with `--u = 100cqw/1700`, so every Figma-space
// coordinate below scales to the viewport untouched.
export default function Scene({ onOpen }) {
  return (
    <section className="sheet sheet-one">
      <div className="nw-stage">
        <div className="scene">
          {/* All hand-drawn line art lives in one overlaid SVG */}
          <svg className="lines" viewBox="0 0 1700 956" preserveAspectRatio="none">
            <defs>
              <marker id="arrow" viewBox="0 0 12 12" refX="8" refY="6" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                <path d="M2,2 L9,6 L2,10" fill="none" stroke="#1c1c1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
              <marker id="arrowThin" viewBox="0 0 12 12" refX="8" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M2,2 L9,6 L2,10" fill="none" stroke="#9b9488" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>

            <path className="fade" style={{ "--d": ".25s" }}
              d="M0,566 C70,524 132,522 188,558 C244,594 300,600 348,566 C386,540 404,498 411,452"
              fill="none" stroke="#1c1c1a" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="4 13" />

            <path className="draw" style={{ "--d": ".75s" }} pathLength="1"
              d="M582,408 C632,398 656,368 690,368 C726,368 742,340 776,344 C812,348 826,392 800,406 C776,418 758,384 788,368 C822,350 854,386 838,416 C824,442 790,430 792,402 C794,372 822,356 856,360 C898,366 906,328 944,326 C982,324 1014,344 1042,346 C1066,348 1080,350 1090,352"
              fill="none" stroke="#1c1c1a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />

            <path className="draw" style={{ "--d": "2.05s" }} pathLength="1"
              d="M1272,372 C1346,392 1414,438 1486,486"
              fill="none" stroke="#1c1c1a" strokeWidth="2.6" strokeLinecap="round" markerEnd="url(#arrow)" />

            <path className="fade" style={{ "--d": "2.5s" }}
              d="M1540,318 C1566,312 1592,300 1604,282"
              fill="none" stroke="#9b9488" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrowThin)" />

            <path className="dot scrib" style={{ "--d": "1.55s" }} d="M692,361 C697,360 699,366 697,371 C695,376 688,377 684,373 C681,370 682,363 687,361 C692,359 697,361 699,366" />
            <path className="dot scrib" style={{ "--d": "1.72s" }} d="M840,409 C845,408 847,414 845,419 C843,424 836,425 832,421 C829,418 830,411 835,409 C840,407 845,409 847,414" />
            <path className="dot scrib" style={{ "--d": "1.89s" }} d="M946,319 C951,318 953,324 951,329 C949,334 942,335 938,331 C935,328 936,321 941,319 C946,317 951,319 953,324" />
            <path className="dot scrib" style={{ "--d": "2.06s" }} d="M1044,339 C1049,338 1051,344 1049,349 C1047,354 1040,355 1036,351 C1033,348 1034,341 1039,339 C1044,337 1049,339 1051,344" />
          </svg>

          <div className="copy copy-top rise" style={{ "--d": ".3s" }}>
            meet mini mri.<br />
            tiny, curious and an eye for art.<br />
            If something looked cool, she noticed.<br />
            By the time she was 12,<br />
            the signs had aligned.
          </div>

          <div className="micro micro-left rise" style={{ "--d": ".55s" }}>11 years old: Starter</div>
          <div className="micro micro-right rise" style={{ "--d": "1.35s" }}>15 years old: Creator</div>

          <div className="mount mount-left rise" style={{ "--d": ".45s" }}>
            <div className="polaroid"><div className="slot">[image 1]
              <span className="corner tl" /><span className="corner tr" />
              <span className="corner bl" /><span className="corner br" />
            </div></div>
          </div>
          <div className="mount mount-right rise" style={{ "--d": "1.1s" }}>
            <div className="polaroid"><div className="slot">[image 2]
              <span className="corner tl" /><span className="corner tr" />
              <span className="corner bl" /><span className="corner br" />
            </div></div>
          </div>

          <div className="milestone fade" style={{ left: "calc(690 * var(--u))", top: "calc(386 * var(--u))", "--d": "1.7s" }}>first video</div>
          <div className="milestone fade" style={{ left: "calc(838 * var(--u))", top: "calc(434 * var(--u))", "--d": "1.87s" }}>100 subs</div>
          <div className="milestone fade" style={{ left: "calc(944 * var(--u))", top: "calc(344 * var(--u))", "--d": "2.04s" }}>aesthetic era</div>
          <div className="milestone fade" style={{ left: "calc(1042 * var(--u))", top: "calc(364 * var(--u))", "--d": "2.21s" }}>600 followers</div>

          <button className="pull fade" style={{ "--d": "2.45s" }} onClick={onOpen}>pull for profile</button>

          <div className="copy copy-bottom rise" style={{ "--d": ".9s" }}>
            After mastering the art of growing an audience<br />
            with just a little flair, she probably thought<br />
            she&rsquo;d cracked it.<br />
            <span className="punch">That&rsquo;s when it clicked, maybe this was half the game.</span>
          </div>

          <button className="archive-tab rise" style={{ "--d": ".6s" }} onClick={onOpen} aria-label="Open the design portfolio">
            <span>PROFILE.TXT</span>
          </button>
        </div>
      </div>
    </section>
  );
}
