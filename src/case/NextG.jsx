// NEXTG APEX — "Every outlet, one growth engine."
//
// The only project on this site whose design system IS this site's design
// system: her type slide says "One family across display, body and labels.
// JetBrains Mono is held back for data readouts only", and that family is
// Archivo — the portfolio's own display face. Her twelve colour tokens are in
// themes.css under their own names. Nothing here is a stand-in for anything.
//
// The rhythm is her board's: a numbered mono pill, a big Archivo line, then
// EVIDENCE — a product view, a map, a photograph of the shop the map is about.
// The two navy bands are where her own deck goes dark, not where a page wanted
// variety.
import {
  Bleed,
  Chapter,
  Columns,
  Credit,
  Figures,
  Note,
  Plate,
  Pull,
  Rail,
  Reveal,
  Run,
  Say,
  Slide,
  Split,
  Statement,
  Sticky,
  Swatches,
} from "./parts.jsx";
import { size } from "./art.js";

const F = (n) => `/work/nextg/${n}.webp`;

/** her own token file, as she prints it on the colour slide */
const TOKENS = [
  { hex: "#0C1B33", name: "ink" },
  { hex: "#0A1F44", name: "navy" },
  { hex: "#1D4ED8", name: "blue" },
  { hex: "#1740A8", name: "blue-strong" },
  { hex: "#3D6E9E", name: "steel" },
  { hex: "#1F7A4D", name: "green" },
  { hex: "#45526A", name: "ink-2" },
  { hex: "#586273", name: "ink-3" },
  { hex: "#6E7689", name: "ink-4" },
  { hex: "#E7EDFB", name: "blue-soft", ink: "#0c1b33" },
  { hex: "#EAEEF3", name: "paper-2", ink: "#0c1b33" },
  { hex: "#F4F6F9", name: "paper", ink: "#0c1b33" },
];

/** her type scale, off the same slide — the numbers are hers */
const SCALE = [
  ["H1", "96px", "Archivo Bold", "−3.5%"],
  ["H2", "40px", "Archivo Bold", "−2.8%"],
  ["H3", "19px", "Archivo SemiBold", "−1.0%"],
  ["Body", "17px", "Archivo Regular", "0"],
];

const VIEWS = [
  ["f-coverage", "Coverage map — 98% coverage, 900+ towns, 512K outlets"],
  ["f-services", "Everything the field needs, in one loop"],
  ["f-brands", "Brands built with NextG"],
  ["f-leadership", "Built by leaders. Driven by execution."],
  ["f-demo", "Book a demo — three unasked questions, answered"],
  ["f-other-views", "Execution, live intelligence, field ops"],
];

/** BoardVideo is CaseWindow's, for a video that lives inside an export's white
    hole. Here the recording is the evidence itself, so it is a plain element
    with its own poster — same preload discipline, no coordinate maths. */
function BuildVideo() {
  return (
    <Reveal as="figure" from="in" className="pp-plate pp-video">
      <span className="pp-plate-box">
        <video
          src="/work/nextg/landing.mp4"
          poster="/work/nextg/landing-poster.webp"
          muted
          loop
          playsInline
          controls
          preload="none"
          aria-label="Screen recording of the NextG landing page, built in hand-written HTML, CSS and JavaScript."
        />
      </span>
      <figcaption>
        The landing page, running. Six static pages, no framework — the code she wrote.
      </figcaption>
    </Reveal>
  );
}

export default function NextG() {
  return (
    <>
      <Chapter n="02" label="Project overview" flush>
        <Split ratio="1.15fr 0.85fr" gap="48px">
          <div>
            <Statement size="lg">
              Half a million outlets, and nobody believed the number.
            </Statement>
            <Say>
              NextG runs field sales for FMCG brands across half a million Indian outlets.
              Their ten-year-old site looked like every other B2B tool, so nobody believed
              the scale. I rebuilt it end to end — structure, interface, design system, and
              the front-end code.
            </Say>
            <Say>
              The old site claimed &ldquo;nationwide coverage&rdquo; over a stock photo and
              gave a buyer nothing to check. Buyers in this category verify before they book
              a call.
            </Say>
          </div>
          <Plate
            src={F("cover")}
            alt="The NextG Apex case study cover: the rebuilt site on a laptop, outdoors on a rock."
            size={size(F("cover"))}
            from="right"
            depth={20}
            caption="The site, as shipped."
          />
        </Split>
      </Chapter>

      <Chapter n="03" label="The brief">
        <Statement size="lg">A brief in two halves.</Statement>
        <Split ratio="1fr 1fr" gap="28px">
          <Reveal className="pp-card">
            <h4>The CEO</h4>
            <p>
              A site people keep scrolling. He had watched the old one lose visitors inside
              the first screen.
            </p>
          </Reveal>
          <Reveal className="pp-card" delay={0.08}>
            <h4>The CTO</h4>
            <p>
              The opposite discipline: state the phygital proposition without ambiguity.
              Prospects kept filing NextG under &ldquo;distributor&rdquo; or &ldquo;another
              dashboard&rdquo;, and a ten-year-old site with no design system behind it gave
              them nothing to correct that with.
            </p>
          </Reveal>
        </Split>
        <Pull>
          The design goal became clear: spectacle and clarity had to move on the same
          gesture, or it did not belong here.
        </Pull>
      </Chapter>

      <Chapter n="05" label="Audit" tone="wash">
        <Statement size="lg">
          I read the old site the way a sceptical buyer would.
        </Statement>
        <Say wide>
          Every place the argument stalled, written down. Most of it came back to the same
          thing: the site claimed scale and never showed it.
        </Say>
        <Columns
          groups={[
            {
              head: "What broke",
              items: [
                "Template card grids",
                "Stock photography",
                "Flat hierarchy",
                "Claimed scale, no proof",
                "Product never shown",
                "Nothing to verify",
              ],
            },
            {
              head: "What buyers needed",
              items: [
                "Scale in the first screen",
                "Numbers they can check",
                "To see the actual product",
                "Operator credibility",
                "One unambiguous CTA",
                "Parity on a phone",
              ],
            },
            {
              head: "What I did",
              items: [
                "Hero that DRAWS the coverage",
                "Numbered service list",
                "Four real product views",
                "Coverage carrying figures",
                "A demo page that transacts",
                "One shared token file",
              ],
            },
          ]}
        />
      </Chapter>

      <Chapter n="06" label="Decisions">
        <Sticky
          aside={
            <>
              <Statement size="md">Research to decisions.</Statement>
              <Say>
                Each insight paired with the thing it changed — so a reader can check the
                second against the first rather than taking the design on trust.
              </Say>
            </>
          }
        >
          <Reveal className="pp-card pp-card--solid">
            <h4>Insight #1</h4>
            <p>
              Buyers in this category verify before they book a call. The old site said
              &ldquo;nationwide coverage&rdquo; over a stock photo and gave them nothing to
              check.
            </p>
          </Reveal>
          <Reveal className="pp-card" delay={0.06}>
            <h4>Solution #1</h4>
            <p>
              Scale moved into the first screen — 500K+ outlets, 900+ towns, 20+ brands —
              under a hero that DRAWS the coverage instead of claiming it.
            </p>
          </Reveal>
          <Reveal className="pp-card pp-card--solid" delay={0.12}>
            <h4>Insight #2</h4>
            <p>
              Six pages of benefit copy and not one screen of the actual platform. The thing
              being sold was invisible until a sales call.
            </p>
          </Reveal>
          <Reveal className="pp-card" delay={0.18}>
            <h4>Solution #2</h4>
            <p>
              Four product views in one tabbed panel, halfway down the home page. The light
              column is what you control; the dark column is what is happening.
            </p>
          </Reveal>
        </Sticky>
      </Chapter>

      <Chapter n="07" label="Type &amp; colour">
        <Split ratio="0.9fr 1.1fr" gap="44px">
          <div>
            <Statement size="md">One family, held to four sizes.</Statement>
            <Say>
              Mono started out on every label. Wide-tracked uppercase mono is the house style
              of template design, so I pulled it back to genuine data readouts — counts,
              percentages, coordinates — and let Archivo carry the editorial voice.
            </Say>
            <Note>
              The scale below is set in the real face, at her real tracking. Archivo and
              JetBrains Mono are also this portfolio&rsquo;s own two typefaces, which is why
              this page needed no new font at all.
            </Note>
          </div>
          <ul className="pp-scale">
            {SCALE.map(([step, px, fam, track], i) => (
              <Reveal as="li" key={step} delay={i * 0.05}>
                <span className="pp-scale-step" data-step={step}>
                  {step}
                </span>
                <span className="pp-scale-spec">
                  <b>{px}</b>
                  {fam}
                  <i>tracking {track}</i>
                </span>
              </Reveal>
            ))}
          </ul>
        </Split>
        <Note>Seventeen colours in one token file that every page reads. Twelve of them:</Note>
        <Swatches items={TOKENS} />
      </Chapter>

      <Chapter n="08" label="The product">
        <Statement size="lg">Designing the product, not just the page.</Statement>
        <Say wide>
          Four views of the platform — coverage, execution, live intelligence, field ops.
          Each one is a real panel. Every panel splits the same way: a white column you
          control, and a near-black column you watch.
        </Say>
        <Plate
          src="/work/nextg/art/coverage.webp"
          alt="The coverage map panel: 98% coverage, 900+ towns live, 512K outlets mapped, over a live map."
          size={size("/work/nextg/art/coverage.webp")}
          depth={16}
          caption="The numbers move with the view. Not a screenshot of a dashboard — the dashboard's own argument."
        />
        <Rail kind="wide" label="The site" count={`${VIEWS.length} views`}>
          {VIEWS.map(([n, cap]) => (
            <Slide key={n} src={F(n)} alt={`NextG — ${cap}.`} size={size(F(n))} caption={cap} />
          ))}
        </Rail>
      </Chapter>

      <Bleed
        src="/work/nextg/art/shop.webp"
        alt="A NextG field rep and a shopkeeper at the counter of a general store."
        h="short"
        depth={28}
      >
        <Statement size="lg" as="p">
          Every dot on the coverage map is one of these.
        </Statement>
        <Say>
          The product&rsquo;s job is to make this visible from a desk twelve hundred
          kilometres away.
        </Say>
      </Bleed>

      <Chapter n="12" label="Responsive" flush>
        <Split ratio="1fr 1fr" middle gap="44px">
          <div>
            <Statement size="lg">Drawn at 390 and 1600 at the same time.</Statement>
            <Say>
              Nothing here was designed for desktop and then squeezed. The phone layout was
              drawn in the same file, at the same time, and the rules below are the ones that
              keep the two in step.
            </Say>
            <Columns
              groups={[
                {
                  head: "The rules",
                  items: [
                    "Type scales, it does not step",
                    "The hero measures the visible viewport, not the screen",
                    "Layouts change job, not just width",
                    "Touch gets a cheaper render",
                  ],
                },
              ]}
            />
          </div>
          <Plate
            src={F("f-phones")}
            alt="Four NextG pages at 390px: home, coverage, the engine, and the dark map."
            size={size(F("f-phones"))}
            from="right"
            depth={18}
          />
        </Split>
      </Chapter>

      <Chapter n="13" label="Build" tone="navy">
        <Statement size="lg">I shipped the front-end as well.</Statement>
        <Say wide>
          Six static pages of hand-written HTML, CSS and JavaScript. No framework. The code
          made the design decision real — I never had to hand a spec to someone else.
        </Say>
        <BuildVideo />
        <Columns
          groups={[
            {
              head: "Size",
              items: ["Six static pages", "No framework", "One token file every page reads"],
            },
            {
              head: "Performance",
              items: [
                "Device pixel ratio capped",
                "Capped again on touch",
                "Rendering stops outright when the tab is hidden",
              ],
            },
            {
              head: "Accessibility",
              items: [
                "prefers-reduced-motion freezes the WebGL",
                "Contrast was the design decision, not a fix",
                "Focus reaches every control from the keyboard",
              ],
            },
          ]}
        />
      </Chapter>

      <Chapter n="14" label="Results" tone="navy" flush>
        <Statement size="xl">
          Designed and built end to end. Six pages, one system, no framework.
        </Statement>
        <Figures
          items={[
            { value: "500,000", label: "outlets the site had to make legible" },
            { value: "6", label: "pages, designed and built end to end" },
            { value: "17", label: "colours in the one token file every page reads" },
          ]}
        />
        <Credit>NextG Apex — website design &amp; front-end, June 2026</Credit>
      </Chapter>
    </>
  );
}
