// FUTUREPRENEURS 10.0 — the X Edition.
//
// The deck's single most identifiable habit is that every section is labelled
// like a closing tag: `<Brief\>`, `<System\>`, `<Feed\>`, `<Screen\>`. The
// page's section labels ARE that tag — drawn by CSS from the plain label, so
// the markup stays readable and a screen reader hears "Brief" rather than a
// mouthful of punctuation (themes.css, the Futurepreneurs block).
//
// ONE SYSTEM, FOUR MEDIA — not ten deliverables (20 Sep 2026). The page used to
// follow the deck's own running order, which is an inventory: About, Theme,
// Typography, Process, SocialmediaGrid, Instagramstories, Elements, Website,
// Printables, Results. Ten sections, several of them a single picture, and no
// argument anywhere — a list of things she made rather than a case for how she
// made them. Colour and type were one system described twice, the grid and the
// stories were both Instagram, and the laptop and the site were both the
// website. So: the brief, the system, how it was made, and then the system
// surviving contact with a feed, a screen and a sheet of paper. Seven sections,
// every picture kept, the deck's own words kept.
//
// EVERY PICTURE IS A NODE OF HER FIGMA FILE, not a piece of the exported deck:
// the TP monogram is her vector; the laptop, the phone, the three story phones
// and the stickers are her mockup nodes rendered on their own; the social grid,
// the event site and the hall are the original uploads. See
// scripts/build_figma_components.py for which node each one is.
//
// ONE HONEST SUBSTITUTION, flagged in the typography section: Whyte Inktrap is
// licensed and cannot be served here, so the display face is Archivo — this
// portfolio's own — named as the stand-in it is. Gantari is real.
import { ArrowUpRight } from "lucide-react";
import {
  Chapter,
  Columns,
  Credit,
  Decision,
  Figures,
  Marquee,
  Note,
  Plate,
  Pull,
  Reveal,
  Say,
  Scroller,
  Split,
  Statement,
  Swatches,
} from "./parts.jsx";
import { size } from "./art.js";

const F = (n) => `/work/futurepreneurs/fig/${n}.webp`;
const MARK = "/work/futurepreneurs/fig/mark.svg";

/** her theme slide, with her own names for the colours */
const THEME = [
  { hex: "#F59869", name: "Sorrell Brown", ink: "#16121f" },
  { hex: "#653BD8", name: "Slateblue" },
  { hex: "#000000", name: "Outer Space" },
  { hex: "#FFFFFF", name: "White", ink: "#16121f" },
];

const DELIVERABLES = [
  "Branding",
  "Website UI",
  "Social media grid",
  "Reels",
  "Aftermovie",
  "Brochures",
  "Stickers",
  "Band",
  "Invitations",
  "Story designs",
];

const STEPS = ["Research", "Ideate", "Wireframe", "UI Concept", "Design"];

export default function Futurepreneurs() {
  return (
    <>
      <Chapter n="01" label="Brief" tone="black" flush>
        <Split ratio="1.1fr 0.9fr" middle gap="44px">
          <div>
            <Statement size="lg">Vision Made Visible: elevating an ecosystem of innovation.</Statement>
            <Say>
              <b>The challenge.</b> To craft a comprehensive, 360-degree brand experience for
              Futurepreneurs 10.0 — an initiative dedicated to cultivating visionary thinking
              and immersing participants in the realities of the professional world.
            </Say>
            <Say>
              <b>My role.</b> Orchestrating the event&rsquo;s visual identity, digital
              presence, and tangible experience across all touchpoints. Total visual
              execution, from initial concept to post-event media.
            </Say>
          </div>
          {/* her vector, straight out of the file — it scales with nothing lost */}
          <Reveal as="figure" from="right" className="fp-mark">
            <img src={MARK} alt="The Futurepreneurs TP monogram, violet into apricot." width={371} height={371} />
          </Reveal>
        </Split>

        <ul className="pp-tags">
          {DELIVERABLES.map((d, i) => (
            <Reveal as="li" key={d} delay={i * 0.035}>
              {d}
            </Reveal>
          ))}
        </ul>
        <Note>Ten deliverables, one system. The flagship event of E-Cell, VIT Vellore.</Note>
      </Chapter>

      <Chapter n="02" label="System">
        <Split ratio="0.9fr 1.1fr" gap="44px">
          <div>
            <Statement size="lg">Four colours, and one of them does all the work.</Statement>
            <Say>
              Slateblue carries the identity; Sorrell Brown is the only warm thing in the
              system and is spent sparingly — on the closing card, on one block behind a
              phone, on a single word. Black and white do the rest.
            </Say>
            <Swatches items={THEME} />
            <Decision
              className="fp-dec"
              what="One warm colour, spent three times."
              why="Slateblue carries the identity and black and white do the rest. Sorrell Brown appears on the closing card, on one block behind a phone, and on a single word — which is what makes it mean something when it appears."
              cost="A palette this disciplined has nothing left to escalate with. Emphasis has to come from scale and from the mesh."
            />
          </div>
          <Plate
            bare
            src={F("phone")}
            alt="The Futurepreneurs site on an iPhone, tilted over a yellow block: the countdown and Register."
            size={size(F("phone"))}
            from="right"
            depth={22}
          />
        </Split>

        <Split ratio="1fr 1fr" gap="40px">
          <div>
            <Statement size="md">Whyte Inktrap, Gantari, Almarai.</Statement>
            <Say>
              An inktrap grotesque for display, Gantari Medium for body, Almarai Regular for
              the long-form panels. The ink traps are the point: at poster size they read as
              deliberate engineering rather than as a default.
            </Say>
          </div>
          <Columns
            groups={[
              {
                head: "Where each one runs",
                items: [
                  "Whyte Inktrap — posters, titles, the mark",
                  "Gantari Medium — body, captions, UI",
                  "Almarai Regular — the long-form panels",
                ],
              },
            ]}
          />
        </Split>
        <Note>
          Whyte Inktrap is licensed and cannot be served on this site, so this page sets
          Archivo — the portfolio&rsquo;s own display face, a grotesque of the same build —
          in its place. Gantari is here, and is real: every paragraph on this page is set in
          it.
        </Note>
      </Chapter>

      <Chapter n="03" label="Process" tone="black" flush>
        <Statement size="lg">Five steps, and the brand was decided in the second one.</Statement>
        <ol className="pp-steps">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s} delay={i * 0.07}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {s}
            </Reveal>
          ))}
        </ol>
      </Chapter>

      <Marquee>10 YEARS OF FUTUREPRENEURS ·</Marquee>

      <Chapter n="04" label="Feed" flush>
        <Split ratio="0.8fr 1.2fr" gap="44px">
          <div className="fp-sticky-copy">
            <Statement size="lg">A grid that had to survive being seen one tile at a time.</Statement>
            <Say>
              An Instagram grid is read two ways at once: as a wall, and as a single post in
              somebody&rsquo;s feed three weeks apart. Every tile carries the mark, the
              edition and one fact — the aftermovie, the winners, the prize pool, the
              sponsor, the venue, the partner — so it works alone, and the mesh underneath
              makes it one composition when you open the profile.
            </Say>
            <Columns
              groups={[
                {
                  head: "The timeline",
                  items: [
                    "Sept 25 — registrations open",
                    "Oct 2 — registrations close",
                    "Oct 3 — qualification round",
                    "Oct 5 — Futurepreneurs begins",
                  ],
                },
              ]}
            />
          </div>
          <Plate
            src={F("social")}
            alt="The Futurepreneurs social grid: aftermovie, winners, prize pool, official sponsor, the event card, official partner, and the timeline poster."
            size={size(F("social"))}
            depth={12}
          />
        </Split>

        <Statement size="md">Registrations are now open.</Statement>
        <Say wide>
          The story set does one job per frame: the site is live, registrations are open,
          and here is exactly how to register — a QR a thumb can reach, on the mesh that
          ties it back to everything else.
        </Say>
        <Plate
          bare
          src={F("stories")}
          alt="Three Futurepreneurs Instagram stories on phones: the website is live, registrations are now open, and how to register."
          size={size(F("stories"))}
          depth={14}
        />
      </Chapter>

      <Chapter n="05" label="Screen" tone="black">
        <Split ratio="1.25fr 0.75fr" gap="40px">
          <Scroller
            src={F("site-desktop")}
            alt="The Futurepreneurs X Edition event site, full length: the countdown, the business simulation game, the timeline, ten years, the FAQs and the footer."
            size={size(F("site-desktop"))}
            label="futurepreneurs.ecellvit"
            caption="The whole site — scroll it."
          />
          <div className="fp-site-side">
            <Statement size="md">A countdown, and then the answers.</Statement>
            <Say>
              The site has one job on launch day and a different one the week after. First:
              a live countdown and a register button. Then, as the date closes in, it has to
              answer a stranger&rsquo;s questions — what the simulation is, who runs it, when
              the rounds are — so the FAQ is part of the page rather than a link off it.
            </Say>
            <Scroller
              kind="phone"
              src={F("site-mobile")}
              alt="The same site at phone width, full length."
              size={size(F("site-mobile"))}
              delay={0.1}
            />
            <Pull>We breed business.</Pull>
          </div>
        </Split>

        <Plate
          src={F("laptop")}
          alt="A detail of the Futurepreneurs event timeline on a laptop: qualifier round 08 Oct, qualifier results 12 Oct, and D-Day 16 Oct."
          size={size(F("laptop"))}
          depth={16}
          className="fp-laptop"
          caption="A detail of the timeline, off her deck: every date a card, D-Day given the illustration."
        />
      </Chapter>

      <Chapter n="06" label="Print">
        <Statement size="lg">The things people took home.</Statement>
        <Say wide>
          The same system, printed: die-cut stickers, the invitation, the certificates. A
          brand that only exists on a screen has not been tested — these had to survive a
          printer, a foil and a lanyard.
        </Say>
        <div className="fp-print">
          <Plate
            bare
            src={F("invitation")}
            alt="The Futurepreneurs invitation letter, bordered in violet."
            size={size(F("invitation"))}
            className="fp-print-inv"
            depth={10}
          />
          <Plate
            bare
            src={F("certificate")}
            alt="The Futurepreneurs certificate of merit for third place."
            size={size(F("certificate"))}
            className="fp-print-cert"
            delay={0.08}
            depth={22}
          />
          <Plate
            bare
            src={F("sticker-1")}
            alt="A die-cut sticker of the TP monogram, X Edition."
            size={size(F("sticker-1"))}
            className="fp-print-s1"
            delay={0.14}
            depth={34}
          />
          <Plate
            bare
            src={F("sticker-2")}
            alt="A second TP sticker, without the outline."
            size={size(F("sticker-2"))}
            className="fp-print-s2"
            delay={0.2}
            depth={28}
          />
        </div>
      </Chapter>

      <Chapter n="07" label="Results" tone="coral">
        <Statement size="xl">10 years. One system. Two thousand two hundred people.</Statement>
        {/* THE SAME THREE, WORD FOR WORD, as the masthead's. A standfirst and
            a conclusion are allowed to carry the same numbers — a skimmer
            reads the first and a finisher earns the second — but they may not
            carry them in a different order or with different labels, which is
            what they did. */}
        <Figures
          items={[
            { value: "2,200+", label: "registrations" },
            { value: "10,000+", label: "views across the campaign" },
            { value: "10th", label: "edition of the event" },
          ]}
        />
        {/* the closing image, and the only place it is evidence: the room the
            2,200 filled */}
        <Plate
          src={F("hall")}
          alt="Rows of auditorium seats under violet light, at the event."
          size={size(F("hall"))}
          ratio="16 / 9"
          depth={18}
          className="fp-hall"
          caption="The hall it filled."
        />
        <div className="pp-out">
          <a
            className="pp-link"
            href="https://www.behance.net/gallery/221417825/FUTUREPRENEURS-100-UI-Design"
            target="_blank"
            rel="noreferrer"
          >
            The full gallery on Behance
            <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
        <Credit>Futurepreneurs 10.0 — branding &amp; UI, October 2024 · E-Cell, VIT Vellore</Credit>
      </Chapter>
    </>
  );
}
