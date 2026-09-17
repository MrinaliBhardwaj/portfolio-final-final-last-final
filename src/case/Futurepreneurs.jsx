// FUTUREPRENEURS 10.0 — the X Edition.
//
// The deck's single most identifiable habit is that every section is labelled
// like a closing tag: `<About\>`, `<Theme\>`, `<Process\>`, `<Website\>`. The
// page's section labels ARE that tag — drawn by CSS from the plain label, so
// the markup stays readable and the screen reader hears "About" rather than a
// mouthful of punctuation (themes.css, the Futurepreneurs block).
//
// The other identity carriers: her four named colours, the lilac gradient mesh
// (rebuilt as a real gradient so the masthead can be any size), Slateblue
// #653BD8 against Sorrell Brown #F59869, and the deck's own black grounds.
//
// ONE HONEST SUBSTITUTION, flagged in the typography section and nowhere hidden:
// Whyte Inktrap is licensed and cannot be served here, so the display face is
// Archivo — this portfolio's own — with her real specimen shown beside it.
// Gantari, her body face, is real and self-hosted.
import { ArrowUpRight } from "lucide-react";
import {
  Bleed,
  Chapter,
  Columns,
  Credit,
  Figures,
  Marquee,
  Note,
  Plate,
  Pull,
  Rail,
  Reveal,
  Say,
  Slide,
  Split,
  Statement,
  Swatches,
} from "./parts.jsx";
import { size } from "./art.js";

const A = (n) => `/work/futurepreneurs/art/${n}.webp`;

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
      <Chapter label="About" tone="black" flush>
        <Statement size="lg">Vision Made Visible: elevating an ecosystem of innovation.</Statement>
        <Split ratio="1.05fr 0.95fr" gap="44px">
          <div>
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
          <Plate
            src={A("mark")}
            alt="The Futurepreneurs TP monogram, in violet and apricot gradient."
            size={size(A("mark"))}
            ratio="1 / 1"
            fit="contain"
            from="right"
            depth={14}
            caption="The monogram — T and P, interlocked."
          />
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

      <Chapter label="Theme">
        <Statement size="lg">Four colours, and one of them does all the work.</Statement>
        <Say>
          Slateblue carries the identity; Sorrell Brown is the only warm thing in the system
          and is spent sparingly — on the closing card, on one block behind a phone, on a
          single word. Black and white do the rest.
        </Say>
        <Swatches items={THEME} />
      </Chapter>

      <Chapter label="Typography" tone="black">
        <Split ratio="1fr 1fr" gap="40px">
          <div>
            <Statement size="md">Whyte Inktrap, Gantari, Almarai.</Statement>
            <Say>
              An inktrap grotesque for display, Gantari Medium for body, Almarai Regular for
              the long-form panels. The ink traps are the point: at poster size they read as
              deliberate engineering rather than as a default.
            </Say>
            <Note>
              Whyte Inktrap is licensed and cannot be served on this site, so this page sets
              Archivo — the portfolio&rsquo;s own display face, a grotesque of the same build
              — and shows her real specimen alongside. Gantari is here, and is real: every
              paragraph on this page is set in it.
            </Note>
          </div>
          <Plate
            src={A("room")}
            alt="The Futurepreneurs auditorium, seats lit violet before the event."
            size={size(A("room"))}
            ratio="16 / 10"
            from="right"
            depth={18}
            caption="The hall it filled."
          />
        </Split>
      </Chapter>

      <Chapter label="Process" tone="black" flush>
        <Statement size="lg">Five steps, and the brand was decided in the second one.</Statement>
        <ol className="pp-steps">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s} delay={i * 0.07}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {s}
            </Reveal>
          ))}
        </ol>
        <Plate
          src={A("process")}
          alt="The Futurepreneurs process diagram: Research, Ideate, Wireframe, UI Concept, Design."
          size={size(A("process"))}
        />
      </Chapter>

      <Marquee>10 YEARS OF FUTUREPRENEURS ·</Marquee>

      <Chapter label="SocialmediaGrid" flush>
        <Statement size="lg">A grid that had to survive being seen one tile at a time.</Statement>
        <Say wide>
          An Instagram grid is read in two ways at once: as a wall, and as a single post in
          somebody&rsquo;s feed three weeks apart. Every tile carries the mark, the edition
          and one fact — the aftermovie, the winners, the prize pool, the sponsor, the venue,
          the partner — so it works alone, and the mesh gradient underneath makes it a
          composition when you open the profile.
        </Say>
        <Plate
          src={A("social")}
          alt="Six Futurepreneurs social tiles: aftermovie, winners, prize pool, official sponsor, the event card, official partner."
          size={size(A("social"))}
          depth={12}
        />
        <Plate
          src={A("timeline")}
          alt="The Futurepreneurs timeline poster: registrations open Sept 25, close Oct 2, qualification Oct 3, the event begins Oct 5."
          size={size(A("timeline"))}
          caption="The timeline poster, over the mesh."
        />
      </Chapter>

      <Chapter label="Instagramstories">
        <Split ratio="0.8fr 1.2fr" middle gap="40px">
          <div>
            <Statement size="md">Registrations are now open.</Statement>
            <Say>
              The story set is where the yellow and the Sorrell Brown finally get used at
              size — a full-bleed block behind each phone, and a QR that takes a thumb
              straight to the form.
            </Say>
          </div>
          <Plate
            src={A("stories")}
            alt="Three Futurepreneurs Instagram stories on phones: the site is live, registrations open, and how to register."
            size={size(A("stories"))}
            from="right"
            depth={16}
          />
        </Split>
      </Chapter>

      <Chapter label="Website">
        <Split ratio="1.25fr 0.75fr" gap="44px">
          <Plate
            src={A("website")}
            alt="The Futurepreneurs X Edition event site, full page: the countdown, the business simulation game, the timeline and the FAQs."
            size={size(A("website"))}
            caption="The event site, top to bottom."
          />
          <div>
            <Statement size="md">A countdown, and then the answers.</Statement>
            <Say>
              The site has one job on the day it launches and a different one the week after.
              First: a live countdown and a register button. Then, as the date closes in, the
              page has to answer a stranger&rsquo;s questions — what the simulation actually
              is, who runs it, when the rounds are, what it costs — so the FAQ is part of the
              page rather than a link off it.
            </Say>
            <Pull>We breed business.</Pull>
          </div>
        </Split>
      </Chapter>

      <Chapter label="Printables">
        <Statement size="lg">The things people took home.</Statement>
        <Say wide>
          The same system, printed: die-cut stickers, wristbands, invitations and the merit
          certificates. A brand that only exists on a screen has not been tested — the marks
          below had to survive a foil press and a lanyard.
        </Say>
        <Split ratio="1fr 1fr" middle gap="34px">
          <Plate
            src={A("stickers")}
            alt="Two die-cut Futurepreneurs stickers, the TP monogram in violet and apricot."
            size={size(A("stickers"))}
            fit="contain"
            ratio="4 / 3"
          />
          <Columns
            groups={[
              {
                head: "Produced",
                items: [
                  "Die-cut stickers",
                  "Event wristbands",
                  "Printed invitations",
                  "Merit certificates",
                  "Brochures",
                ],
              },
            ]}
          />
        </Split>
      </Chapter>

      <Chapter label="Results" tone="coral" flush>
        <Statement size="xl">10 years. One system. Two thousand two hundred people.</Statement>
        <Figures
          items={[
            { value: "10,000+", label: "views across the campaign" },
            { value: "2,200+", label: "registrations" },
            { value: "10th", label: "edition of the event" },
          ]}
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
