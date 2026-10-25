import type { ARENA_TOPIC_ID, TopicId } from "@/content/topics"

// Lesson content for each roadmap level (spec 5.2). The final level, Mock
// Interviews, is practised in the Interview Arena and has no lesson page.

export type LessonTopicId = Exclude<TopicId, typeof ARENA_TOPIC_ID>

export type FrameworkStep = {
  label: string
  detail: string
}

export type TopicLesson = {
  /** What it is: 2–3 plain-English sentences. */
  summary: string
  whyAsked: string
  framework: {
    name: string
    intro: string
    steps: FrameworkStep[]
  }
  sampleQuestion: {
    question: string
    /** A short model approach, one step per item. */
    approach: string[]
  }
  tip: string
}

export const TOPIC_LESSONS: Record<LessonTopicId, TopicLesson> = {
  fundamentals: {
    summary:
      "Product managers decide what a team builds and why. They connect user needs, business goals and what's technically possible, then guide a product through its lifecycle from idea to launch and beyond.",
    whyAsked:
      "Interviewers want to know you understand the job you're applying for: what PMs own, how they work with engineers and designers, and why the role excites you.",
    framework: {
      name: "The product lifecycle",
      intro:
        "Most product work loops through the same stages. Knowing them helps you explain where a PM adds value at each step.",
      steps: [
        {
          label: "Discover",
          detail: "Understand users and their problems through research, data and conversations.",
        },
        {
          label: "Define",
          detail: "Choose the problem worth solving and describe what success looks like.",
        },
        {
          label: "Build",
          detail:
            "Work with design and engineering to shape and ship a solution, making trade-offs along the way.",
        },
        {
          label: "Launch",
          detail: "Get the product into users' hands with the right messaging, timing and support.",
        },
        {
          label: "Measure & iterate",
          detail: "Check the results against your goals, learn, and decide what to improve next.",
        },
      ],
    },
    sampleQuestion: {
      question: "What does a product manager do, and why do you want to be one?",
      approach: [
        "Give a crisp definition: a PM helps the team build the right thing for users and the business.",
        "Walk through two or three concrete responsibilities, such as understanding users, prioritising and measuring impact.",
        "Connect it to your own experience: a moment where you did PM-like work, even without the title.",
        "Close with genuine motivation: what about the role energises you and where you want to grow.",
      ],
    },
    tip: "Use a real example from your own life or work. Specific beats generic every time.",
  },

  "product-sense": {
    summary:
      "Product sense is your ability to understand users deeply and design products that genuinely help them. In interviews it shows up as “design a product for…” or “how would you improve…” questions.",
    whyAsked:
      "It's the heart of the PM job. Interviewers look for user empathy, structured thinking, creativity and the judgement to prioritise one great idea over many average ones.",
    framework: {
      name: "CIRCLES",
      intro:
        "A popular framework from Lewis C. Lin's Decode and Conquer that keeps your answer structured without sounding robotic.",
      steps: [
        {
          label: "Comprehend the situation",
          detail: "Ask clarifying questions: the goal, the platform, any constraints.",
        },
        {
          label: "Identify the customer",
          detail: "List user segments and pick one to focus on, explaining why.",
        },
        {
          label: "Report customer needs",
          detail: "Describe their pain points and goals, ideally as user stories.",
        },
        {
          label: "Cut through prioritisation",
          detail: "Choose the most important need using impact and frequency.",
        },
        {
          label: "List solutions",
          detail: "Brainstorm several ideas, including at least one bold one.",
        },
        { label: "Evaluate trade-offs", detail: "Compare ideas on user value, effort and risk." },
        {
          label: "Summarise",
          detail: "Recommend one solution, say why, and how you'd measure success.",
        },
      ],
    },
    sampleQuestion: {
      question: "How would you improve a maps app for tourists visiting a new city?",
      approach: [
        "Clarify the goal (for example, engagement or satisfaction) and confirm the platform is mobile.",
        "Segment tourists: first-time visitors, budget backpackers, families, business travellers. Pick first-time visitors.",
        "Map their pain points: not knowing what's worth seeing, language barriers, getting lost, planning a day efficiently.",
        "Prioritise “planning a great day” as the most painful and frequent need.",
        "Brainstorm: auto-generated day itineraries, offline neighbourhood guides, and a “nearby now” feed of open attractions.",
        "Compare on value versus effort, recommend itineraries, and measure success with itinerary saves and trips started from them.",
      ],
    },
    tip: "Always pick one user segment. Trying to design for everyone is the most common mistake.",
  },

  metrics: {
    summary:
      "Metrics questions test how you define and measure success. You'll be asked which numbers matter for a product or feature, and how you'd know whether it's working.",
    whyAsked:
      "PMs make decisions with data. Interviewers want to see that you can tie metrics to user value and business goals, and that you think about trade-offs and unintended effects.",
    framework: {
      name: "Goal → Signals → Metrics",
      intro:
        "Start from why the product exists and work towards numbers. Google's HEART framework (Happiness, Engagement, Adoption, Retention, Task success) is a helpful checklist for the signals step.",
      steps: [
        {
          label: "Clarify the goal",
          detail: "What is the product for, and what is the business trying to achieve?",
        },
        {
          label: "Map the user journey",
          detail: "List the key actions users take, from discovering the feature to getting value.",
        },
        {
          label: "Pick signals",
          detail: "Choose behaviours that show success, using HEART as a checklist.",
        },
        {
          label: "Define a North Star",
          detail:
            "One metric that best captures the value users get, plus a few supporting metrics.",
        },
        {
          label: "Add guardrails",
          detail: "Metrics that must not get worse, such as crashes, complaints or cancellations.",
        },
      ],
    },
    sampleQuestion: {
      question:
        "How would you measure the success of a new “Stories” feature in a photo-sharing app?",
      approach: [
        "Clarify the goal: help people share casual moments more often, increasing engagement.",
        "Walk the journey: a user creates a story, friends view it, and some reply or react.",
        "Pick signals: story creation (adoption), views and replies (engagement), creators returning to post again (retention).",
        "Propose a North Star such as the number of daily users who post or reply to a story.",
        "Add guardrails: the feed's engagement shouldn't drop sharply, and reports of unwanted content shouldn't rise.",
      ],
    },
    tip: "Explain why each metric matters. A short list with reasons beats a long list without them.",
  },

  rca: {
    summary:
      "Root cause analysis (RCA) questions give you a metric that changed unexpectedly, such as “sign-ups dropped last week”, and ask you to find out why.",
    whyAsked:
      "Things go wrong in real products all the time. Interviewers want to see calm, structured investigation rather than jumping to the first guess.",
    framework: {
      name: "A structured RCA approach",
      intro: "Work from the outside in, ruling out simple explanations before digging deeper.",
      steps: [
        {
          label: "Clarify the metric",
          detail: "How is it defined, how big is the change, and over what time period?",
        },
        {
          label: "Check the data",
          detail:
            "Rule out tracking bugs, dashboard errors or a change in how the metric is calculated.",
        },
        {
          label: "Look outside",
          detail: "Seasonality, holidays, competitor launches, news or outages elsewhere.",
        },
        {
          label: "Segment",
          detail:
            "Split by platform, app version, geography, user type and acquisition channel to find where it's concentrated.",
        },
        {
          label: "Look inside",
          detail: "Recent releases, experiments, pricing changes or marketing campaigns.",
        },
        {
          label: "Confirm & act",
          detail:
            "Validate the likely cause with data, then recommend a fix and how to prevent it.",
        },
      ],
    },
    sampleQuestion: {
      question:
        "Daily orders on a food delivery app dropped noticeably this week. How would you investigate?",
      approach: [
        "Clarify: is it all orders or a specific step, how sudden was it, and is it still happening?",
        "Check the data: confirm the drop is real and not a logging or dashboard problem.",
        "Look outside: a holiday, bad weather, a competitor promotion or a payment provider outage.",
        "Segment: is it one city, one platform (say, Android after a new release), new or returning users?",
        "Look inside: a recent app release, a change to delivery fees, or an experiment on the checkout page.",
        "Suppose it's isolated to the latest Android release: confirm with crash and funnel data, roll back or hotfix, and add release monitoring.",
      ],
    },
    tip: "Say your hypotheses out loud and explain how you'd confirm or rule out each one.",
  },

  guesstimates: {
    summary:
      "Guesstimates ask you to estimate a number you can't look up, like how many smartphones are sold in a country each year. There's no single right answer.",
    whyAsked:
      "Interviewers care about your reasoning, not the final number. They want structured thinking, sensible assumptions and comfort with ambiguity.",
    framework: {
      name: "Clarify → Structure → Calculate → Sanity check",
      intro:
        "Choose a top-down approach (start from a population and narrow down) or bottom-up (start from a single unit and scale up).",
      steps: [
        {
          label: "Clarify",
          detail:
            "Pin down exactly what you're estimating: which place, time period and definition.",
        },
        {
          label: "Structure",
          detail:
            "Write out the equation before plugging in numbers, such as population × share × frequency.",
        },
        {
          label: "Assume",
          detail: "Use round, explainable numbers and say why each assumption is reasonable.",
        },
        {
          label: "Calculate",
          detail: "Do the maths step by step, out loud, keeping numbers easy to work with.",
        },
        {
          label: "Sanity check",
          detail: "Compare the result to something you know, and adjust if it feels off.",
        },
      ],
    },
    sampleQuestion: {
      question: "Estimate how many smartphones are sold in India each year.",
      approach: [
        "Clarify: new phones only, sold within India, over one year.",
        "Structure top-down: population → people who use a smartphone → how often they replace it.",
        "State assumptions clearly, for example the share of people who own a smartphone and an average replacement cycle of a few years.",
        "Calculate: smartphone users ÷ years between replacements gives yearly replacement sales; add first-time buyers.",
        "Sanity check against anything you know about the market, and explain which assumption you're least sure about.",
      ],
    },
    tip: "Write the formula first. It shows structure even if an assumption turns out to be off.",
  },

  strategy: {
    summary:
      "Product strategy questions are about the bigger picture: whether a company should enter a market, build or buy, or respond to a competitor, and why.",
    whyAsked:
      "Senior PMs shape direction, not just features. Interviewers look for business sense, an understanding of competition, and a clear, reasoned recommendation.",
    framework: {
      name: "The 3Cs → Options → Recommendation",
      intro: "Analyse the situation from three angles, lay out real options, then commit to one.",
      steps: [
        {
          label: "Company",
          detail: "Its goals, strengths, assets and constraints. What is it uniquely good at?",
        },
        {
          label: "Customers",
          detail: "Who they are, what they need, and whether this move serves them.",
        },
        {
          label: "Competitors",
          detail: "Who else is in the space, how they win, and how they might respond.",
        },
        {
          label: "Options",
          detail: "Lay out two or three realistic paths, including doing nothing.",
        },
        {
          label: "Recommend",
          detail: "Pick one, explain the trade-offs and risks, and say how you'd test it first.",
        },
      ],
    },
    sampleQuestion: {
      question: "Should a ride-hailing company launch a food delivery service?",
      approach: [
        "Clarify the company's goal: revenue growth, more frequent use of the app, or defending against a competitor.",
        "Company: it already has drivers, a mapping and payments platform, and a large user base. These are strong assets.",
        "Customers: riders may want one app for everything; restaurants need reliable delivery partners.",
        "Competitors: established food delivery players have restaurant relationships and brand trust.",
        "Options: launch in-house, partner with an existing service, or pilot in a few cities first.",
        "Recommend a city pilot that uses existing drivers in off-peak hours, measured by order frequency and margins before scaling.",
      ],
    },
    tip: "Make a clear recommendation. Interviewers would rather hear a reasoned decision than an endless list of pros and cons.",
  },

  growth: {
    summary:
      "Growth questions ask how you'd get more people to use a product, use it more often, or stay longer. It's about understanding where users drop off and why.",
    whyAsked:
      "Every product needs to grow. Interviewers want to see you find the biggest lever in the funnel rather than throwing random tactics at the problem.",
    framework: {
      name: "AARRR (Pirate Metrics)",
      intro:
        "Dave McClure's funnel breaks growth into five stages. Find the weakest stage first, then focus your ideas there.",
      steps: [
        {
          label: "Acquisition",
          detail: "How do people discover the product? Channels, referrals, search, partnerships.",
        },
        {
          label: "Activation",
          detail: "Do new users reach the “aha” moment where they first get real value?",
        },
        {
          label: "Retention",
          detail: "Do they come back? This is usually the most important stage to fix.",
        },
        { label: "Referral", detail: "Do happy users bring others along?" },
        { label: "Revenue", detail: "Do users pay, upgrade or generate value for the business?" },
      ],
    },
    sampleQuestion: {
      question: "How would you grow weekly active users of a language-learning app?",
      approach: [
        "Clarify: is the goal more new users, or more existing users staying active each week?",
        "Map the funnel with AARRR and ask where the biggest drop-off is. Suppose many users stop after the first week.",
        "Focus on activation and retention: help users reach their first small win quickly and build a habit.",
        "Ideas: a personalised first lesson, gentle reminders at the user's chosen time, streaks and learning with friends.",
        "Prioritise by impact and effort, run an experiment, and track week-two retention as the key metric.",
      ],
    },
    tip: "Diagnose before prescribing. Name the weakest funnel stage before suggesting tactics.",
  },

  gtm: {
    summary:
      "Go-to-market (GTM) is the plan for launching a product: who it's for, how you position it, how you price it, and how you reach customers.",
    whyAsked:
      "A great product can still fail at launch. Interviewers want to see that you think beyond building, about customers, messaging, channels and timing.",
    framework: {
      name: "A simple GTM plan",
      intro: "Answer five questions in order, each one building on the last.",
      steps: [
        {
          label: "Target customer",
          detail: "Who exactly is this for first? Be specific about the early adopters.",
        },
        {
          label: "Value proposition",
          detail:
            "What problem does it solve for them, and why is it better than the alternatives?",
        },
        {
          label: "Pricing",
          detail:
            "Free, freemium, subscription or one-off, and how that fits the customer and business.",
        },
        {
          label: "Channels",
          detail: "Where these customers already spend time, and how you'll reach them.",
        },
        {
          label: "Launch & measure",
          detail: "Phasing (beta, soft launch, full launch) and the metrics that define success.",
        },
      ],
    },
    sampleQuestion: {
      question: "How would you launch a new budgeting app for college students?",
      approach: [
        "Target: first-year students managing money on their own for the first time.",
        "Value proposition: an effortless way to know how much you can safely spend this week.",
        "Pricing: free core app to remove friction, with an optional premium tier later.",
        "Channels: campus ambassadors, student societies, social media and partnerships with student banks.",
        "Launch with a beta at a few campuses, then expand; measure activation, weekly use and word-of-mouth referrals.",
      ],
    },
    tip: "Be specific about the first customer. “Everyone” is not a go-to-market plan.",
  },

  analytics: {
    summary:
      "Analytics questions give you data, such as a chart, a funnel or A/B test results, and ask what it means and what you'd do next.",
    whyAsked:
      "PMs read data every day. Interviewers want to see you interpret numbers carefully, question them, and turn them into a decision.",
    framework: {
      name: "Read → Question → Decide",
      intro: "Slow down and understand the data before drawing conclusions.",
      steps: [
        {
          label: "Read carefully",
          detail: "Check what's measured, the units, the time period and any segments.",
        },
        { label: "Describe", detail: "State what you see in plain words before interpreting it." },
        {
          label: "Question it",
          detail:
            "Is the sample big enough? Is the change significant? Could something else explain it?",
        },
        {
          label: "Segment",
          detail: "Look for differences between user groups that the average might hide.",
        },
        {
          label: "Decide",
          detail:
            "Recommend an action, its risks, and what extra data would raise your confidence.",
        },
      ],
    },
    sampleQuestion: {
      question:
        "An A/B test shows a new checkout increases purchases, but refunds also went up. Do you ship it?",
      approach: [
        "Clarify the test: sample size, duration, and whether the results are statistically significant.",
        "Compare net impact: extra purchases minus extra refunds, including the cost of processing refunds.",
        "Segment: are refunds concentrated in certain products or users who may have bought by mistake?",
        "Find the cause: perhaps the new flow makes it too easy to buy without reviewing the order.",
        "Recommend: don't ship as-is; add an order review step, re-test, and use refund rate as a guardrail metric.",
      ],
    },
    tip: "Always ask whether the result is significant before you celebrate or panic.",
  },

  technical: {
    summary:
      "Technical questions check that you understand how software is built: how apps talk to servers, what APIs and databases do, and the trade-offs engineers face.",
    whyAsked:
      "You don't need to code, but you do need to work closely with engineers, understand effort and risk, and make sensible technical trade-offs.",
    framework: {
      name: "Explain it like a builder",
      intro: "Describe systems as a flow of simple parts, then talk about the trade-offs.",
      steps: [
        {
          label: "Start with the user",
          detail: "What does the user do, and what do they expect to happen?",
        },
        {
          label: "Follow the request",
          detail: "Trace it from the app (client) through the internet to servers and back.",
        },
        {
          label: "Name the parts",
          detail: "Clients, servers, APIs, databases and caches, each in one simple sentence.",
        },
        {
          label: "Discuss trade-offs",
          detail: "Speed versus cost, consistency versus availability, build versus buy.",
        },
        {
          label: "Connect to product",
          detail: "Explain how these choices affect the user experience and the roadmap.",
        },
      ],
    },
    sampleQuestion: {
      question: "What happens when you type a web address into your browser and press Enter?",
      approach: [
        "The browser looks up the domain name to find the server's address (DNS).",
        "It opens a secure connection to that server.",
        "It sends a request; the server's code runs, perhaps fetching data from a database.",
        "The server sends back a response with HTML, styles and scripts.",
        "The browser renders the page and loads any extra assets like images.",
        "Add a product angle: caching and content delivery networks make this faster, which matters for user experience.",
      ],
    },
    tip: "Clarity beats jargon. If you can explain it simply, you understand it well enough.",
  },

  behavioral: {
    summary:
      "Behavioral questions ask about your past experience: “Tell me about a time when…”. They cover leadership, conflict, failure, influence and teamwork.",
    whyAsked:
      "Past behaviour is a good predictor of future behaviour. Interviewers want evidence that you can lead without authority, handle conflict and learn from mistakes.",
    framework: {
      name: "STAR (+ reflection)",
      intro:
        "A simple story structure that keeps answers focused. Prepare five or six stories you can adapt to different questions.",
      steps: [
        {
          label: "Situation",
          detail: "Set the scene briefly: where you were and what was going on.",
        },
        { label: "Task", detail: "What you were responsible for, or the challenge you faced." },
        {
          label: "Action",
          detail: "What you did, using “I” not “we”. This should be the longest part.",
        },
        { label: "Result", detail: "The outcome, with numbers or concrete impact where possible." },
        {
          label: "Reflection",
          detail: "What you learned and what you'd do differently next time.",
        },
      ],
    },
    sampleQuestion: {
      question: "Tell me about a time you disagreed with a teammate. How did you handle it?",
      approach: [
        "Situation: a project where you and an engineer disagreed on scope before a deadline.",
        "Task: you needed to ship on time without damaging the relationship.",
        "Action: you listened to understand their concerns, brought data on user impact, and proposed a smaller first version.",
        "Result: you shipped on time, and the follow-up release added the remaining scope.",
        "Reflection: you learned to raise trade-offs earlier and to focus on shared goals rather than positions.",
      ],
    },
    tip: "Pick stories where you were the one making things happen, and be honest about what you learned.",
  },
}
