import { Library } from "lucide-react"

import { ResourceCard } from "@/components/roadmap/resource-card"
import { ResultsSection } from "@/components/results/results-parts"
import { CATEGORY_TOPIC } from "@/config/interview"
import { getResourcesForTags } from "@/content/resources"
import type { InterviewEvaluation } from "@/lib/interview/feedback-schema"

const MAX_RESOURCES = 4

export function ResourcesSection({ evaluation }: { evaluation: InterviewEvaluation }) {
  const tags = evaluation.practiceCategories.map((category) => CATEGORY_TOPIC[category])
  const resources = getResourcesForTags([...tags, "interview-prep"]).slice(0, MAX_RESOURCES)
  if (resources.length === 0) return null

  return (
    <ResultsSection
      id="resources"
      title="Where to practise online"
      description="Hand-picked resources for the areas you're working on."
      icon={Library}
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {resources.map((resource) => (
          <li key={resource.id}>
            <ResourceCard resource={resource} />
          </li>
        ))}
      </ul>
    </ResultsSection>
  )
}
