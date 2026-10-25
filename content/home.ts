import {
  BarChart3,
  BookOpen,
  Briefcase,
  Code2,
  Compass,
  GraduationCap,
  Handshake,
  Headphones,
  LineChart,
  Lightbulb,
  MessagesSquare,
  Palette,
  Rocket,
  Sprout,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export type Cta = {
  label: string
  href: string
}

export type IconItem = {
  title: string
  description: string
  icon: LucideIcon
}

export type SectionIntro = {
  id: string
  eyebrow: string
  title: string
  description: string
}

export type Myth = {
  myth: string
  reality: string
}

export type HomeContent = {
  hero: {
    eyebrow: string
    headline: string
    headlineHighlight: string
    subtext: string
    primaryCta: Cta
    secondaryCta: Cta
    reassurances: string[]
    /** Decorative sample of the roadmap shown beside the headline. */
    preview: {
      label: string
      progressLabel: string
      progressPercent: number
      levels: { title: string; status: "done" | "current" | "upcoming" }[]
      currentLabel: string
      xpToast: string
      badgeLabel: string
      badge: string
    }
  }
  whatPmsDo: SectionIntro & { items: IconItem[] }
  whyItMatters: SectionIntro & {
    paragraphs: string[]
    ceoCallout: { title: string; body: string; note: string }
    impacts: IconItem[]
  }
  benefits: SectionIntro & { items: IconItem[] }
  youCanDoThis: SectionIntro & {
    backgrounds: IconItem[]
    stepsTitle: string
    stepLabel: string
    steps: IconItem[]
  }
  mythBusters: SectionIntro & { mythLabel: string; realityLabel: string; myths: Myth[] }
  finalCta: {
    title: string
    description: string
    cta: Cta
  }
}

export const homeContent: HomeContent = {
  hero: {
    eyebrow: "Your PM journey starts here",
    headline: "Build products millions use.",
    headlineHighlight: "Start your PM journey today.",
    subtext:
      "Learn what great product managers know, practise with a friendly AI interviewer, and walk into your interview feeling ready, one small level at a time.",
    primaryCta: { label: "Start my journey", href: "/roadmap" },
    secondaryCta: { label: "What does a PM do?", href: "#what-pms-do" },
    reassurances: ["No sign-up needed", "Beginner friendly", "Learn at your own pace"],
    preview: {
      label: "Sample quest",
      progressLabel: "3 of 12 levels",
      progressPercent: 25,
      levels: [
        { title: "PM Fundamentals", status: "done" },
        { title: "Product Sense", status: "done" },
        { title: "Product Metrics", status: "current" },
        { title: "Root Cause Analysis", status: "upcoming" },
      ],
      currentLabel: "In progress",
      xpToast: "+50 XP",
      badgeLabel: "Badge unlocked",
      badge: "Metrics Master",
    },
  },

  whatPmsDo: {
    id: "what-pms-do",
    eyebrow: "The role",
    title: "What a PM actually does",
    description:
      "Product managers help a team build the right thing, for the right people, at the right time. Day to day, that looks like this.",
    items: [
      {
        title: "Understands users",
        description:
          "Talks to customers, spots the real problems behind their requests, and turns messy feedback into clear insights.",
        icon: Users,
      },
      {
        title: "Sets direction",
        description:
          "Decides what to build next and why, balancing user needs, business goals and what the team can realistically do.",
        icon: Compass,
      },
      {
        title: "Works with engineers & designers",
        description:
          "Brings the team together around a shared goal, answers the tricky questions, and keeps everyone moving the same way.",
        icon: Handshake,
      },
      {
        title: "Measures impact",
        description:
          "Defines what success looks like, watches the numbers after launch, and learns from every release.",
        icon: BarChart3,
      },
    ],
  },

  whyItMatters: {
    id: "why-it-matters",
    eyebrow: "The impact",
    title: "Why this role matters",
    description:
      "The apps you use to learn, shop, travel and stay in touch were all shaped by people deciding what to build and what to leave out.",
    paragraphs: [
      "Great products don't happen by accident. Someone has to understand the people using them, choose which problems are worth solving, and keep a whole team focused on getting it right.",
      "That someone is the product manager. When PMs do their job well, users get products that genuinely help them, and teams get to spend their energy on work that counts.",
    ],
    ceoCallout: {
      title: "The “CEO of the product”",
      body: "You'll often hear PMs described this way. It's a handy shorthand: you own the outcome and think about the product as a whole, from the user's problem to the business result.",
      note: "One honest caveat: it's influence, not authority. Nobody reports to you. Great PMs lead by building trust, sharing context and making the “why” crystal clear.",
    },
    impacts: [
      {
        title: "For users",
        description: "Products that solve real problems and are a joy to use.",
        icon: Lightbulb,
      },
      {
        title: "For the business",
        description: "Smart bets that help the company grow sustainably.",
        icon: LineChart,
      },
      {
        title: "For the team",
        description: "A clear goal everyone understands and believes in.",
        icon: Target,
      },
    ],
  },

  benefits: {
    id: "benefits",
    eyebrow: "The upside",
    title: "Why people love being PMs",
    description: "It's challenging work, and it gives a lot back.",
    items: [
      {
        title: "Career growth",
        description:
          "A clear ladder from associate PM to senior and group PM, with skills that stay valuable as you grow.",
        icon: TrendingUp,
      },
      {
        title: "Cross-functional learning",
        description:
          "You pick up a little design, engineering, data, marketing and business every single week.",
        icon: BookOpen,
      },
      {
        title: "High impact",
        description: "Your decisions shape what ships and how real people experience it.",
        icon: Target,
      },
      {
        title: "Strong compensation",
        description:
          "PM roles are generally well paid, especially in tech. Pay varies by company, location and level.",
        icon: Wallet,
      },
      {
        title: "Path to leadership & founding",
        description:
          "The role trains you to see the whole business, which is why many leaders and founders started as PMs.",
        icon: Rocket,
      },
    ],
  },

  youCanDoThis: {
    id: "you-can-do-this",
    eyebrow: "Yes, you",
    title: "You can do this",
    description:
      "There's no single path into product management. People arrive from all kinds of backgrounds, and each one brings something valuable.",
    backgrounds: [
      {
        title: "Engineering",
        description: "You know how products get built. Now add the “why”.",
        icon: Code2,
      },
      {
        title: "Design",
        description: "Your user empathy and eye for detail are PM superpowers.",
        icon: Palette,
      },
      {
        title: "Consulting",
        description: "Structured thinking and stakeholder skills transfer directly.",
        icon: Briefcase,
      },
      {
        title: "Sales & support",
        description: "You hear from customers every day. That insight is gold.",
        icon: Headphones,
      },
      {
        title: "Data & analytics",
        description: "You already turn numbers into decisions, a core PM skill.",
        icon: BarChart3,
      },
      {
        title: "Students & freshers",
        description: "Associate PM programs exist to hire people early in their careers.",
        icon: GraduationCap,
      },
    ],
    stepsTitle: "Your path, in four steps",
    stepLabel: "Step",
    steps: [
      {
        title: "Learn",
        description: "Work through the roadmap, one bite-sized topic at a time.",
        icon: BookOpen,
      },
      {
        title: "Practice",
        description: "Try sample questions and frameworks until they click.",
        icon: Sprout,
      },
      {
        title: "Mock interview",
        description: "Rehearse with an AI interviewer and get kind, specific feedback.",
        icon: MessagesSquare,
      },
      {
        title: "Land the role",
        description: "Walk in prepared, confident and ready to shine.",
        icon: Trophy,
      },
    ],
  },

  mythBusters: {
    id: "myth-busters",
    eyebrow: "Myth-busters",
    title: "Things that shouldn't stop you",
    description: "A few common worries, gently set straight.",
    mythLabel: "Myth",
    realityLabel: "Reality",
    myths: [
      {
        myth: "You need an MBA",
        reality:
          "Plenty of PMs don't have one. Interviewers care about how you think about users, problems and trade-offs, and that's something you can learn and practise.",
      },
      {
        myth: "You must know how to code",
        reality:
          "Helpful, but not required for most PM roles. You need to understand how software gets built and work comfortably with engineers. Some technical PM roles ask for more.",
      },
      {
        myth: "You need PM experience to get a PM job",
        reality:
          "Associate PM programs, internal transfers and adjacent roles are all common ways in, built for people who don't have the title yet.",
      },
      {
        myth: "PMs are the boss of the team",
        reality:
          "PMs lead through influence, not authority. You earn trust by bringing clarity and listening well, not by giving orders.",
      },
    ],
  },

  finalCta: {
    title: "Your first level is waiting",
    description:
      "Start with PM Fundamentals and build from there. Every great PM started exactly where you are now.",
    cta: { label: "See your roadmap", href: "/roadmap" },
  },
}
