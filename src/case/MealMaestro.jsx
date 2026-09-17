// MEAL MAESTRO — "the hard part isn't cooking, it's deciding."
//
// Her deck is cream and forest green with a terracotta accent, set in Poppins
// over Open Sans, and it argues from numbers: 12 interviews, 140 survey
// responses, five percentages, eight verbatim quotes. So this page is built
// around the evidence rather than around the screens — the research IS the
// case study, and the product arrives as its answer.
//
// The two grounds alternate the way her board's do: cream for argument, forest
// green for evidence and for the product tour. Every figure and every quote
// below is off her own slides.
import {
  Bleed,
  Chapter,
  Columns,
  Credit,
  Figures,
  Note,
  Plate,
  Pull,
  Reveal,
  Run,
  Say,
  Split,
  Statement,
  Sticky,
  Swatches,
} from "./parts.jsx";
import { size } from "./art.js";

const A = (n) => `/work/meal-maestro/art/${n}.webp`;

/** the raw signal, verbatim off her survey slide */
const SIGNAL = [
  ["72%", "struggle to maintain consistent meal plans beyond one week"],
  ["65%", "experience daily stress around deciding what to cook"],
  ["62%", "abandoned their most recent meal planning attempt within two weeks"],
  ["61%", "feel existing apps fail to accommodate their dietary needs and goals"],
  ["55%", "found existing nutrition and meal apps too tedious to use consistently"],
];

/** in their words — her respondents, with her own P-numbers dropped */
const VOICES = [
  "I plan on Sunday and I’ve quit by Wednesday.",
  "I feel guilty ordering in. Again.",
  "Tracking macros feels like a second job.",
  "By the time I’m home, I’ve got no decisions left in me.",
  "I just want to be told what to cook.",
  "I keep buying groceries that rot.",
  "Every app gives me recipes. None give me a plan.",
  "I want to eat healthy. I just don’t have the time.",
];

/** her palette slide, hex for hex */
const PALETTE = [
  { hex: "#36755F", name: "Sea green" },
  { hex: "#385A41", name: "Forest" },
  { hex: "#89A68F", name: "Sage", ink: "#1f3a2c" },
  { hex: "#933D24", name: "Terracotta" },
  { hex: "#D9C3AF", name: "Tan", ink: "#1f3a2c" },
  { hex: "#F8F0E5", name: "Cream", ink: "#1f3a2c" },
];

export default function MealMaestro() {
  return (
    <>
      <Chapter label="The goal" flush>
        <Split ratio="1fr 1.1fr" middle gap="46px">
          <div>
            <Statement size="lg">
              The hard part isn&rsquo;t cooking. It&rsquo;s <em>deciding</em>.
            </Statement>
            <Say>
              To create a personalized experience that makes healthy eating simpler, more
              accessible, and easier to maintain in everyday life. Meal Maestro takes what
              you like, what you avoid and what is already in the kitchen, and turns it into
              a week of recipes and the one grocery list that covers them.
            </Say>
          </div>
          <Plate
            src={A("recipe-tracker")}
            alt="Two Meal Maestro screens: a ramen recipe with its macros, and the daily tracker at 821 kcal."
            size={size(A("recipe-tracker"))}
            from="right"
            depth={20}
          />
        </Split>
      </Chapter>

      <Bleed
        src={A("produce")}
        alt="The Meal Maestro wordmark over a market shelf of peppers, chillies and greens."
        h="short"
        depth={26}
      />

      <Chapter label="Primary research" tone="forest" flush>
        <Statement size="lg">
          Rooted in <em>real voices</em>, real data.
        </Statement>
        <Split ratio="0.95fr 1.05fr" gap="40px">
          <Say>
            Five weeks, qualitative and quantitative, with working professionals aged 26 to
            45 — the people who want to eat well and keep failing to.
          </Say>
          <Columns
            groups={[
              {
                head: "What we needed to know",
                items: [
                  "Why do motivated people abandon meal planning within weeks?",
                  "Where does the friction actually live — planning, shopping, cooking, or tracking?",
                  "What makes a food tool trustworthy enough to open every day?",
                ],
              },
            ]}
          />
        </Split>
        <Figures
          items={[
            { value: "12", label: "in-depth interviews" },
            { value: "140", label: "survey responses" },
            { value: "4", label: "competitor teardowns" },
            { value: "5", label: "weeks of field duration" },
          ]}
        />
      </Chapter>

      <Chapter label="Raw signal">
        <Sticky
          aside={
            <>
              <Statement size="md">The failure is not motivation.</Statement>
              <Say>
                Almost everyone surveyed had tried. Most had tried recently. The apps were
                not too hard to understand — they were too tedious to keep open.
              </Say>
            </>
          }
        >
          <ul className="pp-bars">
            {SIGNAL.map(([pct, text], i) => (
              <Reveal as="li" key={pct} delay={i * 0.06}>
                <b>{pct}</b>
                <span>{text}</span>
              </Reveal>
            ))}
          </ul>
        </Sticky>

        <Pull>
          78% order takeout three or more times a week — driven by planning friction, not
          preference.
        </Pull>
      </Chapter>

      <Chapter label="In their words" tone="forest">
        <Statement size="lg">The same sentence, eight ways.</Statement>
        <ul className="pp-voices">
          {VOICES.map((q, i) => (
            <Reveal as="li" key={q} delay={(i % 4) * 0.05} className={i === 3 ? "is-hot" : ""}>
              {q}
            </Reveal>
          ))}
        </ul>
        <Note>Verbatim, from the discovery interviews and the survey&rsquo;s free-text field.</Note>
      </Chapter>

      <Chapter label="The friction curve">
        <Split ratio="1fr 1fr" middle gap="44px">
          <div>
            <Statement size="lg">The week that breaks the habit.</Statement>
            <Say>
              Nobody quits on Sunday. Motivation is highest exactly when the decisions are
              cheapest, and the plan collapses on the first weekday that costs something —
              a late meeting, an empty fridge, a long commute.
            </Say>
            <Say>
              So the product cannot ask for willpower on Wednesday. It has to have already
              decided.
            </Say>
          </div>
          <ol className="pp-arc">
            {[
              ["Sun", "Motivated", "The plan gets made"],
              ["Tue", "Negotiating", "One swap, then two"],
              ["Wed", "Slipping", "No decisions left"],
              ["Fri", "Gone", "Back to takeout"],
            ].map(([day, state, note], i) => (
              <Reveal as="li" key={day} delay={i * 0.07}>
                <span className="pp-arc-day">{day}</span>
                <b>{state}</b>
                <span className="pp-arc-note">{note}</span>
              </Reveal>
            ))}
          </ol>
        </Split>
      </Chapter>

      <Chapter label="The work users hire us for">
        <Statement size="lg">Three jobs, in their own sentences.</Statement>
        <Run gap="18px">
          {[
            ["When I get home drained,", "I want to be told what to cook,", "so eating well costs no willpower."],
            ["When I shop,", "I want a list that mirrors my plan,", "so nothing rots unused."],
            ["When the week gets hard,", "I want proof I’m on track,", "so one bad day isn’t a failure."],
          ].map(([when, want, so], i) => (
            <Reveal as="p" key={when} delay={i * 0.07} className="pp-jtbd">
              <i>{when}</i> <b>{want}</b> <i>{so}</i>
            </Reveal>
          ))}
        </Run>
        <Columns
          groups={[
            {
              head: "MVP zone",
              items: [
                "AI meal plans — daily decision fatigue",
                "Auto-grocery list — plan-to-shop disconnect",
                "Progress dashboard — invisible progress",
              ],
            },
            {
              head: "Below the line",
              items: [
                "Leftover recipes — wasted groceries",
                "Nutrition tracking",
                "Voice assistant",
                "Water tracking",
              ],
            },
          ]}
        />
        <Note>
          Seven opportunities, plotted on impact against effort. Three of them cleared the
          line, and those three are the app.
        </Note>
      </Chapter>

      <Chapter label="Brand">
        <Statement size="lg">
          Built on a palette <em>rooted in nature</em>.
        </Statement>
        <Split ratio="1.1fr 0.9fr" gap="40px">
          <Swatches items={PALETTE} />
          <Plate
            src={A("wordmark")}
            alt="The Meal Maestro wordmark on its construction grid."
            size={size(A("wordmark"))}
            from="right"
            caption="The mark, on its grid."
          />
        </Split>
        <Plate
          src={A("typespec")}
          alt="The Meal Maestro type system: Poppins for display and headings, Open Sans for body and UI text."
          size={size(A("typespec"))}
          caption="Poppins for display and headings, Open Sans for body and UI. This page is set in both."
        />
      </Chapter>

      <Chapter label="The product" tone="forest">
        <Statement size="lg">Your meals, planned for <em>every morning</em>.</Statement>
        <Say wide>
          An intelligent home screen that greets you with a personalized daily plan, adapting
          to your goals, your diet history, and the time of day.
        </Say>
        <Plate
          src={A("morning")}
          alt="The Meal Maestro home flow beside a bowl of pasta: Taste Every Detail."
          size={size(A("morning"))}
          depth={14}
        />
        <Split ratio="1fr 1fr" gap="30px">
          <Plate
            src={A("track")}
            alt="The Meal Maestro tracker: 821 kcal, the daily macro split, and the week's progress."
            size={size(A("track"))}
            caption="Track. Learn. Thrive. — every macro, every kcal turned into clarity you can act on."
          />
          <Plate
            src={A("seven")}
            alt="Seven ways to find your meal: Scan and Savour, Swipe and Dine, Season's Best, Mood Bites, Talk and Cook, Boost My Plate, Hot Picks."
            size={size(A("seven"))}
            delay={0.08}
            caption="Seven ways to find your meal — every craving, goal and mood, on one screen."
          />
        </Split>
        <Plate
          src={A("crates")}
          alt="maestro ai open on a phone, propped against produce crates in a kitchen."
          size={size(A("crates"))}
          depth={16}
          caption="maestro ai: ask in plain words, get a plate you can actually cook."
        />
      </Chapter>

      <Bleed
        src={A("thanks")}
        alt="Thanks for watching, in white script over wet leaves."
        h="short"
        depth={20}
      />

      <Chapter label="Outcome" flush>
        <Figures
          items={[
            { value: "3rd", label: "GDG Design-a-thon" },
            { value: "140", label: "survey responses behind the brief" },
            { value: "12", label: "discovery interviews" },
          ]}
        />
        <Credit>Meal Maestro — UI design, March 2025 · Vellore, Tamil Nadu</Credit>
      </Chapter>
    </>
  );
}
