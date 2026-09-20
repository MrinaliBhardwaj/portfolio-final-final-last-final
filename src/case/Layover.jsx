// LAYOVER — "You have ninety minutes. Nothing tells you what fits."
//
// Her deck is nine numbered sections of argument interleaved with the screens
// the argument is about, set in Montserrat over near-black with a champagne
// gold. The page keeps that: the section numbers, the em dashes, the air, the
// gold, and every headline below is a line off her own board rather than a
// caption written for a website.
//
// THE ONE STRUCTURAL IDEA. Her brand slide is called "One system, two
// temperatures": the consumer surfaces are dark, slow and set large; the
// operator surfaces are white, dense and set small, "because it survives in a
// data row where Montserrat does not". So the page IS both temperatures — the
// vendor and admin sections invert to white and Inter (data-tone="operator")
// and then it goes dark again. A case study about two temperatures that is one
// temperature throughout has not been designed, it has been typeset.
import { ArrowUpRight } from "lucide-react";
import {
  Bleed,
  Chapter,
  Credit,
  Decision,
  Figures,
  Marquee,
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

const S = (n) => `/work/layover-page/${n}.webp`;

/** the consumer app, in the order a traveller meets it */
const APP = [
  ["03-airport-selection", "Which airport, which terminal"],
  ["03-home", "What is open, near this gate"],
  ["03-outlet-menu", "Veg / non-veg, as a header control"],
  ["03-item-added", "Added, with the prep time still showing"],
  ["03-cart-and-payment", "Pay, or pay on pickup"],
];

/** the sign-up explorations, which converged rather than were chosen */
const AUTH = [
  ["04-phone-social", "Phone, with social alongside"],
  ["04-otp-pass-2", "Pass 2"],
  ["04-otp-pass-3", "Pass 3"],
  ["04-otp-pass-4", "Pass 4"],
  ["04-otp-final-with-error-state", "Final — with the error state"],
];

/** the vendor portal: the screen nobody screenshots */
const VENDOR = [
  ["05-order-queue", "The queue, colour-coded by state"],
  ["05-order-card", "Accept and Reject take the largest targets"],
  ["05-empty-queue", "The empty state, designed before the full one"],
  ["05-item-editor", "Preparation Time is a required field"],
  ["05-menu-management", "Edited in place, not in a settings tree"],
  ["05-analytics", "The same numbers admin grades them on"],
];

/** six steps, identity first and documents last */
const ONBOARD = [
  ["07-01-business-details", "01 — Business details"],
  ["07-02-contact-details", "02 — Contact"],
  ["07-03-email-and-phone-otp", "03 — Verify both"],
  ["07-04-kyc-fssai-trade-licence", "04 — KYC, FSSAI, trade licence"],
  ["07-05-bank-details", "05 — Bank"],
  ["07-06-submitted", "06 — Submitted"],
];

const ADMIN = [
  ["08-onboarding-approval", "Approvals — the gate before a stall goes live"],
  ["08-vendor-management", "Vendors, by completion rate"],
  ["08-order-management", "Orders, across every terminal"],
  ["08-menu-oversight", "Menu oversight"],
  ["08-user-management", "Users"],
];

/** consumer — selling something; operator — running something */
const CONSUMER_SWATCHES = [
  { hex: "#0A0A0A", name: "Ink" },
  { hex: "#161617", name: "Ink, raised" },
  { hex: "#7A6A3E", name: "Olive gold" },
  { hex: "#C9A85C", name: "Gold", ink: "#17140c" },
  { hex: "#F5CE7E", name: "Gold, lit", ink: "#17140c" },
];

const OPERATOR_SWATCHES = [
  { hex: "#FFFFFF", name: "Ground", ink: "#111112" },
  { hex: "#F2F2F2", name: "Row", ink: "#111112" },
  { hex: "#D8D8D6", name: "Rule", ink: "#111112" },
  { hex: "#7A6A3E", name: "Olive gold" },
  { hex: "#F4605E", name: "Reject", ink: "#2a0f0f" },
];

export default function Layover() {
  return (
    <>
      {/* The concourse, and the promise over it. The deck opens on a
          photograph and so does this — a layover is a place before it is a
          product. */}
      <Bleed
        src="/work/layover/hero.webp"
        alt="The Layover landing page over a night concourse: Order Meals, Access Lounges, All In One App."
        h="short"
        depth={30}
      >
        <Statement size="lg" as="p">
          You have ninety minutes.
          <br />
          Nothing tells you what fits.
        </Statement>
      </Bleed>

      <Chapter n="01" label="The problem" flush>
        <Split ratio="1.1fr 0.9fr" gap="52px">
          <div>
            <Statement size="lg">
              A layover looks like leisure and behaves like a deadline.
            </Statement>
            <Say>
              You land with a hundred minutes and a board of outlet names. No menus, no
              prices, no way to know whether a queue is four minutes or twenty. So you buy
              the packaged sandwich you didn&rsquo;t want.
            </Say>
            <Say>
              Three gates away a stall has an empty counter and a hot fryer. Neither of you
              can see the other.
            </Say>
          </div>
          <Plate
            src="/work/layover/cover.webp"
            alt="The Layover wordmark on a billboard, shot at dusk."
            size={size("/work/layover/cover.webp")}
            ratio="4 / 5"
            from="right"
            depth={22}
            caption="The mark, in the place it is for."
          />
        </Split>

        <Pull>
          Nobody had built the thing in the middle that lets them agree on a number.
        </Pull>
      </Chapter>

      <Chapter n="02" label="The insight">
        <Statement size="lg">
          Both sides are solving the same equation from opposite ends.
        </Statement>
        <Split ratio="1fr 1fr" gap="40px">
          <Run gap="14px">
            <Note>THE TRAVELLER ASKS</Note>
            <Statement size="md">Can I eat this before I board?</Statement>
          </Run>
          <Run gap="14px">
            <Note>THE KITCHEN ASKS</Note>
            <Statement size="md">Can I cook this before they leave?</Statement>
          </Run>
        </Split>
        <Say>
          Prep time is the answer to both. It is set by the kitchen, read by the traveller,
          and counted down by both — which is the part that keeps it honest. Admin grades
          vendors on it, so it cannot quietly become a marketing number.
        </Say>

        <Figures
          items={[
            { value: "1", label: "number the whole product is organised around", note: "Prep time" },
            { value: "5", label: "surfaces it has to mean the same thing on" },
            { value: "4", label: "airports at launch", note: "Delhi · Mumbai · Bengaluru · Hyderabad" },
          ]}
        />
      </Chapter>

      <Marquee>One number, five surfaces. ·</Marquee>

      <Chapter n="03" label="The traveller" flush>
        <Split ratio="0.95fr 1.05fr" middle gap="48px">
          <div>
            <Statement size="lg">
              Designing for someone who is already slightly late.
            </Statement>
            <Run gap="28px">
              <Decision
                what="No login wall."
                why="Login is the first screen in a lot of products. Nobody makes an account to find out whether something is useful."
                cost="We lose the email of everyone who browses and leaves. It was worth it."
              />
              <Decision
                delay={0.08}
                what="Veg and non-veg is a header control, not a filter three taps down."
                why="In India it is not a preference. It is the first question."
              />
            </Run>
          </div>
          <Plate
            src="/work/layover/app.webp"
            alt="Two phones showing the Layover ordering interface."
            size={size("/work/layover/app.webp")}
            from="right"
            depth={26}
          />
        </Split>

        <Rail kind="phone" label="Consumer app — iOS" count={`${APP.length} screens`}>
          {APP.map(([n, cap], i) => (
            <Slide
              key={n}
              src={S(n)}
              alt={`Layover consumer app — ${cap}.`}
              size={size(S(n))}
              caption={`${String(i + 1).padStart(2, "0")} — ${cap}`}
            />
          ))}
        </Rail>
        <Credit>Drag, or scroll the rail sideways</Credit>
      </Chapter>

      <Chapter n="04" label="Sign-up">
        <Sticky
          aside={
            <>
              <Statement size="md">We kept asking for less.</Statement>
              <Say>
                Five explorations, converging rather than competing: a phone number and an
                OTP. No password, no profile, and nothing requested until checkout — at
                which point the session returns you to wherever you left off.
              </Say>
            </>
          }
        >
          <Rail kind="phone" label="The five passes" count="01 → final">
            {AUTH.map(([n, cap]) => (
              <Slide
                key={n}
                src={S(n)}
                alt={`Layover sign-up — ${cap}.`}
                size={size(S(n))}
                caption={cap}
              />
            ))}
          </Rail>
        </Sticky>
      </Chapter>

      {/* ---- the temperature changes ---- */}
      <Chapter n="05" label="The counter" tone="operator">
        <Statement size="lg">
          The screen nobody screenshots is the one the product runs on.
        </Statement>
        <Say wide>
          Used standing at a pass, mid-service, with one hand free and a queue in front of
          you.
        </Say>
        <Decision
          what="The operator surfaces invert the whole system."
          why="Almost everything that makes a consumer app good makes this one worse. White ground, not black. Inter at small sizes, because it survives in a data row where Montserrat does not. Dense on purpose — it competes with the queue, not with a duty-free window."
        />

        <Rail kind="wide" label="Vendor portal" count={`${VENDOR.length} of 11`}>
          {VENDOR.map(([n, cap]) => (
            <Slide
              key={n}
              src={S(n)}
              alt={`Layover vendor portal — ${cap}.`}
              size={size(S(n))}
              caption={cap}
            />
          ))}
        </Rail>

        <Pull>The empty state was designed before the populated one.</Pull>
        <Say>
          A stall that under-promises on prep time degrades its own Average Prep Time, which
          is beside its Completion Rate on the admin vendor row. Accuracy is enforced by the
          system instead of by a policy nobody reads.
        </Say>

        <Split ratio="1fr 1fr" gap="34px">
          <Plate
            src={S("06-dashboard")}
            alt="Layover vendor portal on a phone — the dashboard."
            size={size(S("06-dashboard"))}
            ratio="9 / 19.5"
            caption="Most stall owners do not have a desk."
          />
          <Plate
            src={S("06-incoming-order")}
            alt="Layover vendor portal on a phone — an incoming order."
            size={size(S("06-incoming-order"))}
            ratio="9 / 19.5"
            delay={0.08}
            caption="An incoming order, thumb-high."
          />
        </Split>
      </Chapter>

      <Chapter n="06" label="Onboarding" tone="operator" flush>
        <Statement size="lg">
          You can&rsquo;t delete a legal requirement. You can only sequence it.
        </Statement>
        <Decision
          what="The legal steps were sequenced, not reduced."
          why="FSSAI licence, trade licence, government ID, bank proof, email and phone verification. None of it is optional, so the design problem was the ORDER rather than the volume: identity first, documents last."
          cost="Six steps is still six steps. What the order buys is a step you can leave and come back to."
        />
        <Rail kind="wide" label="Vendor onboarding" count="6 steps">
          {ONBOARD.map(([n, cap]) => (
            <Slide
              key={n}
              src={S(n)}
              alt={`Layover vendor onboarding — ${cap}.`}
              size={size(S(n))}
              caption={cap}
            />
          ))}
        </Rail>
      </Chapter>

      <Chapter n="07" label="The operator" tone="operator" flush>
        <Split ratio="0.8fr 1.2fr" gap="44px">
          <div>
            <Statement size="md">Marketplaces don&rsquo;t fail loudly.</Statement>
            <Say>
              A stall goes stale, or starts refusing orders, and travellers quietly stop
              coming back. By the time it shows up in monthly revenue it has been true for
              weeks. Admin is the set of tools for catching that before a traveller does.
            </Say>
          </div>
          <Rail kind="wide" label="Admin portal" count={`${ADMIN.length} views`}>
            {ADMIN.map(([n, cap]) => (
              <Slide
                key={n}
                src={S(n)}
                alt={`Layover admin portal — ${cap}.`}
                size={size(S(n))}
                caption={cap}
              />
            ))}
          </Rail>
        </Split>
      </Chapter>

      {/* ---- and back to the consumer temperature ---- */}
      <Chapter n="08" label="Brand">
        <Statement size="lg">One system, two temperatures.</Statement>
        {/* her vector, out of the file — not a screenshot of a slide */}
        <Reveal as="figure" from="in" className="lo-wordmark">
          <span>
            <img
              src="/work/layover/fig/wordmark.svg"
              alt="The LayOver wordmark, its e reversed."
              width={480}
              height={94}
            />
          </span>
          <figcaption>
            The wordmark reverses its own &ldquo;e&rdquo;. A layover is the part of a trip that
            turns back on itself.
          </figcaption>
        </Reveal>
        <Split ratio="1fr 1fr" gap="34px">
          <div>
            <Note>CONSUMER — SELLING SOMETHING</Note>
            <Say>
              Ink under gold, Montserrat set large with a lot of air. Slow on purpose — it
              competes with a duty-free window, not a spreadsheet.
            </Say>
            <Swatches items={CONSUMER_SWATCHES} />
          </div>
          <div>
            <Note>OPERATOR — RUNNING SOMETHING</Note>
            <Say>
              White ground, Inter at small sizes because it survives in a data row where
              Montserrat does not. Dense on purpose — it competes with the queue in front of
              you.
            </Say>
            <Swatches items={OPERATOR_SWATCHES} />
          </div>
        </Split>
      </Chapter>

      <Bleed
        src="/work/layover/system.webp"
        alt="The Layover marketing site and the app, shown together."
        h="short"
        depth={26}
      />

      <Chapter n="09" label="What mattered" flush>
        <Statement size="xl">
          We designed the traveller first and the counter second. That was backwards.
        </Statement>
        <Say wide>
          Every promise on the consumer side is work the vendor tool has to do. Some of the
          early consumer polish came back out once we understood what a stall owner&rsquo;s
          shift actually looks like. Once prep time was the thing all five surfaces were
          organised around, most of the remaining design questions answered themselves.
        </Say>
        {/* THE SAME THREE, WORD FOR WORD, as the masthead's. A standfirst and
            a conclusion are allowed to carry the same numbers — a skimmer
            reads the first and a finisher earns the second — but they may not
            carry them in a different order or with different labels, which is
            what they did. */}
        <Figures
          items={[
            { value: "Live", label: "shipped, at mylayover.in" },
            { value: "5", label: "surfaces, marketing site to admin portal" },
            { value: "4", label: "airports at launch" },
          ]}
        />
        <div className="pp-out">
          <a className="pp-link" href="https://mylayover.in/" target="_blank" rel="noreferrer">
            Visit the live site
            <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </Chapter>
    </>
  );
}
