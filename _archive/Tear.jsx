// The tear — one literal sheet of paper torn in two. The halves carry
// complementary jagged edges cut from the same tear line, so at rest they
// interlock and read as a single sheet; hovering a half pulls it away from
// the seam. The only place the dual identity is ever expressed.
export default function Tear() {
  return (
    <section className="tear">
      <p className="tear-note" aria-hidden="true">one sheet, two practices — tear where you&rsquo;re headed</p>

      <nav className="tear-sheet" aria-label="Choose a portfolio">
        <a className="tear-half tear-half--design" href="#/design">
          <span className="tear-frag-kicker">01</span>
          <span className="tear-frag-name">Design</span>
          <span className="tear-frag-sub">product &amp; visual design portfolio</span>
          <span className="tear-frag-cta">enter <span aria-hidden="true">↗</span></span>
        </a>

        <a className="tear-half tear-half--engineering" href="#/engineering">
          <span className="tear-frag-kicker">02</span>
          <span className="tear-frag-name">Engineering</span>
          <span className="tear-frag-sub">// software &amp; systems portfolio</span>
          <span className="tear-frag-cta">cd ./engineering</span>
        </a>
      </nav>
    </section>
  );
}
