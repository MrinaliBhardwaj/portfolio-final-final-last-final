// REGIS · "Building a compliance tracking platform."
//
// Her study, file 8qMVRhvaHKN41AHP72kx86 (node 104:4102), rebuilt as a page
// rather than shown as a picture of one. Every word is hers, from the file; the
// only edits are punctuation, because this site carries no em dashes (her rule,
// 18 Nov 2026): each one became the comma, colon or full stop the sentence
// needed. Two sentences were left out on purpose: the cover's "REGIS ↗" arrow
// (nothing in her files says where it would go) and the trail caption's pointer
// to "What I could not fix", a section that is not in this frame.
//
// What is an image here is only what cannot be text without being redrawn:
// the product screens, the before/after dialogs, the two dot plots, the
// swatches and her two photographs (scripts/build_regis_shots.py). The model,
// the type ramp, every label and every caption are live text in her faces.
//
// The rhythm is her board's: a question on the left, a quiet serif answer on
// the right, then the evidence; full-width hairlines between sections; two ink
// bands where her board goes dark.
import { Chapter, Reveal, Statement } from "./parts.jsx";
import { size } from "./art.js";
import "./regis.css";

const F = (n) => `/work/regis/fig/${n}.webp`;

/** an image at its manifest size, lazy, its box reserved. `pan` is the width
    (px) it keeps on a phone: a 1360px product screen squeezed into 360px is
    unreadable, so below 620px it holds this width inside a sideways-scrolling
    strip instead. On wider windows the wrapper is inert. */
function Img({ name, alt, pan }) {
  const [w, h] = size(F(name));
  const img = (
    <img src={F(name)} alt={alt} width={w} height={h} loading="lazy" decoding="async" draggable="false" />
  );
  if (!pan) return img;
  return (
    <>
      <div className="rg-pan" style={{ "--rg-pan": `${pan}px` }}>
        {img}
      </div>
      <p className="rg-pan-hint" aria-hidden="true">Swipe to see it all →</p>
    </>
  );
}

/** her section opening: the question, and the serif line beside it */
function Head({ title, aside }) {
  return (
    <div className="rg-head">
      <Statement size="lg">{title}</Statement>
      {aside && (
        <Reveal as="p" className="rg-aside" delay={0.06}>
          {aside}
        </Reveal>
      )}
    </div>
  );
}

/** her three- and four-column narrative rows */
function Cols({ items }) {
  return (
    <div className="rg-cols" style={{ "--rg-n": items.length }}>
      {items.map((t, i) => (
        <Reveal as="p" key={i} delay={i * 0.05}>
          {t}
        </Reveal>
      ))}
    </div>
  );
}

/** a product screen on her stage, captioned the way she captions them */
function Screen({ name, alt, caption, framed = false }) {
  return (
    <Reveal as="figure" from="in" className={`rg-fig${framed ? " is-framed" : " is-stage"}`}>
      <Img name={name} alt={alt} pan={820} />
      {caption && <figcaption className="rg-cap">{caption}</figcaption>}
    </Reveal>
  );
}

/** BEFORE, in her red; SHIPPED, in ink */
function Compare({ before, after }) {
  return (
    <div className="rg-compare">
      {[
        ["Before", "is-before", before],
        ["Shipped", "is-after", after],
      ].map(([tag, cls, p], i) => (
        <Reveal as="figure" key={tag} delay={i * 0.08} className={`rg-panel ${cls}`}>
          <p className="rg-tag">{tag}</p>
          <Img name={p.name} alt={p.alt} />
          <figcaption>{p.caption}</figcaption>
        </Reveal>
      ))}
    </div>
  );
}

/** numbered rules with an ink top line: the principles and the fatigue list */
function Rules({ items, n }) {
  return (
    <ol className="rg-rules" style={{ "--rg-n": n }}>
      {items.map(([title, text], i) => (
        <Reveal as="li" key={title} delay={(i % n) * 0.05}>
          <p className="rg-tag">{String(i + 1).padStart(2, "0")}</p>
          <h4>{title}</h4>
          <p>{text}</p>
        </Reveal>
      ))}
    </ol>
  );
}

export default function Regis() {
  return (
    <>
      {/* ======================= her cover ======================= */}
      <Chapter label="Overview" flush className="rg-nohead">
        <Reveal className="rg-strip" from="in">
          <p className="rg-tag">Mrinali Bhardwaj</p>
          <i aria-hidden="true" />
          <p className="rg-tag">Product designer</p>
          <p className="rg-tag">Case study · 2026</p>
        </Reveal>

        <div className="rg-cover">
          <Reveal as="h3" className="rg-title">
            Building a compliance tracking platform
          </Reveal>
          <div className="rg-cover-meta">
            <ul>
              <li>Fullstack</li>
              <li className="is-ink">Regis</li>
              <li className="is-ink">2026</li>
            </ul>
            <ul>
              <li>Pre-seed stage</li>
              <li>Indian NBFC compliance</li>
            </ul>
          </div>
          <p className="rg-chip">346 obligations &nbsp;→&nbsp; one queue</p>
        </div>

        <div className="rg-relent">
          <Reveal as="figure" from="left" className="rg-justice">
            <Img
              name="justice"
              alt="A blindfolded figure of justice in a draped shawl, holding a set of scales."
            />
          </Reveal>
          <div className="rg-relent-say">
            <Statement size="lg">Compliance isn’t hard in India. It’s relentless.</Statement>
            <Reveal as="span" className="rg-scrawl" delay={0.15}>
              346 times a year
            </Reveal>
            <Reveal as="p" className="rg-body" delay={0.1}>
              Indian compliance is not one regime. An NBFC answers to the Reserve Bank of
              India, the Ministry of Corporate Affairs and the GST authorities at once, each
              with its own forms, its own periodicity, its own dates. None of those dates are
              yours to move, and almost all of them repeat. One entity ends up carrying 346
              dated filings in a year, every one of which needs an owner, an approver, and a
              document that still holds up when somebody asks for it four years later.
            </Reveal>
          </div>
        </div>
      </Chapter>

      {/* ======================= the problem ======================= */}
      <Chapter label="The problem">
        <div className="rg-problem">
          <div className="rg-problem-main">
            <div>
              <Statement size="lg">The compliance nightmare</Statement>
            </div>
            <Reveal as="p" className="rg-lead" delay={0.06}>
              <strong>Imagine you are the compliance officer at a mid-sized NBFC.</strong>
              <span>Your name is on the filings. Personally.</span>
            </Reveal>
            <Reveal>
              <h4>An NBFC answers to four regulators at once.</h4>
              <p>
                The Reserve Bank of India, the Ministry of Corporate Affairs, GST, and its own
                board: each with its own forms, its own periodicity, and its own filing
                calendar.
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h4>The dates are not yours to move.</h4>
              <p>
                They are set by regulation. A missed filing is not a slipped to-do; it is a
                regulatory event, with a penalty attached and a permanent record.
              </p>
            </Reveal>
            <Reveal>
              <h4>Every filing needs proof that outlives the people who filed it.</h4>
              <p>
                Not a checkbox. A signed, dated document that somebody can produce on demand,
                long after everyone involved has forgotten the details.
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="rg-quote">
                Nobody takes this job because they enjoy filing. They take it because somebody
                has to be accountable, and in an NBFC that somebody is a named individual, not
                a department.
              </p>
              <p className="rg-tag">Who this is actually for</p>
            </Reveal>
          </div>
          <Reveal as="figure" from="right" className="rg-portrait">
            <Img
              name="portrait"
              alt="An older man in a white turban and kurta, a shawl over one shoulder."
            />
          </Reveal>
        </div>

        <dl className="rg-monday">
          {[
            ["You open the tracker on Monday morning.", "346 obligations. 109 of them are already overdue."],
            ["Which one do you start with?", "The list is sorted by due date. That is the only order it has."],
            ["Miss another one?", "That is a penalty, on record, with your name against it."],
            ["Get inspected with no evidence trail?", "That is worse."],
          ].map(([q, a], i) => (
            <Reveal key={q} delay={i * 0.05}>
              <dt>{q}</dt>
              <dd>{a}</dd>
            </Reveal>
          ))}
        </dl>
      </Chapter>

      {/* ======================= the product ======================= */}
      <Chapter label="The product">
        <div className="rg-split">
          <Statement size="lg">How Regis solves this</Statement>
          <div>
            <Reveal as="p" className="rg-body">
              Built for Indian NBFCs, and for the person whose name is on the filings.
            </Reveal>
            <Reveal as="p" className="rg-body">
              It does three things:
            </Reveal>
            <ol className="rg-three">
              {[
                [
                  "Knows what you owe",
                  "Derives the entity’s whole filing calendar from a single profile: NBFC class, size, listing status, and the events it reports. 346 dated obligations out of one form.",
                ],
                [
                  "Ranks what to do first",
                  "Scores every open obligation by risk and time pressure, so a 346-row list stops being a list and becomes a queue that can be worked from the top.",
                ],
                [
                  "Proves it was done",
                  "Maker–checker approval, an evidence gate that will not close a filing without a document, and an append-only trail sitting behind every action.",
                ],
              ].map(([t, d], i) => (
                <Reveal as="li" key={t} delay={i * 0.06}>
                  <span className="rg-num">{i + 1}</span>
                  <h4>{t}</h4>
                  <p>{d}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </Chapter>

      {/* ======================= my role ======================= */}
      <Chapter label="My role" className="rg-nohead">
        <div className="rg-split">
          <Reveal as="h3" className="pp-say pp-say--lg">
            <span className="rg-star" aria-hidden="true">★</span>My role
          </Reveal>
          <div className="rg-role">
            <Reveal as="p" className="rg-body">
              <strong>
                I designed the entire product surface: information architecture, interaction
                design, the design system, and the frontend implementation.
              </strong>
            </Reveal>
            <Reveal as="p" className="rg-body">
              I read the API before I drew anything, and that constraint shaped every decision
              that followed. The priority model uses only fields the list endpoint already
              returns, because a ranking that costs 346 extra requests is a ranking nobody
              ships.
            </Reveal>
            <Reveal as="p" className="rg-body">
              28 frontend files rewritten. Zero backend changes: every fix had to be reachable
              from the client, against a server whose rules I could not alter.
            </Reveal>
            <dl className="rg-facts4">
              {[
                ["Team", "Solo"],
                ["Duration", "2026"],
                ["Design", "Figma"],
                ["Build", "Next.js, TypeScript"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="rg-tag">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Chapter>

      {/* ======================= principles ======================= */}
      <Chapter label="Principles">
        <Head
          title="Four rules I held every decision to"
          aside="Written before the redesign, used afterwards to throw things away. Anything that failed one of these did not ship."
        />
        <Rules
          n={4}
          items={[
            [
              "Answer the question, don’t display the data",
              "A number the reader has to interpret is work I moved onto them. The tracker says “153 days late”, never “01 Apr 2026”.",
            ],
            [
              "Never promise what the server hasn’t agreed to",
              "If a rule can reject an action, the interface checks before the user commits, not after, in a toast.",
            ],
            [
              "Colour is a fact, not decoration",
              "Red means a statutory date has passed. Nothing else in the product is permitted to be red.",
            ],
            [
              "The 300th row matters more than the first",
              "Density, keyboard reach and a layout that never shifts are fatigue features when the list does not end.",
            ],
          ]}
        />
      </Chapter>

      {/* ======================= the walkthrough (ink) ======================= */}
      <Chapter label="The walkthrough" tone="ink">
        <Statement size="lg" className="rg-question">
          So how does a compliance officer get from 346 undifferentiated rows to knowing
          exactly what to do this morning?
        </Statement>
        <Reveal as="p" className="rg-aside" delay={0.1} style={{ marginTop: 48, maxWidth: 640 }}>
          Here is the product I designed, walked through the way a real user moves through it:
          one question at a time.
        </Reveal>
      </Chapter>

      {/* ======================= 01 triage ======================= */}
      <Chapter n="01" label="Triage">
        <Head
          title="What needs me today?"
          aside="The first screen is not a dashboard. It is a shortlist, and it is allowed to be short."
        />
        <Cols
          items={[
            "A compliance officer opens Regis at nine in the morning with one question, and it is never “how are we doing overall”.",
            "So the overview answers the literal question instead: what is overdue, what falls due this week, and what is sitting in your approval queue right now.",
            "Every number states its own meaning. 109 overdue, 26 awaiting your approval, not a dial sitting at 68% with no way to know what moved it.",
            "And the health score explains its own formula on hover, inputs and weights included. A score you cannot interrogate is a score you will learn to ignore.",
          ]}
        />
        <Screen
          name="today"
          alt="Regis's Today screen: four counts (109 overdue, 4 due in 7 days, 26 awaiting review, 23 filed), a priority queue ranked by risk and time pressure, a compliance-health panel at 68%, and a read-only Copilot."
          caption="Today, the overview. Counts are links: every number on this screen opens the exact filtered list behind it."
        />
      </Chapter>

      {/* ======================= 02 the ranking ======================= */}
      <Chapter n="02" label="The ranking">
        <Head
          title="Which of these 109 do I do first?"
          aside="The single highest-leverage change in the project, and the one I got wrong first."
        />
        <div className="rg-two">
          <div>
            <Reveal as="p" className="rg-body">
              Sorting by date is the obvious default, and it is the wrong question. It answers
              “what is oldest” when the user is asking “what is most exposed”. A 153-day-late
              board minute is embarrassing. A 3-day-late RBI return is a regulatory event.
            </Reveal>
            <Reveal as="p" className="rg-body">
              So the tracker needed a rank of its own, under two constraints.
            </Reveal>
            <Reveal as="p" className="rg-body">
              It could use only the three fields the list endpoint already returns (risk level,
              status and due date) because a score that costs 346 extra requests is a score
              nobody ships.
            </Reveal>
            <Reveal as="p" className="rg-body">
              And it had to be explainable. A compliance team will not reorder their morning
              around a number they cannot interrogate, so the formula is printed in the
              product itself, on the column header.
            </Reveal>
          </div>
          <div>
            <Reveal className="rg-model" from="right">
              <p className="rg-tag">The model</p>
              <p className="rg-model-eq">
                priority<i>=</i>risk weight<i>×</i>time pressure
              </p>
              <dl>
                <dt>risk weight</dt>
                <dd>
                  <span>high 3</span>
                  <span>medium 2</span>
                  <span>low 1</span>
                </dd>
                <dt>time pressure</dt>
                <dd>
                  <table>
                    <tbody>
                      {[
                        ["overdue", "3 + log10(1 + days/7) × 1.5"],
                        ["due in ≤ 3d", "2.5"],
                        ["due in ≤ 7d", "2.0"],
                        ["due in ≤ 30d", "1.0"],
                        ["awaiting check", "1.5"],
                        ["closed", "0"],
                      ].map(([k, v]) => (
                        <tr key={k}>
                          <td>{k}</td>
                          <td>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </dd>
              </dl>
            </Reveal>
            <p className="rg-model-note">
              Diminishing returns are deliberate: 400 days late is worse than 30, but not
              thirteen times worse.
            </p>
          </div>
        </div>

        <div className="rg-scores">
          <p className="rg-tag">What the scores actually look like on the real portfolio</p>
          <Reveal as="figure" from="in" className="rg-plot">
            <div className="rg-plot-head">
              <span className="rg-tag">Attempt 01</span>
              <b>Lateness capped: the overdue population collapses onto three scores</b>
            </div>
            <Img
              name="plot-capped"
              pan={720}
              alt="Dot plot of priority scores with lateness capped: the overdue obligations stack in three tall columns, almost all at a score of exactly 15."
            />
            <div className="rg-plot-foot">
              <p className="is-alert">
                Every high-risk breach scored exactly 15.0, whether it lapsed 60 days ago or
                400. 107 of the 109 overdue items landed on just three values, so the column
                discriminated nothing at the exact moment it was needed.
              </p>
              <ul className="rg-legend">
                <li>
                  <i className="is-red" />
                  score ≥ 9: critical band
                </li>
                <li>
                  <i />
                  all other open obligations
                </li>
                <li>one dot = one obligation</li>
              </ul>
            </div>
          </Reveal>
          <Reveal as="figure" from="in" className="rg-plot">
            <div className="rg-plot-head">
              <span className="rg-tag">Shipped</span>
              <b>Log curve: the same 346 obligations, pulled apart</b>
            </div>
            <Img
              name="plot-log"
              pan={720}
              alt="Dot plot of the shipped log-curve scores: the same obligations spread across the whole range, the critical band scattered rather than stacked."
            />
            <div className="rg-plot-foot">
              <p>
                The same 346 obligations, separated into 57 distinct priority scores. The queue
                can finally be worked from the top down, and every row can say why it sits
                where it does.
              </p>
              <p className="is-note">
                Distribution modelled from the live portfolio: 346 obligations for one entity,
                109 of them past due. One dot is one obligation; horizontal position is its
                priority score.
              </p>
            </div>
          </Reveal>
        </div>
        <Reveal as="p" className="rg-body rg-close-line">
          The score, not the band, orders the queue, and the formula ships inside the product:
          the Priority column header explains itself on hover. A ranking a compliance team
          cannot interrogate is a ranking they will quietly ignore.
        </Reveal>
      </Chapter>

      {/* ======================= 03 the queue ======================= */}
      <Chapter n="03" label="The queue">
        <Head
          title="Can the queue explain itself?"
          aside="Information density is not the enemy of clarity. Spending a column on something the row can encode in two pixels is."
        />
        <Screen
          framed
          name="queue"
          alt="Regis's obligations tracker, overdue view: rows grouped under Overdue with a count of 109, each with a priority score, risk ramp, owner, statutory due date and days late, two rows selected with a bulk-action bar. Five numbered markers point to the features described below."
        />
        <ol className="rg-key">
          {[
            ["Saved views", "The five questions a compliance lead actually opens the product to ask, with live counts. No filter-building to start the day."],
            ["Urgency bands", "Rows group under Overdue / Due soon / Later with counts, so scrolling never loses the sense of where you are."],
            ["Priority score", "Default sort. Shows the score and its band, and explains its own formula on hover."],
            ["Relative due date", "“153 days late” sits under the statutory date. The interface does the arithmetic, 346 times."],
            ["Urgency rail", "A 2px left edge encodes overdue, due-soon and in-review without spending a column on it."],
          ].map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.05}>
              <span className="rg-key-n">{i + 1}</span>
              <h4>{t}</h4>
              <p>{d}</p>
            </Reveal>
          ))}
        </ol>
      </Chapter>

      {/* ======================= 04 confirmation ======================= */}
      <Chapter n="04" label="Confirmation">
        <Head
          title="Am I sure before I commit?"
          aside="The server could already refuse these actions. The interface simply was not asking it."
        />
        <div className="rg-two">
          <Reveal as="p" className="rg-body">
            Regis enforces an evidence gate on the server: a filing cannot be closed without a
            primary document on record. The bulk approve dialog did not know that. It counted
            the rows you had ticked, told you what it was about to do, and then found out the
            truth one row at a time, after you had committed.
          </Reveal>
          <Reveal as="p" className="rg-body" delay={0.06}>
            The fix is not a better error message. It is moving the question earlier. The
            dialog now runs the same gate check against every selected row while you are still
            deciding, and reports what will actually happen, including the fact that the honest
            answer is sometimes zero.
          </Reveal>
        </div>
        <Compare
          before={{
            name: "confirm-before",
            alt: "The old bulk dialog: “Approve 5 obligations? 5 items will be changed.” Below it, after approving, an error: 5 of 5 failed, primary evidence required.",
            caption:
              "The count was a promise the interface had no authority to make. Five clicks of work, five failures, and a permanent record of five rejected attempts.",
          }}
          after={{
            name: "confirm-after",
            alt: "The shipped dialog, checked against the evidence gate first: 0 can be filed now, 5 would be blocked, with an option to override and record a reason.",
            caption:
              "The same information, delivered while it is still a decision instead of an incident. Zero is a legitimate answer, and saying it out loud is what makes the dialog trustworthy.",
          }}
        />
      </Chapter>

      {/* ======================= 05 evidence ======================= */}
      <Chapter n="05" label="Evidence">
        <Head
          title="Where is the proof?"
          aside="The most expensive failure in a compliance tool is the one that produces no error at all."
        />
        <div className="rg-two">
          <Reveal as="p" className="rg-body">
            Regis de-duplicates documents on content hash: upload the same board resolution
            twice and the second upload resolves to the first record. Correct storage behaviour,
            and completely invisible to anyone reading the interface.
          </Reveal>
          <Reveal as="p" className="rg-body" delay={0.06}>
            But one board resolution legitimately satisfies four separate obligations. The
            uploader attached it to the first, then failed silently on every one after it. The
            repair was not in the uploader: it was admitting that uploading a file and attaching
            evidence are two different actions.
          </Reveal>
        </div>
        <Compare
          before={{
            name: "evidence-before",
            alt: "Before: one uploaded board-minutes file attached to the first of four obligations; the other three read “nothing happens”.",
            caption:
              "No error, no explanation, and no second route to a document the system already held. The user’s only remaining move was to rename the file and try to defeat the hash.",
          }}
          after={{
            name: "evidence-after",
            alt: "Shipped: an Attach evidence picker with “Choose existing”, linking the same board-minutes file; all four obligations read “attached”.",
            caption:
              "One new control, no new concepts. Evidence already in the repository can be reached from any obligation it legitimately satisfies, and every link is its own audit event.",
          }}
        />
      </Chapter>

      {/* ======================= 06 the record ======================= */}
      <Chapter n="06" label="The record">
        <Head
          title="What am I putting on record?"
          aside="The strongest accessibility argument I made on this project was also the strongest compliance argument."
        />
        <div className="rg-two">
          <Reveal as="p" className="rg-body">
            When a checker rejects a filing, the reason they type is appended to a trail that
            cannot be edited or deleted, and that is the document an inspection reads years
            later. Regis collected it in <code>window.prompt()</code>.
          </Reveal>
          <Reveal as="p" className="rg-body" delay={0.06}>
            A native prompt cannot be validated, cannot say what it is for, cannot be
            focus-trapped, and accepts “asdf”. Five of them were writing into a permanent
            regulatory record. Replacing them was one change that improved accessibility, error
            prevention and evidentiary quality at once.
          </Reveal>
        </div>
        <Compare
          before={{
            name: "record-before",
            alt: "Before: a native browser prompt, “Reason for rejection:”, with “asdf” typed in.",
            caption:
              "Unvalidated, unexplained, impossible to trap for keyboard users, and perfectly happy to write “asdf” into an append-only regulatory trail.",
          }}
          after={{
            name: "record-after",
            alt: "Shipped: a “Reject this filing” dialog explaining that the action is written to the audit trail permanently, with a required reason field, a minimum of 8 characters, and a red Reject filing button.",
            caption:
              "The same two clicks. The dialog now states what the action costs, names where the sentence is going, and refuses a reason too short to mean anything to anyone reading it later.",
          }}
        />
      </Chapter>

      {/* ======================= 07 the trail ======================= */}
      <Chapter n="07" label="The trail">
        <Head
          title="What happened, and who did it?"
          aside="An audit trail nobody can query is a log file with better typography."
        />
        <Cols
          items={[
            "Every action in Regis writes an immutable event: who did it, what changed, when, and the reason they gave for it.",
            "315 of those events existed before I started. The interface presented them as one flat reverse-chronological list, which is the least useful shape the data could take.",
            "The question an auditor actually asks is narrower than “what happened”. It is: show me the exceptions. Where did somebody close a filing without the evidence the rules require?",
            "So the trail filters to overrides. Ten surfaced immediately, and the filter is labelled with the range it actually searched, rather than implying it found them all.",
          ]}
        />
        <Screen
          name="trail"
          alt="Regis's audit trail filtered to Exceptions: rows of filings moved from Ready for review to Completed with the evidence gate overridden, each with who, when and the reason given, under a label reading “10 exceptions in events 51–100”."
          caption="Audit trail, filtered to exceptions. The label reads “10 exceptions in events 51–100” because that is the honest scope of what the endpoint returns."
        />
      </Chapter>

      {/* ======================= 08 the output ======================= */}
      <Chapter n="08" label="The output">
        <Head
          title="The board never logs in."
          aside="Most of the people who depend on this product will only ever see what it exports."
        />
        <Cols
          items={[
            "A compliance function is judged once a quarter, in a board meeting, by people who will never open the tracker.",
            "So the reporting view is designed to be read outside the product: position by category, exceptions called out by name, and the period stated plainly on the page itself.",
            "It is deliberately plain. A board pack that looks like a dashboard invites questions about the dashboard, not about the compliance position it is supposed to describe.",
          ]}
        />
        <Screen
          name="board"
          alt="Regis's compliance report: a provisional-report notice, the entity, date and 68% health, a plain summary sentence, four counts, and the first five overdue obligations, with HTML and PDF export."
          caption="Reports, the board pack. Built to be printed and read cold, by someone who has no context and no login."
        />
      </Chapter>

      {/* ======================= 09 the system ======================= */}
      <Chapter n="09" label="The system">
        <Head
          title="Ledger"
          aside="A system with a point of view, rather than a component library with a colour picker."
        />
        <Rules
          n={4}
          items={[
            ["Light-first", "Compliance work happens in daylight offices, and the output ends up printed and filed. A dark-by-default product would have been a portfolio decision, not a user one."],
            ["Hairlines, not cards", "Every card border is another line the eye has to parse. A 346-row table already has all the structure it needs; the system’s job is to stop adding more."],
            ["Colour is rationed", "Red means a statutory date has passed. Nothing else in the product is allowed to be red, because if everything can be red then nothing is."],
            ["Two modes, one meaning", "Twenty-seven semantic tokens resolve per mode. Nothing references a hex value directly, so dark mode is a remap rather than a redesign."],
          ]}
        />
        <Reveal as="figure" from="in" className="rg-swatches">
          <p className="rg-tag">Colour · 27 semantic tokens × 2 modes</p>
          <Img
            name="swatches"
            pan={680}
            alt="Ledger's colour tokens in eight families (ground, ink, structure, accent, critical, warning, good, info), light mode above and the same tokens in dark mode below."
          />
        </Reveal>
        <div className="rg-type">
          <div>
            <p className="rg-tag">Type · 14 styles, two families</p>
            <dl className="rg-ramp">
              {[
                ["Display/Score", "is-score", "15.1"],
                ["Heading/H1", "is-h1", "Obligations"],
                ["Heading/H3", "is-h3", "Board Meetings – Minimum Four Per Year"],
                ["Body/Default", "is-body", "Every dated filing for this entity, ordered by what deserves attention first."],
                ["Label/Table header", "is-label", "OBLIGATION PRIORITY RISK DUE"],
                ["Mono/Default", "is-mono", "BM-2026-04-01 · MGT-15"],
              ].map(([k, cls, v], i) => (
                <Reveal key={k} delay={i * 0.04}>
                  <dt>{k}</dt>
                  <dd className={cls}>{v}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
          <div className="rg-built">
            <h4>Built once, used everywhere</h4>
            <p className="rg-body" style={{ fontSize: 16 }}>
              Ten component sets carry every state the product can be in: button, badge,
              priority, risk ramp, row, field, tab, dialog, empty and skeleton. The screens in
              this case study are assembled from them, not drawn beside them.
            </p>
            <Reveal as="figure" from="in" className="rg-fig">
              <Img
                name="dark"
                pan={700}
                alt="The obligations tracker in dark mode, identical in layout to the light one."
              />
              <figcaption className="rg-cap" style={{ marginLeft: 0 }}>
                The same screen, dark mode. Nothing was redrawn: the tokens resolve to a second
                set of values.
              </figcaption>
            </Reveal>
          </div>
        </div>
      </Chapter>

      {/* ======================= 10 fatigue ======================= */}
      <Chapter n="10" label="Fatigue">
        <Head
          title="Designing for the 300th row"
          aside="Everything before this is about the first decision of the day. This is about the four hundredth."
        />
        <Rules
          n={3}
          items={[
            ["Relative time, everywhere", "“153 days late” sits under the statutory date, so the reader never does subtraction. Across 346 rows that is 346 small calculations the interface takes back."],
            ["Keyboard triage", "J and K walk the queue, X selects, Enter opens. A checker can clear a morning of approvals without reaching for the mouse once."],
            ["Colour is never alone", "Risk is a three-bar ramp as well as a hue; status is a word as well as a tint. Nothing in the product depends on distinguishing red from amber."],
            ["The layout never moves", "Rows keep their height whether or not a badge is present, so the eye can hold a single column while scrolling instead of re-finding it every few rows."],
            ["Grouped urgency bands", "Rows sit under Overdue, Due soon and Later with live counts, so a long scroll never loses the sense of where you are in the queue."],
            ["Overlays behave", "Escape closes, focus is trapped while the sheet is open and returned to the exact row you came from. The old drawer advertised this and did none of it."],
          ]}
        />
      </Chapter>

      {/* ======================= her close (ink) ======================= */}
      <Chapter label="Thanks for reading" tone="ink" className="rg-nohead">
        <Reveal as="p" className="rg-end-name">
          Regis
        </Reveal>
        <Reveal as="p" className="rg-end-thanks" delay={0.08}>
          Thanks for reading.
        </Reveal>
        <dl className="rg-end-meta">
          {[
            ["Design & build", "Mrinali Bhardwaj"],
            ["Project", "Regis · NBFC compliance"],
            ["Year", "2026"],
            ["Tools", "Figma, Next.js, TypeScript"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="rg-tag">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Chapter>
    </>
  );
}
