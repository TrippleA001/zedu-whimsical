"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import Link from "next/link";
import SilkCanvas from "~/components/silk-canvas";
import VortexCanvas from "~/components/vortex-canvas";
import TourMock from "~/components/tour-mock";
import Icon from "~/components/icon";
import SoundToggle from "~/components/sound-toggle";
import { ThemeToggle } from "~/components/theme";
import {
  CountUp,
  Cursor,
  Magnetic,
  ScrollProgress,
  Tilt,
  useReveal,
} from "~/components/motion";
import { cn } from "~/lib/utils";
import { playCue, setAmbienceIntensity } from "~/lib/sound";

/* ------------------------------------------------------------------ data */

const products = [
  { label: "Buzz", href: "#features", hint: "Meetings that feel like rooms" },
  { label: "Channels", href: "#features", hint: "A home for every cohort" },
  { label: "File Management", href: "#features", hint: "Every resource, one place" },
];

const solutions = [
  { label: "Bootcamps", href: "#why" },
  { label: "Schools", href: "#why" },
  { label: "Universities", href: "#why" },
];

const features = [
  {
    title: "Organized Channels",
    description:
      "Create subject-based spaces for every cohort. Keep discussions focused, announcements clear, and conversations threaded so nothing gets lost.",
    image: "/images/homepage/features/organised-channels.webp",
  },
  {
    title: "Cohort Communication",
    description:
      "Manage bootcamps, classes, and learning groups with clearly defined communication spaces. Keep educators aligned and learners informed in real time.",
    image: "/images/homepage/features/cohort-communication.webp",
  },
  {
    title: "Calls & Collaboration",
    description:
      "Work across languages, time zones, and regions with chats, docs, and meetings in one place and bridge every gap with real-time collaboration tools.",
    image: "/images/homepage/features/calls-and-collaboration.webp",
  },
  {
    title: "AI Agents",
    description:
      "Deploy intelligent assistants that automate routine tasks, support learners instantly, and keep educators focused on what truly matters — teaching.",
    image: "/images/homepage/features/ai-agents.webp",
  },
];

const metrics = [
  { title: "3x", label: "faster cohort coordination" },
  { title: "40%", label: "less admin workload" },
  { title: "24/7", label: "AI learner support" },
];

const whyCards = [
  {
    title: "Built for Education, Not Business",
    desc: "Zedu is designed around cohorts, classrooms, and structured learning — with features that support educators instead of corporate workflows.",
  },
  {
    title: "No Per-Student Pricing",
    desc: "Scale your cohorts without worrying about per-user fees. Flexible pricing built for growing classes and bootcamps.",
  },
  {
    title: "AI-Powered Teaching Support",
    desc: "Automate reminders, summarize discussions, and assist learners instantly, so you spend less time managing and more time teaching.",
  },
];

const reasons = [
  {
    title: "Role-Based Access Control",
    desc: "Define who can post, announce, moderate, or host sessions. Keep teacher spaces private and student channels organized with structured permissions.",
  },
  {
    title: "Private Cohorts & Controlled Spaces",
    desc: "Each cohort runs in its own secure environment. No cross-over, no messy group chats, just focused learning spaces.",
  },
  {
    title: "Data Protection & Platform Reliability",
    desc: "Conversations, recordings, and resources are securely stored and accessible only to authorized members with reliable uptime for live sessions.",
  },
];

const otherFeatures = [
  {
    title: "Messaging System",
    desc: "Secure, encrypted-in-transit messaging for academic collaboration, where students and educators connect and learn together.",
  },
  {
    title: "Live Teaching",
    desc: "Your digital classroom for meetings and empowering structured discussions, real-time collaboration, and smarter academic engagement.",
  },
  {
    title: "Storyboard",
    desc: "Transforming learning into visual journeys, making complex concepts simple, engaging, and memorable for students.",
  },
  {
    title: "Class Recordings",
    desc: "Revisit, review, and reinforce your learning anytime. Access lessons, clarify concepts, and strengthen understanding anytime.",
  },
  {
    title: "Conversation Mesh",
    desc: "An interconnected learning space where dialogue builds shared knowledge and continuous growth.",
  },
  {
    title: "File Management",
    desc: "Organize, share, and instantly access all your learning resources in one secure, centralized hub that reduces clutter and keeps every class connected.",
  },
  {
    title: "Whiteboard",
    desc: "Interactive visual canvas for real-time sketching, brainstorming, and collaborative ideation.",
  },
  {
    title: "AI class notes",
    desc: "Simplifying complex concepts, empowering students to learn, explore, and master artificial intelligence with practical understanding.",
  },
];

const plans = [
  {
    name: "Starter",
    amount: "₦0",
    period: "/month",
    description: "Best for small classes and educators starting with Zedu.",
    note: "No credit card needed",
    features: [
      "Up to 3 cohorts",
      "Organized learning channels",
      "Basic messaging and threads",
      "File sharing",
    ],
    cta: "Get Started Free",
    featured: false,
  },
  {
    name: "Pro",
    amount: "₦20K",
    period: "/month",
    description: "Best for bootcamps and structured programs.",
    note: "Most popular",
    features: [
      "Everything in Starter, and",
      "Unlimited cohorts",
      "Live classes and collaboration tools",
      "AI study assistants",
      "Assignment and cohort management",
      "Admin moderation tools",
    ],
    cta: "Start Pro Plan",
    featured: true,
  },
  {
    name: "Enterprise",
    amount: "Let's Talk",
    period: "",
    description:
      "Flexible pricing for Universities, large programs, and institutions.",
    note: "For institutions",
    features: [
      "Everything in Pro, and",
      "Advanced AI agents and automation",
      "Institution-level workspace control",
      "Security and compliance tools",
      "Custom integrations",
      "Dedicated onboarding",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

const faqs = [
  {
    q: "What is Zedu?",
    a: "Zedu is a communication and learning platform built for schools, bootcamps, and training programs. It combines structured channels, learning workflows, and AI-powered support to help educators teach and learners stay engaged.",
  },
  {
    q: "How does Zedu support students and learners?",
    a: "Zedu supports learners with organized class spaces, timely reminders, searchable learning materials, and quick help through AI assistants. Students can follow lessons, ask questions, and track progress in one place.",
  },
  {
    q: "Is Zedu difficult to set up for a school or bootcamp?",
    a: "No. Zedu is designed for quick onboarding with simple setup steps, guided workspace creation, and role-based controls. Most teams can start running cohorts or classes in a short time.",
  },
  {
    q: "Does Zedu replace the tools we already use?",
    a: "Zedu brings messaging, live teaching, files, recordings, and AI support into one workspace, so you can retire the patchwork of tools that usually surrounds a cohort.",
  },
];

const words = ["Built", "for", "Bootcamps", "and", "Learning", "Communities"];

/* ------------------------------------------------------------------ page */

export default function LandingPage() {
  const [stuck, setStuck] = useState(false);
  const [step, setStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const canvasWrap = useRef<HTMLDivElement>(null);
  const silkActive = useRef(true);
  const shot = useRef<HTMLDivElement>(null);
  const journey = useRef<HTMLDivElement>(null);
  const journeyProgress = useRef(0);
  const stepRef = useRef(0);

  useReveal();

  useEffect(() => {
    let lastY = window.scrollY;
    let squishTimer: number | undefined;

    const onScroll = () => {
      const y = window.scrollY;
      setStuck(y > 24);

      if (canvasWrap.current) {
        canvasWrap.current.style.opacity = String(Math.max(0, 1 - y / 820));
      }
      silkActive.current = y < 900;

      if (shot.current) {
        shot.current.style.setProperty(
          "--py",
          `${Math.min(y * 0.08, 70).toFixed(2)}px`,
        );

        const dy = y - lastY;
        lastY = y;
        if (Math.abs(dy) > 1) {
          const squash = Math.max(-0.028, Math.min(0.028, dy * 0.00042));
          shot.current.style.setProperty("--sq", squash.toFixed(4));
          window.clearTimeout(squishTimer);
          squishTimer = window.setTimeout(() => {
            shot.current?.style.setProperty("--sq", "0");
          }, 120);
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(squishTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const el = journey.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p =
        total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      journeyProgress.current = p;
      el.style.setProperty("--p", p.toFixed(4));
      setAmbienceIntensity(p);
      const chapter = Math.min(
        features.length - 1,
        Math.floor(p * features.length + 0.0001),
      );
      if (chapter !== stepRef.current) {
        stepRef.current = chapter;
        playCue("chapter");
        startTransition(() => setStep(chapter));
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* on narrow screens the stage is not scroll-pinned, so cycle chapters */
  useEffect(() => {
    if (window.matchMedia("(max-width: 860px)").matches === false) return;
    const id = window.setInterval(() => {
      stepRef.current = (stepRef.current + 1) % features.length;
      playCue("chapter");
      setStep(stepRef.current);
    }, 5200);
    return () => window.clearInterval(id);
  }, []);

  /* a soft tick on hover, a warmer knock on click — never on touch scrub */
  useEffect(() => {
    let lastHover = 0;

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const target = (event.target as HTMLElement | null)?.closest(
        "a, button, .card, .metric-wrap, .price, .pill-card",
      );
      if (!target) return;
      const now = performance.now();
      if (now - lastHover < 90) return;
      lastHover = now;
      playCue("hover");
    };

    const onDown = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest(
        "a, button",
      );
      if (target) playCue("click");
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div className="landing">
      <ScrollProgress />
      <Cursor />

      <div className="aurora" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="grain" aria-hidden />

      <div className="hero-canvas" ref={canvasWrap}>
        <SilkCanvas
          symmetry={6}
          hues={[258, 330, 172, 54, 276]}
          ambient
          interactive
          listenOn="window"
          fadeAfter={30}
          baseWidth={3}
          activeRef={silkActive}
        />
      </div>

      <div className="landing-content">
        <nav className={`nav${stuck ? " is-stuck" : ""}`}>
          <Link href="/" className="nav__brand" aria-label="Zedu home">
            <span className="nav__mark" />
            ZEDU
          </Link>

          <div className="nav__links">
            <div className="nav__item">
              <button className="nav__link" type="button">
                Products <span className="nav__caret">▾</span>
              </button>
              <div className="nav__panel">
                {products.map((item) => (
                  <a className="nav__panel-link" href={item.href} key={item.label}>
                    <b>{item.label}</b>
                    <span>{item.hint}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="nav__item">
              <button className="nav__link" type="button">
                Solutions <span className="nav__caret">▾</span>
              </button>
              <div className="nav__panel">
                {solutions.map((item) => (
                  <a className="nav__panel-link" href={item.href} key={item.label}>
                    <b>{item.label}</b>
                    <span>Built for how you teach</span>
                  </a>
                ))}
              </div>
            </div>

            <a className="nav__link" href="#faq">
              Resources
            </a>
            <a className="nav__link" href="#pricing">
              Pricing
            </a>
            <a className="nav__link" href="#why">
              About Us
            </a>
            <a className="nav__link" href="#cta">
              Download
            </a>
          </div>

          <div className="nav__right">
            <ThemeToggle />
            <SoundToggle />
            <Link href="/studio" className="btn btn--ghost btn--sm">
              Log in
            </Link>
            <Magnetic strength={10}>
              <Link href="/studio" className="btn btn--primary btn--sm">
                Get started free
              </Link>
            </Magnetic>
          </div>
        </nav>

        <header className="hero">
          <div className="hero__inner">
            <div className="hero__eyebrow">
              <b>
                <Icon name="spark" size={11} /> AI-powered
              </b>
              One workspace for modern learning
            </div>

            <h1 className="hero__title">
              {words.map((word, i) => (
                <span
                  className={cn("word", word === "Learning" && "word--accent")}
                  style={{ ["--i" as string]: i }}
                  key={word}
                >
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>

            <p className="hero__sub">
              Bring learners and educators together with organized
              conversations, seamless cohort collaboration, and affordable
              communication tools built for learning communities.
            </p>

            <div className="hero__actions">
              <Magnetic strength={18}>
                <Link href="/studio" className="btn btn--primary btn--lg">
                  Try for free <span aria-hidden>→</span>
                </Link>
              </Magnetic>
              <Magnetic strength={12}>
                <a href="#pricing" className="btn btn--ghost btn--lg">
                  Contact sales
                </a>
              </Magnetic>
            </div>

            <div className="hero__trust">
              <span className="stars" aria-hidden>
                ★★★★★
              </span>
              <b>4.9</b>
              <span>Trusted by most modern educators and learners worldwide</span>
            </div>
          </div>

          <div
            className="hero__shot"
            ref={shot}
            aria-hidden
            onPointerMove={(event) => {
              if (event.pointerType !== "mouse") return;
              const rect = event.currentTarget.getBoundingClientRect();
              const x = (event.clientX - rect.left) / rect.width - 0.5;
              const y = (event.clientY - rect.top) / rect.height - 0.5;
              event.currentTarget.style.setProperty("--ry", `${x * 4}deg`);
              event.currentTarget.style.setProperty("--rx", `${-y * 3}deg`);
            }}
            onPointerLeave={(event) => {
              event.currentTarget.style.setProperty("--ry", "0deg");
              event.currentTarget.style.setProperty("--rx", "0deg");
            }}
          >
            <div className="shot-goo" aria-hidden>
              <span />
              <span />
              <span />
            </div>

            <div className="shot-frame">
              <div className="shot-chrome">
                <i />
                <i />
                <i />
                <span>app.zedu.io</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/homepage/hero-img.webp"
                alt="The Zedu workspace"
                className="shot-img"
              />
            </div>

            <div className="shot-cursor" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M4 2.2 11.4 21l2.3-7.6L21.4 11 4 2.2Z" />
              </svg>
              <span>Amara</span>
            </div>

            <div className="shot-orb shot-orb--a">
              <span className="orb" style={{ ["--h" as string]: 172 }}>
                AO
              </span>
              <em>Amara is teaching</em>
            </div>
            <div className="shot-orb shot-orb--b">
              <span className="orb" style={{ ["--h" as string]: 44 }}>
                JP
              </span>
              <em>3 learners joined</em>
            </div>
          </div>

          <div className="scroll-cue" aria-hidden>
            scroll
            <span />
          </div>
        </header>

        <div className="marquee" aria-hidden>
          <div className="marquee__track">
            {[0, 1].map((dup) => (
              <div className="marquee__item" key={dup}>
                {[
                  "Channels",
                  "Cohorts",
                  "Buzz",
                  "AI Agents",
                  "Whiteboard",
                  "Recordings",
                  "Files",
                  "Search",
                ].map((word) => (
                  <span key={`${dup}-${word}`}>
                    {word} <i />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="section" id="features">
          <div className="section__head">
            <div data-reveal>
              <p className="kicker">the platform</p>
              <h2 className="section__title">
                Everything you need for{" "}
                <em>Modern Learning</em>
              </h2>
            </div>
            <p className="section__note" data-reveal>
              From organized channels to AI-powered assistance, Zedu gives
              educators and learners the tools to communicate, collaborate, and
              grow — all in one place.
            </p>
          </div>

          <div className="journey" ref={journey}>
            <div className="journey__stage">
              <div className="journey__space" aria-hidden>
                <VortexCanvas
                  className="journey__canvas"
                  progressRef={journeyProgress}
                />
                <div className="journey__nebula" />
                <div className="journey__grid" />
                <div className="journey__warp" />
              </div>

              <div className="journey__content">
                <div className="journey__visual">
                  <div className="journey__tunnel" aria-hidden>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <span
                        className="journey__ring"
                        style={{ ["--i" as string]: i }}
                        key={i}
                      />
                    ))}
                  </div>
                  <div className="journey__halo" aria-hidden />

                  <Tilt max={4} className="journey__craft">
                    <div className="shot-frame shot-frame--showcase">
                      {features.map((feature, i) => (
                        <div
                          className={cn(
                            "showcase__media",
                            i === step && "is-on",
                          )}
                          key={feature.title}
                        >
                          <TourMock step={i} />
                        </div>
                      ))}
                    </div>
                  </Tilt>

                  <span className="journey__chip journey__chip--a" aria-hidden>
                    <i className="orb" style={{ ["--h" as string]: 172 }}>
                      12
                    </i>
                    learners in #cohort-4
                  </span>
                  <span className="journey__chip journey__chip--b" aria-hidden>
                    <Icon name="spark" size={11} /> Telex is taking notes
                  </span>
                </div>

                <div className="journey__steps">
                  <div className="journey__step-stack">
                    {features.map((feature, i) => (
                      <article
                        className={cn(
                          "journey__step",
                          i === step && "is-active",
                        )}
                        key={feature.title}
                      >
                        <span className="journey__count">
                          0{i + 1} <em>/ 04</em>
                        </span>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                        {i === features.length - 1 ? (
                          <Link
                            href="/studio"
                            className="btn btn--primary journey__enter"
                          >
                            Enter Zedu Studio <span aria-hidden>→</span>
                          </Link>
                        ) : (
                          <span className="journey__cue">
                            Keep scrolling to fly deeper
                            <i aria-hidden>→</i>
                          </span>
                        )}
                      </article>
                    ))}
                  </div>

                  <div className="journey__progress" aria-hidden>
                    <span>
                      <i
                        style={{
                          width: `${((step + 1) / features.length) * 100}%`,
                        }}
                      />
                    </span>
                    <b>0{step + 1}</b>
                  </div>
                </div>
              </div>

              <div className="journey__hud" aria-hidden>
                <span className="journey__rec">
                  <i /> fly-through
                </span>
                <span className="journey__hud-label">
                  {step === features.length - 1
                    ? "You're inside Zedu Studio"
                    : "Scroll to enter Zedu Studio"}
                </span>
                <span className="journey__hud-sep" />
                <span className="journey__hud-num">
                  0{step + 1} / 0{features.length}
                </span>
              </div>
            </div>
          </div>

          <div className="metrics">
            <div className="metrics__signal" data-reveal aria-hidden>
              <span className="metrics__live">
                <i /> live cohort signal
              </span>
              <div className="eq">
                {Array.from({ length: 30 }).map((_, i) => (
                  <i key={i} style={{ ["--i" as string]: i }} />
                ))}
              </div>
              <span className="metrics__sig-note">
                10,000+ learners · 98% completion
              </span>
            </div>

            <div className="metrics__copy" data-reveal>
              <p className="kicker">the impact</p>
              <h3>
                Fewer Tools, <em>Smarter Learning.</em>
              </h3>
              <p>
                Bring learners and educators together with organized
                conversations, seamless cohort collaboration, and affordable
                communication tools built for learning communities.
              </p>
            </div>
            <div className="metrics__grid">
              {metrics.map((metric, i) => (
                <div
                  className="metric-wrap"
                  data-reveal
                  style={{ ["--d" as string]: `${i * 100}ms` }}
                  key={metric.title}
                >
                  <div className="metric">
                    <strong>
                      {metric.title === "3x" && (
                        <CountUp end={3} suffix="x" />
                      )}
                      {metric.title === "40%" && (
                        <CountUp end={40} suffix="%" />
                      )}
                      {metric.title === "24/7" && "24/7"}
                    </strong>
                    <span>{metric.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pill-grid">
            {otherFeatures.map((feature, i) => (
              <div
                className="pill-card"
                data-reveal
                style={{ ["--d" as string]: `${(i % 4) * 70}ms` }}
                key={feature.title}
              >
                <span className="pill-card__dot" aria-hidden />
                <b>{feature.title}</b>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section section--flush" id="why">
          <div className="section__head">
            <div data-reveal>
              <p className="kicker">why zedu</p>
              <h2 className="section__title">
                Why Educators <em>Choose Zedu</em>
              </h2>
            </div>
            <p className="section__note" data-reveal>
              Built specifically for structured learning environments — not
              corporate teams or casual group chats.
            </p>
          </div>

          <div className="cards">
            {whyCards.map((card, i) => (
              <Tilt key={card.title} className="card-wrap">
                <article
                  className="card"
                  data-reveal
                  style={{ ["--d" as string]: `${i * 90}ms` }}
                  onPointerMove={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    event.currentTarget.style.setProperty(
                      "--mx",
                      `${event.clientX - rect.left}px`,
                    );
                    event.currentTarget.style.setProperty(
                      "--my",
                      `${event.clientY - rect.top}px`,
                    );
                  }}
                  key={card.title}
                >
                  <div className="card__icon" aria-hidden>
                    <span className="card__num">0{i + 1}</span>
                  </div>
                  <h3 className="card__title">{card.title}</h3>
                  <p className="card__body">{card.desc}</p>
                </article>
              </Tilt>
            ))}
          </div>

          <div className="reasons">
            {reasons.map((reason, i) => (
              <div
                className="reason"
                data-reveal
                style={{ ["--d" as string]: `${i * 90}ms` }}
                key={reason.title}
              >
                <span className="reason__index mono">0{i + 1}</span>
                <h4>{reason.title}</h4>
                <p>{reason.desc}</p>
              </div>
            ))}
          </div>

          <div className="why-marquee" aria-hidden>
            <div className="why-marquee__track">
              {[0, 1].map((copy) => (
                <div className="why-marquee__set" key={copy}>
                  {[
                    "cohort channels",
                    "live classes",
                    "AI notes",
                    "role-based access",
                    "recordings",
                    "whiteboard",
                    "threads",
                    "file sharing",
                  ].map((item) => (
                    <span key={item}>
                      {item}
                      <i />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="price-floor" aria-hidden />
          <div className="section__head">
            <div data-reveal>
              <p className="kicker">pricing</p>
              <h2 className="section__title">
                Pricing that scales <em>with your cohort</em>
              </h2>
            </div>
            <p className="section__note" data-reveal>
              No per-student pricing. Flexible plans built for growing classes,
              bootcamps, and institutions.
            </p>
          </div>

          <div className="price-grid">
            {plans.map((plan, i) => (
              <article
                className={cn("price", plan.featured && "price--featured")}
                data-reveal
                style={{ ["--d" as string]: `${i * 90}ms` }}
                onPointerMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.style.setProperty(
                    "--mx",
                    `${event.clientX - rect.left}px`,
                  );
                  event.currentTarget.style.setProperty(
                    "--my",
                    `${event.clientY - rect.top}px`,
                  );
                }}
                key={plan.name}
              >
                {plan.featured && <span className="price__badge">Most Popular</span>}
                <h3>{plan.name}</h3>
                <p className="price__desc">{plan.description}</p>
                <div className="price__amount">
                  <strong>{plan.amount}</strong>
                  <span>{plan.period}</span>
                </div>
                <span className="price__note">
                  {plan.featured ? "Billed monthly" : plan.note}
                </span>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span aria-hidden>✦</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/studio"
                  className={cn(
                    "btn",
                    plan.featured ? "btn--primary" : "btn--ghost",
                  )}
                  style={{ width: "100%" }}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--flush" id="faq">
          <div className="section__head">
            <div data-reveal>
              <p className="kicker">questions</p>
              <h2 className="section__title">
                Frequently asked <em>questions</em>
              </h2>
            </div>
            <p className="section__note" data-reveal>
              Everything you need to know about running your cohort on Zedu.
            </p>
          </div>

          <div className="faq">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div className={cn("faq__item", open && "is-open")} key={faq.q}>
                  <button
                    className="faq__q"
                    onClick={() => {
                      setOpenFaq(open ? null : i);
                      playCue("faq");
                    }}
                    aria-expanded={open}
                  >
                    <span className="mono">0{i + 1}</span>
                    {faq.q}
                    <span className="faq__plus" aria-hidden>
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  <div className="faq__a" aria-hidden={!open}>
                    <p>{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="section" id="cta">
          <div className="cta" data-reveal>
            <div className="cta__orbs" aria-hidden>
              <span className="cta__orb">
                <i className="orb" style={{ ["--h" as string]: 258 }}>
                  EA
                </i>
                <em>Educators</em>
              </span>
              <span className="cta__orb">
                <i className="orb" style={{ ["--h" as string]: 172 }}>
                  AO
                </i>
                <em>Learners</em>
              </span>
              <span className="cta__orb">
                <i className="orb" style={{ ["--h" as string]: 330 }}>
                  PN
                </i>
                <em>Agents</em>
              </span>
            </div>
            <p className="cta__kicker mono">ready when you are</p>
            <h2>
              Run Your Next Cohort
              <br />
              <em>Without Limits</em>
            </h2>
            <p>
              Join thousands of educators building better learning experiences
              with Zedu.
            </p>
            <div className="cta__actions">
              <Magnetic strength={16}>
                <Link href="/studio" className="btn btn--primary btn--lg">
                  Get started for free <span aria-hidden>→</span>
                </Link>
              </Magnetic>
              <Magnetic strength={10}>
                <a href="#pricing" className="btn btn--ghost btn--lg">
                  Contact sales
                </a>
              </Magnetic>
            </div>
          </div>
        </section>

        <div className="marquee marquee--band" aria-hidden>
          <div className="marquee__track marquee__track--reverse">
            {[0, 1].map((dup) => (
              <div className="marquee__item" key={dup}>
                {[
                  "Learn together",
                  "Ship together",
                  "Cohorts",
                  "Channels",
                  "Buzz",
                  "AI agents",
                  "Recordings",
                  "Whiteboard",
                ].map((word) => (
                  <span key={`${dup}-${word}`}>
                    {word} <i />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <footer className="footer">
          <div className="footer__watermark" aria-hidden>
            ZEDU
          </div>
          <div className="footer__grid">
            <div>
              <div className="footer__brand">
                Zedu<em>.</em>
              </div>
              <p
                style={{
                  color: "var(--dim)",
                  fontSize: 13,
                  maxWidth: "32ch",
                  marginTop: 10,
                }}
              >
                AI-powered education for bootcamps, schools, and learning
                communities.
              </p>
            </div>
            <div className="footer__cols">
              <div className="footer__col">
                <span className="mono">Products</span>
                <a href="#features">Buzz</a>
                <a href="#features">Channels</a>
                <a href="#features">File Management</a>
                <Link href="/studio">Open the app</Link>
              </div>
              <div className="footer__col">
                <span className="mono">Solutions</span>
                <a href="#why">Bootcamps</a>
                <a href="#why">Schools</a>
                <a href="#why">Universities</a>
              </div>
              <div className="footer__col">
                <span className="mono">Company</span>
                <a href="#why">About Us</a>
                <a href="#pricing">Pricing</a>
                <a href="#faq">Resources</a>
                <a href="#cta">Download</a>
              </div>
              <div className="footer__col">
                <span className="mono">Say hi</span>
                <a href="mailto:hi@zedu.io">Contact sales</a>
                <a href="#cta">Get started</a>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <span>© {new Date().getFullYear()} Zedu. A whimsical front-end study.</span>
            <span>Made with a canvas, a synth, and too much violet.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
