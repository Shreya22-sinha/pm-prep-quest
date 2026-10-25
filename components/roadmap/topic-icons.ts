import {
  BarChart3,
  Brain,
  Calculator,
  Code2,
  Compass,
  LineChart,
  Megaphone,
  MessagesSquare,
  Rocket,
  Search,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react"

import type { TopicId } from "@/content/topics"

export const TOPIC_ICONS: Record<TopicId, LucideIcon> = {
  fundamentals: Compass,
  "product-sense": Sparkles,
  metrics: BarChart3,
  rca: Search,
  guesstimates: Calculator,
  strategy: Brain,
  growth: Rocket,
  gtm: Megaphone,
  analytics: LineChart,
  technical: Code2,
  behavioral: MessagesSquare,
  "mock-interviews": Trophy,
}
