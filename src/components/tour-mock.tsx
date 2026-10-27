"use client";

import { cn } from "~/lib/utils";

const channels = [
  { name: "general", unread: 0 },
  { name: "announcements", unread: 2 },
  { name: "cohort-4", unread: 3, active: true },
  { name: "resources", unread: 0 },
  { name: "help-desk", unread: 0 },
];

const people = [
  { name: "Amara", hue: 276 },
  { name: "Tomas", hue: 192 },
  { name: "Priya", hue: 330 },
  { name: "Jun", hue: 44 },
];

const titles = [
  ["# cohort-4", "Frontend engineering · Week 3"],
  ["Cohort pulse", "12 learners · 4 sessions this week"],
  ["Buzz · cohort-4", "Live class · Building accessible interfaces"],
  ["Telex", "AI agent · this workspace"],
];

function Avatar({ hue, label }: { hue: number; label: string }) {
  return (
    <span className="mock__avatar" style={{ ["--h" as string]: hue }}>
      {label}
    </span>
  );
}

function ChannelsScene() {
  return (
    <>
      <div className="mock__msgs">
        <div className="mock__msg">
          <Avatar hue={330} label="PN" />
          <div>
            <b>Priya Nair <em>10:12</em></b>
            <p>
              Reminder: the Week 3 project is due <strong>Friday</strong>. The
              checklist is pinned in #resources.
            </p>
          </div>
        </div>
        <div className="mock__msg">
          <Avatar hue={192} label="TR" />
          <div>
            <b>Tomas Reyes <em>10:14</em></b>
            <p>
              I pushed the starter repo and a worked example for the useState
              exercise.
            </p>
          </div>
        </div>
        <div className="mock__msg">
          <Avatar hue={44} label="JP" />
          <div>
            <b>Jun Park <em>10:17</em></b>
            <p>When should state live in the parent instead of the child?</p>
          </div>
        </div>
        <div className="mock__msg">
          <Avatar hue={276} label="AO" />
          <div>
            <b>Amara Okafor <em>10:19</em></b>
            <span className="mock__file">
              <i>PDF</i>
              <span>
                <b>week-3-starter.pdf</b>
                <em>2.4 MB · pinned in #resources</em>
              </span>
              <strong>Open</strong>
            </span>
          </div>
        </div>
        <div className="mock__typing">
          <span><i /><i /><i /></span> Amara is typing
        </div>
      </div>
      <div className="mock__composer">
        <span>Message #cohort-4</span>
        <b>Send</b>
      </div>
    </>
  );
}

function CohortScene() {
  return (
    <div className="mock__cohort">
      <div className="mock__stats">
        <div><b>12</b><span>learners</span></div>
        <div><b>98%</b><span>active this week</span></div>
        <div><b>4</b><span>live sessions</span></div>
      </div>

      <div className="mock__announce">
        <span className="mock__pill">Announcement</span>
        <p>Live class Thursday — building accessible interfaces.</p>
        <div className="mock__row">
          <div className="mock__faces">
            <Avatar hue={276} label="AO" />
            <Avatar hue={330} label="PN" />
            <Avatar hue={192} label="TR" />
          </div>
          <b className="mock__btn">Publish</b>
        </div>
      </div>

      <div className="mock__bars">
        <div><span>Week 1</span><i style={{ ["--w" as string]: "62%" }} /></div>
        <div><span>Week 2</span><i style={{ ["--w" as string]: "81%" }} /></div>
        <div><span>Week 3</span><i style={{ ["--w" as string]: "94%" }} /></div>
      </div>
    </div>
  );
}

function BuzzScene() {
  return (
    <div className="mock__buzz">
      <div className="mock__buzz-top">
        <span className="mock__rec"><i /> LIVE</span>
        #cohort-4 · 00:12
      </div>
      <div className="mock__buzz-grid">
        {people.map((person, i) => (
          <div
            className={cn("mock__buzz-tile", i === 0 && "is-speaking")}
            key={person.name}
          >
            <span
              className="mock__buzz-orb"
              style={{ ["--h" as string]: person.hue }}
            >
              {person.name.slice(0, 1)}
            </span>
            <b>{person.name}</b>
          </div>
        ))}
      </div>
      <div className="mock__buzz-controls">
        <span className="mock__ctl">mic</span>
        <span className="mock__ctl">cam</span>
        <span className="mock__ctl">share</span>
        <span className="mock__ctl mock__ctl--end">leave</span>
      </div>
    </div>
  );
}

function AgentScene() {
  return (
    <div className="mock__agent">
      <div className="mock__agent-row">
        <span className="mock__agent-orb">T</span>
        <div className="mock__agent-bubble">
          <b>Telex <em>AI agent</em></b>
          <p>Here is this week, summarised:</p>
        </div>
      </div>

      <div className="mock__summary">
        <b>Week 3 · at a glance</b>
        <span><i /> State should live at the lowest common ancestor.</span>
        <span><i /> Project due Friday, 11:59 PM.</span>
        <span><i /> Thursday: accessible interfaces, 5 PM.</span>
      </div>

      <div className="mock__agent-row mock__agent-row--me">
        <div className="mock__agent-bubble mock__agent-bubble--me">
          <p>Save that to #resources</p>
        </div>
      </div>

      <div className="mock__agent-row">
        <span className="mock__agent-orb">T</span>
        <div className="mock__agent-bubble">
          <p>Pinned. 3 resources updated.</p>
        </div>
      </div>

      <div className="mock__typing">
        <span><i /><i /><i /></span> Telex is checking the thread
      </div>
    </div>
  );
}

export default function TourMock({ step }: { step: number }) {
  const [title, subtitle] = titles[step] ?? titles[0];

  return (
    <div className="mock">
      <div className="mock__chrome">
        <span className="mock__dots"><i /><i /><i /></span>
        <span className="mock__url">app.zedu.io / cohort-4</span>
        <span className="mock__live"><i /> live</span>
      </div>

      <div className="mock__body">
        <div className="mock__rail">
          <span className="mock__logo">Z</span>
          <span className="mock__rail-dot is-on" />
          <span className="mock__rail-dot" />
          <span className="mock__rail-dot" />
          <span className="mock__rail-dot" />
          <span className="mock__rail-dot" />
          <span className="mock__rail-dot" />
        </div>

        <aside className="mock__side">
          <div className="mock__ws">
            <span className="orb" style={{ ["--h" as string]: 276 }}>Z</span>
            <div>
              <b>Zedu</b>
              <small>Cohort 4</small>
            </div>
          </div>

          <div className="mock__search">Search or jump to...</div>

          <span className="mock__label">Channels</span>
          {channels.map((channel) => (
            <span
              className={cn("mock__chan", channel.active && "is-on")}
              key={channel.name}
            >
              <i>#</i>
              {channel.name}
              {channel.unread > 0 && <em>{channel.unread}</em>}
            </span>
          ))}

          <span className="mock__label mock__label--now">Here now</span>
          {people.slice(0, 3).map((person) => (
            <span className="mock__person" key={person.name}>
              <Avatar hue={person.hue} label={person.name.slice(0, 1)} />
              {person.name}
            </span>
          ))}
        </aside>

        <div className="mock__main">
          <div className="mock__head">
            <div>
              <b>{title}</b>
              <span>{subtitle}</span>
            </div>
            <div className="mock__head-actions">
              <span className="mock__faces">
                <Avatar hue={276} label="AO" />
                <Avatar hue={192} label="TR" />
                <Avatar hue={330} label="PN" />
              </span>
              <b className="mock__btn mock__btn--ghost">Buzz</b>
            </div>
          </div>

          <div className="mock__scene" key={step}>
            {step === 0 && <ChannelsScene />}
            {step === 1 && <CohortScene />}
            {step === 2 && <BuzzScene />}
            {step === 3 && <AgentScene />}
          </div>
        </div>
      </div>
    </div>
  );
}
