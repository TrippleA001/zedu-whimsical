export type Member = {
  id: string;
  name: string;
  role: string;
  hue: number;
  online: boolean;
  vibe: string;
  bot?: boolean;
};

export type Reaction = { emoji: string; by: string[] };

export type Message = {
  id: string;
  authorId: string;
  body: string;
  time: string;
  reactions: Reaction[];
  replies?: Message[];
  image?: string;
  system?: boolean;
};

export type Channel = {
  id: string;
  name: string;
  emoji: string;
  topic: string;
  unread: number;
  dm?: boolean;
  messages: Message[];
};

export const ME = "you";

export const members: Member[] = [
  {
    id: "amara",
    name: "Amara Okafor",
    role: "Instructor",
    hue: 276,
    online: true,
    vibe: "reviewing week 3 projects",
  },
  {
    id: "tomas",
    name: "Tomas Reyes",
    role: "Teaching assistant",
    hue: 192,
    online: true,
    vibe: "answering in #help-desk",
  },
  {
    id: "priya",
    name: "Priya Nair",
    role: "Cohort lead",
    hue: 330,
    online: true,
    vibe: "prepping today's session",
  },
  {
    id: "jun",
    name: "Jun Park",
    role: "Learner",
    hue: 44,
    online: false,
    vibe: "last seen 12m ago",
  },
  {
    id: "nkem",
    name: "Nkem Adeyemi",
    role: "Program manager",
    hue: 14,
    online: true,
    vibe: "onboarding cohort 5",
  },
  {
    id: "telex",
    name: "Telex",
    role: "AI agent",
    hue: 152,
    online: true,
    vibe: "summarising threads",
    bot: true,
  },
];

export const memberById = (id: string) =>
  members.find((m) => m.id === id) ?? members[0];

const t = (h: string, m?: string) => (m ? `${h}:${m}` : h);

export const seedChannels: Channel[] = [
  {
    id: "general",
    name: "general",
    emoji: "💬",
    topic: "Announcements, questions, and everything in between.",
    unread: 0,
    messages: [
      {
        id: "g1",
        authorId: "nkem",
        body: "Welcome to **Zedu** 👋 This is the shared space for Cohort 4 — frontend engineering. Say hello, ask anything, and use #help-desk when you're stuck.",
        time: t("09:02"),
        reactions: [
          { emoji: "👋", by: ["amara", "priya", "tomas"] },
          { emoji: "💜", by: ["jun"] },
        ],
      },
      {
        id: "g2",
        authorId: "telex",
        body: "I'm Telex, your AI agent for this workspace. I can summarise long threads, find resources, and remind you what's due. Try asking me for a recap.",
        time: t("09:03"),
        reactions: [{ emoji: "🤖", by: ["nkem", "jun"] }],
      },
      {
        id: "g3",
        authorId: "amara",
        body: "Office hours move to **4:00 PM** this week. Same Buzz room, same link in #announcements.",
        time: t("09:06"),
        reactions: [{ emoji: "✅", by: ["nkem", "priya", "tomas", "jun"] }],
      },
      {
        id: "g4",
        authorId: "priya",
        body: "If you're new: press `⌘K` to jump anywhere, and use the pen icon in the composer to send a drawing instead of a paragraph.",
        time: t("09:08"),
        reactions: [],
      },
    ],
  },
  {
    id: "announcements",
    name: "announcements",
    emoji: "📣",
    topic: "Everything the cohort needs to know, in one place.",
    unread: 2,
    messages: [
      {
        id: "a1",
        authorId: "nkem",
        body: "**Live class this Thursday** — Building accessible interfaces. 5:00 PM WAT, in Buzz. Recording will land in #resources the next morning.",
        time: t("08:12"),
        reactions: [{ emoji: "📅", by: ["jun", "tomas"] }],
      },
      {
        id: "a2",
        authorId: "amara",
        body: "Week 3 project brief is up in #resources. Submit by **Friday, 11:59 PM**. Bring questions to office hours, not to your future self at midnight.",
        time: t("08:40"),
        reactions: [{ emoji: "😭", by: ["jun", "priya"] }],
      },
    ],
  },
  {
    id: "cohort-4",
    name: "cohort-4",
    emoji: "🎓",
    topic: "Frontend engineering · Week 3 · State and accessibility.",
    unread: 3,
    messages: [
      {
        id: "c1",
        authorId: "priya",
        body: "Reminder: the Week 3 project is due **Friday**. The checklist is in #resources — if something is unclear, ask here so everyone benefits.",
        time: t("10:12"),
        reactions: [{ emoji: "🎯", by: ["jun", "tomas"] }],
      },
      {
        id: "c2",
        authorId: "tomas",
        body: "I pushed the starter repo and a worked example for the `useState` exercise. Clone it before Thursday's class.",
        time: t("10:14"),
        reactions: [
          { emoji: "🙏", by: ["jun", "priya"] },
          { emoji: "👀", by: ["amara"] },
        ],
      },
      {
        id: "c3",
        authorId: "jun",
        body: "Quick question — when should state live in the parent instead of the child? I keep moving things up and losing track.",
        time: t("10:17"),
        reactions: [],
        replies: [
          {
            id: "c3r1",
            authorId: "tomas",
            body: "Rule of thumb: lift it when a sibling needs to read it, keep it local otherwise.",
            time: t("10:17"),
            reactions: [],
          },
          {
            id: "c3r2",
            authorId: "priya",
            body: "We'll draw it on the whiteboard on Thursday — bring your component tree.",
            time: t("10:18"),
            reactions: [],
          },
        ],
      },
      {
        id: "c4",
        authorId: "amara",
        body: "Move it up only when **two siblings** need it, or when the parent needs to reset it. Otherwise keep it close to where it's used. We'll draw this on the whiteboard on Thursday.",
        time: t("10:18"),
        reactions: [{ emoji: "💡", by: ["jun", "tomas", "priya"] }],
      },
      {
        id: "c5",
        authorId: "telex",
        body: "Thread summary: state should live at the lowest common ancestor of the components that need it. Two resources pinned to #resources.",
        time: t("10:19"),
        reactions: [{ emoji: "🤖", by: ["priya"] }],
      },
    ],
  },
  {
    id: "help-desk",
    name: "help-desk",
    emoji: "🛟",
    topic: "Stuck? Ask here. No question is too small.",
    unread: 0,
    messages: [
      {
        id: "h1",
        authorId: "jun",
        body: "My dev server keeps crashing after I installed a package. Anyone seen this?",
        time: t("07:55"),
        reactions: [],
      },
      {
        id: "h2",
        authorId: "tomas",
        body: "Delete `node_modules` and reinstall, then check your Node version against the README. If that doesn't fix it, drop the error here.",
        time: t("07:58"),
        reactions: [{ emoji: "✅", by: ["jun"] }],
      },
    ],
  },
  {
    id: "resources",
    name: "resources",
    emoji: "📚",
    topic: "Slides, recordings, starter repos, and reading lists.",
    unread: 0,
    messages: [
      {
        id: "r1",
        authorId: "telex",
        body: "Pinned this week: **Week 3 project brief**, **Starter repo**, and the **State & accessibility slides**. All links are in the Files tab too.",
        time: t("08:20"),
        reactions: [
          { emoji: "📌", by: ["amara", "priya"] },
          { emoji: "💜", by: ["jun"] },
        ],
      },
    ],
  },
  {
    id: "random",
    name: "random",
    emoji: "🎲",
    topic: "The pressure valve. Memes, music, and mild chaos.",
    unread: 1,
    messages: [
      {
        id: "ra1",
        authorId: "nkem",
        body: "Someone in Cohort 3 made a keyboard that sounds like a rainstorm. I have never been more productive and I have never shipped less.",
        time: t("11:02"),
        reactions: [{ emoji: "🌧️", by: ["amara", "jun"] }],
      },
    ],
  },
  {
    id: "dm-amara",
    name: "Amara Okafor",
    emoji: "",
    topic: "Direct message",
    unread: 0,
    dm: true,
    messages: [
      {
        id: "d1",
        authorId: "amara",
        body: "Don't forget the showcase on Friday. Bring the weird version of your project, not the safe one.",
        time: t("09:44"),
        reactions: [],
      },
    ],
  },
];

export const autoReplies: { authorId: string; body: string }[] = [
  {
    authorId: "amara",
    body: "Good question — drop it in #help-desk and I'll take a look before class.",
  },
  {
    authorId: "tomas",
    body: "I'll add a worked example to the starter repo this afternoon.",
  },
  {
    authorId: "priya",
    body: "Got it. I'll add that to the Week 3 checklist so nobody misses it.",
  },
  {
    authorId: "telex",
    body: "Noted. I've summarised this thread and pinned it to #resources.",
  },
  {
    authorId: "nkem",
    body: "Thanks for flagging — I'll share it with the rest of the cohort.",
  },
  {
    authorId: "jun",
    body: "That makes sense now, thank you!",
  },
];

export const quickEmoji = ["💜", "✨", "🙌", "🔥", "😭", "🎯", "💡", "👀"];

export const hues = [258, 330, 172, 54, 276, 0];
