import type { TopicId } from "@/content/topics"

// Curated learning resources (spec 5.2.1). Only real resources, linked to their
// official homepages, never invented article URLs. Items marked "TODO: verify"
// need a human to confirm the URL or pricing before launch.

export type ResourceType = "book" | "website" | "newsletter" | "course"
export type ResourcePricing = "free" | "paid" | "free-and-paid"
export type ResourceTag = TopicId | "interview-prep" | "career"

export type Resource = {
  id: string
  title: string
  author?: string
  type: ResourceType
  url: string
  description: string
  tags: readonly ResourceTag[]
  pricing: ResourcePricing
}

export const RESOURCES = [
  // Books
  {
    id: "cracking-the-pm-interview",
    title: "Cracking the PM Interview",
    author: "Gayle Laakmann McDowell & Jackie Bavaro",
    type: "book",
    url: "https://www.crackingthepminterview.com", // TODO: verify
    description:
      "A classic guide to the PM role and interview, from product questions to estimation and behavioral prep.",
    tags: [
      "fundamentals",
      "product-sense",
      "guesstimates",
      "technical",
      "behavioral",
      "interview-prep",
    ],
    pricing: "paid",
  },
  {
    id: "decode-and-conquer",
    title: "Decode and Conquer",
    author: "Lewis C. Lin",
    type: "book",
    url: "https://www.lewis-lin.com", // TODO: verify
    description:
      "Interview frameworks with worked answers, including the CIRCLES method for product design questions.",
    tags: ["product-sense", "metrics", "rca", "guesstimates", "strategy", "interview-prep"],
    pricing: "paid",
  },
  {
    id: "inspired",
    title: "Inspired",
    author: "Marty Cagan",
    type: "book",
    url: "https://www.svpg.com", // TODO: verify
    description:
      "How strong product teams discover and build products customers love. Great for understanding the role.",
    tags: ["fundamentals", "product-sense", "strategy"],
    pricing: "paid",
  },
  {
    id: "lean-product-playbook",
    title: "The Lean Product Playbook",
    author: "Dan Olsen",
    type: "book",
    url: "https://leanproductplaybook.com", // TODO: verify
    description:
      "A practical, step-by-step process for finding product-market fit, from customer needs to testing ideas.",
    tags: ["fundamentals", "product-sense", "metrics"],
    pricing: "paid",
  },
  {
    id: "hooked",
    title: "Hooked",
    author: "Nir Eyal",
    type: "book",
    url: "https://www.nirandfar.com", // TODO: verify
    description:
      "How habit-forming products keep users coming back. Useful for engagement and growth questions.",
    tags: ["growth", "product-sense"],
    pricing: "paid",
  },
  {
    id: "lean-analytics",
    title: "Lean Analytics",
    author: "Alistair Croll & Benjamin Yoskovitz",
    type: "book",
    url: "https://leananalyticsbook.com", // TODO: verify
    description:
      "Choosing the metrics that matter at each stage of a product. A go-to for metrics and analytics questions.",
    tags: ["metrics", "analytics", "growth"],
    pricing: "paid",
  },

  // Websites and platforms
  {
    id: "exponent",
    title: "Exponent",
    type: "website",
    url: "https://www.tryexponent.com",
    description:
      "PM interview questions, sample answers, courses and peer mock interviews across every question type.",
    tags: [
      "product-sense",
      "metrics",
      "rca",
      "guesstimates",
      "strategy",
      "analytics",
      "technical",
      "behavioral",
      "mock-interviews",
      "interview-prep",
    ],
    pricing: "free-and-paid", // TODO: verify
  },
  {
    id: "lennys-newsletter",
    title: "Lenny's Newsletter & Podcast",
    author: "Lenny Rachitsky",
    type: "newsletter",
    url: "https://www.lennysnewsletter.com",
    description:
      "Advice on product, growth and careers, plus podcast interviews with experienced product leaders.",
    tags: ["fundamentals", "growth", "strategy", "gtm", "career"],
    pricing: "free-and-paid",
  },
  {
    id: "igotanoffer",
    title: "IGotAnOffer",
    type: "website",
    url: "https://igotanoffer.com",
    description:
      "Detailed PM interview guides, many for specific companies, plus optional paid coaching.",
    tags: ["product-sense", "metrics", "rca", "guesstimates", "behavioral", "interview-prep"],
    pricing: "free-and-paid", // TODO: verify
  },
  {
    id: "product-alliance",
    title: "Product Alliance",
    type: "course",
    url: "https://www.productalliance.com", // TODO: verify
    description:
      "Structured PM interview prep courses covering product, metrics, strategy and more.",
    tags: ["product-sense", "metrics", "strategy", "technical", "interview-prep"],
    pricing: "paid", // TODO: verify
  },
  {
    id: "reforge",
    title: "Reforge",
    type: "course",
    url: "https://www.reforge.com",
    description:
      "In-depth programs and articles on growth, product strategy and go-to-market from experienced operators.",
    tags: ["growth", "strategy", "gtm", "analytics"],
    pricing: "free-and-paid", // TODO: verify
  },
  {
    id: "product-school",
    title: "Product School",
    type: "website",
    url: "https://productschool.com",
    description:
      "Product management training, with a free blog, templates and resources for aspiring PMs.",
    tags: ["fundamentals", "gtm", "technical", "career"],
    pricing: "free-and-paid", // TODO: verify
  },
] as const satisfies readonly Resource[]

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  book: "Book",
  website: "Website",
  newsletter: "Newsletter",
  course: "Course",
}

export const RESOURCE_PRICING_LABELS: Record<ResourcePricing, string> = {
  free: "Free",
  paid: "Paid",
  "free-and-paid": "Free & paid",
}

/** Resources for a set of tags, most relevant (most matching tags) first. */
export function getResourcesForTags(tags: readonly ResourceTag[]): Resource[] {
  return RESOURCES.map((resource) => ({
    resource,
    matches: resource.tags.filter((tag) => tags.includes(tag)).length,
  }))
    .filter((item) => item.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .map((item) => item.resource)
}
