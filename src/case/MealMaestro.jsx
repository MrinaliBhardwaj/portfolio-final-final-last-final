// MEAL MAESTRO — "the hard part isn't cooking, it's deciding."
//
// Her deck is cream and forest green with a terracotta accent, set in Poppins
// over Open Sans, and it argues from numbers: 12 interviews, 140 survey
// responses, five percentages, eight verbatim quotes. So this page is built
// around the evidence, and the product arrives as its answer.
//
// EVERY PICTURE HERE IS A COMPONENT OF HER FIGMA FILE, not a piece of the
// exported board: each phone is its own "Phone mockup" node, cut out with its
// real shadow, and each photograph is the original upload rather than the
// rectangle it was masked to on the slide (scripts/build_figma_components.py
// records which node each came from). That is what lets the page compose them
// — phones overlapping, photos at the page's proportions — instead of showing
// fragments of slides.
import {
  Bleed,
  Chapter,
  Columns,
  Credit,
  Decision,
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

const F = (n) => `/work/meal-maestro/fig/${n}.webp`;

/** the raw signal, verbatim off her survey slide */
const SIGNAL = [
  ["72%", "struggle to maintain consistent meal plans beyond one week"],
  ["65%", "experience daily stress around deciding what to cook"],
  ["62%", "abandoned their most recent meal planning attempt within two weeks"],
  ["61%", "feel existing apps fail to accommodate their dietary needs and goals"],
  ["55%", "found existing nutrition and meal apps too tedious to use consistently"],
];

/** in their words — her respondents */
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

/** her explore screen's seven entry points, as the screen names them. Only
    five carry a line on her board; the other two are left as names rather
    than given a description she did not write. */
const SEVEN = [
  ["Scan & Savour", "Point your camera at ingredients — get instant recipes."],
  ["Swipe & Dine", ""],
  ["Season’s Best", "Curated picks from this season’s freshest produce."],
  ["Mood BITES", "Eat by emotion — comfort, energy, or light."],
  ["Talk & COOK", "A voice guides you through any recipe, completely hands-free."],
  ["Boost My Plate", ""],
  ["HOT Picks", "Trending recipes, surfaced daily from what’s popular right now."],
];

export default function MealMaestro() {
  return (
    <>
      <Chapter n="01" label="The goal" flush>
        <Split ratio="1fr 1fr" middle gap="40px">
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
          {/* two of her phones, overlapped the way a hand would lay them down */}
          <div className="mm-pair">
            <Plate
              bare
              src={F("phone-recipe")}
              alt="Meal Maestro's recipe screen: Pasta Primavera, its macros, ingredients and a Start Cooking button."
              size={size(F("phone-recipe"))}
              from="up"
              depth={14}
              className="mm-pair-back"
            />
            <Plate
              bare
              src={F("phone-tracker")}
              alt="Meal Maestro's tracker: breakfast and lunch logged, 821 kcal, and the day's progress."
              size={size(F("phone-tracker"))}
              from="up"
              delay={0.1}
              depth={26}
              className="mm-pair-front"
            />
          </div>
        </Split>
      </Chapter>

      {/* the market shelf she opens the brand on — the original photograph, not
          the slide it was masked into */}
      <Bleed
        src={F("produce")}
        alt="A market shelf of peppers, greens, cabbages and gourds."
        h="short"
        depth={24}
      >
        <Statement size="lg" as="p">
          Built on a palette <em className="on-photo">rooted in nature</em>.
        </Statement>
      </Bleed>

      <Chapter n="02" label="Primary research" tone="forest" flush>
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

      <Chapter n="03" label="Raw signal">
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

      <Chapter n="04" label="In their words" tone="forest">
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

      <Chapter n="05" label="The week that breaks the habit">
        <Split ratio="1fr 1fr" middle gap="44px">
          <div>
            <Statement size="lg">Nobody quits on Sunday.</Statement>
            <Say>
              Motivation is highest exactly when the decisions are cheapest, and the plan
              collapses on the first weekday that costs something — a late meeting, an
              empty fridge, a long commute.
            </Say>
            <Decision
              what="The product decides before the week does."
              why="It cannot ask for willpower on Wednesday, because Wednesday is where the evidence says the plan dies. The plan, the list and the next meal are chosen before the bad day arrives."
              cost="A plan made for you is a plan you did not choose, so every screen has to be one tap from swapping a meal."
            />
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

      <Chapter n="06" label="The work users hire us for">
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

      <Chapter n="07" label="Brand">
        <Split ratio="1fr 1fr" gap="44px">
          <div>
            <Statement size="md">
              Six colours, <em>rooted in nature</em>.
            </Statement>
            <Say>
              Forest and sea green carry the interface; terracotta is spent only where
              something needs acting on — a calorie ring filling, a button, a warning. The
              cream is the paper everything sits on, and it is this page&rsquo;s paper too.
            </Say>
            <Swatches items={PALETTE} />
          </div>
          <div>
            <Statement size="md">Two families.</Statement>
            {/* set in the real faces — Poppins and Open Sans are self-hosted for
                this page, so the specimen is the type, not a picture of it */}
            <ul className="pp-specimen">
              <Reveal as="li">
                <span className="pp-specimen-name" style={{ fontFamily: "Poppins", fontWeight: 700 }}>
                  Poppins
                </span>
                <span className="pp-specimen-role">Display · headings</span>
                <span className="pp-specimen-weights" style={{ fontFamily: "Poppins" }}>
                  <span style={{ fontWeight: 400 }}>Regular</span>{" "}
                  <span style={{ fontWeight: 500 }}>Medium</span>{" "}
                  <span style={{ fontWeight: 600 }}>SemiBold</span>{" "}
                  <span style={{ fontWeight: 700 }}>Bold</span>
                </span>
              </Reveal>
              <Reveal as="li" delay={0.06}>
                <span
                  className="pp-specimen-name"
                  style={{ fontFamily: "'Open Sans Variable'", fontWeight: 600 }}
                >
                  Open Sans
                </span>
                <span className="pp-specimen-role">Body · UI text</span>
                <span className="pp-specimen-weights" style={{ fontFamily: "'Open Sans Variable'" }}>
                  Your intelligent companion for healthier eating habits every day.
                </span>
              </Reveal>
            </ul>
          </div>
        </Split>
      </Chapter>

      <Chapter n="08" label="The product" tone="forest">
        <Split ratio="1.05fr 0.95fr" middle gap="40px">
          <Plate
            bare
            src={F("hero-phones")}
            alt="Four Meal Maestro screens tumbling in a stack: the brand splash, a recipe, the explore grid and the home plan."
            size={size(F("hero-phones"))}
            depth={20}
          />
          <div>
            <Statement size="lg">
              Your meals, planned for <em>every morning</em>.
            </Statement>
            <Say>
              An intelligent home screen that greets you with a personalized daily plan,
              adapting to your goals, your diet history, and the time of day. The decision is
              made before the day has a chance to make it for you.
            </Say>
          </div>
        </Split>

        <Split ratio="0.9fr 1.1fr" middle gap="40px" className="mm-row">
          <Plate
            bare
            src={F("phone-home")}
            alt="Meal Maestro's home screen: Good Morning, a corn salad for breakfast, and Plan Your Next Meal."
            size={size(F("phone-home"))}
            from="left"
            depth={18}
          />
          <Plate
            src={F("pasta")}
            alt="A bowl of masala macaroni on slate, with chilli flakes and coriander."
            size={size(F("pasta"))}
            ratio="4 / 5"
            from="right"
            depth={14}
            caption="Taste every detail — every recipe carries its own photograph, macros and prep time."
          />
        </Split>
      </Chapter>

      <Chapter n="09" label="Track. Learn. Thrive." tone="forest" flush>
        <Split ratio="0.8fr 1.2fr" middle gap="36px">
          <Plate
            bare
            src={F("phone-tracker")}
            alt="The Meal Maestro tracker screen."
            size={size(F("phone-tracker"))}
            depth={18}
          />
          <div>
            <Statement size="md">Every macro, every kcal, turned into clarity you can act on.</Statement>
            <Plate
              src={F("macro")}
              alt="The daily macro split — 821 kcal, protein 26%, carbs 58%, fats 16% — above a chart of daily progress."
              size={size(F("macro"))}
              className="mm-macro"
            />
          </div>
        </Split>
      </Chapter>

      <Chapter n="10" label="Seven ways to find your meal">
        <Split ratio="0.85fr 1.15fr" middle gap="40px">
          <Plate
            bare
            src={F("phone-explore")}
            alt="Meal Maestro's explore screen: seven tiles, from Scan and Savour to Boost My Plate."
            size={size(F("phone-explore"))}
            depth={16}
          />
          <ol className="mm-seven">
            {SEVEN.map(([name, line], i) => (
              <Reveal as="li" key={name} delay={i * 0.04}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <b>{name}</b>
                {line && <p>{line}</p>}
              </Reveal>
            ))}
          </ol>
        </Split>
      </Chapter>

      <Chapter n="11" label="Outcome" tone="forest">
        <Split ratio="1fr 1fr" gap="24px">
          <Plate
            src={F("kitchen")}
            alt="A hand holding a phone open on Meal Maestro, in front of jars of pasta and grains."
            size={size(F("kitchen"))}
            ratio="4 / 5"
            depth={16}
          />
          <Plate
            src={F("crates")}
            alt="maestro ai open on a phone, propped against wooden crates in a kitchen."
            size={size(F("crates"))}
            ratio="4 / 5"
            delay={0.08}
            depth={22}
            caption="maestro ai: ask in plain words, get a plate you can actually cook."
          />
        </Split>
        <Statement size="xl">
          Third at the GDG Design-a-thon — for an app that <em>decides</em> for you.
        </Statement>
        {/* THE SAME THREE, WORD FOR WORD, as the masthead's. A standfirst and
            a conclusion are allowed to carry the same numbers — a skimmer
            reads the first and a finisher earns the second — but they may not
            carry them in a different order or with different labels, which is
            what they did. */}
        <Figures
          items={[
            { value: "3rd", label: "of the GDG Design-a-thon" },
            { value: "140", label: "survey responses behind the brief" },
            { value: "12", label: "discovery interviews" },
          ]}
        />
        <Credit>Meal Maestro — UI design, March 2025 · Vellore, Tamil Nadu</Credit>
      </Chapter>
    </>
  );
}
