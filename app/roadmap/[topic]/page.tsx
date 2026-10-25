import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, Clock, Lightbulb, MessageCircleQuestion } from "lucide-react"

import { CompleteTopicCard } from "@/components/roadmap/complete-topic-card"
import { ResourceCard } from "@/components/roadmap/resource-card"
import { TOPIC_ICONS } from "@/components/roadmap/topic-icons"
import { TopicPager } from "@/components/roadmap/topic-pager"
import { getResourcesForTags } from "@/content/resources"
import { TOPIC_LESSONS, type LessonTopicId, type TopicLesson } from "@/content/topic-lessons"
import { ROADMAP_TOPICS, type RoadmapTopic } from "@/content/topics"

const MAX_RESOURCES = 4

function isLessonTopicId(value: string): value is LessonTopicId {
  return Object.hasOwn(TOPIC_LESSONS, value)
}

type LessonPage = {
  topic: RoadmapTopic
  lesson: TopicLesson
  index: number
}

function getLessonPage(slug: string): LessonPage | null {
  if (!isLessonTopicId(slug)) return null
  const index = ROADMAP_TOPICS.findIndex((topic) => topic.id === slug)
  const topic = ROADMAP_TOPICS[index]
  if (!topic) return null
  return { topic, lesson: TOPIC_LESSONS[slug], index }
}

export function generateStaticParams() {
  return Object.keys(TOPIC_LESSONS).map((topic) => ({ topic }))
}

export async function generateMetadata({
  params,
}: PageProps<"/roadmap/[topic]">): Promise<Metadata> {
  const page = getLessonPage((await params).topic)
  if (!page) return { title: "Level not found" }
  return { title: page.topic.title, description: page.lesson.summary }
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="font-heading text-2xl font-extrabold tracking-tight">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default async function TopicPage({ params }: PageProps<"/roadmap/[topic]">) {
  const page = getLessonPage((await params).topic)
  if (!page) notFound()

  const { topic, lesson, index } = page
  const Icon = TOPIC_ICONS[topic.id]
  const previous = ROADMAP_TOPICS[index - 1] ?? null
  const next = ROADMAP_TOPICS[index + 1] ?? null
  const resources = getResourcesForTags([topic.id]).slice(0, MAX_RESOURCES)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/roadmap" className="rounded hover:text-foreground hover:underline">
              Roadmap
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4" />
          </li>
          <li aria-current="page" className="font-medium text-foreground">
            Level {index + 1}
          </li>
        </ol>
      </nav>

      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Icon className="size-8" aria-hidden="true" />
        </span>
        <div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold tracking-wider text-primary uppercase">
            Level {index + 1} of {ROADMAP_TOPICS.length}
            <span className="flex items-center gap-1 font-medium tracking-normal text-muted-foreground normal-case">
              <Clock className="size-4" aria-hidden="true" />~{topic.estimatedMinutes} min
            </span>
          </p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {topic.title}
          </h1>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        <article className="space-y-12">
          <Section id={`${topic.id}-what-it-is`} title="What it is">
            <p className="text-lg leading-relaxed">{lesson.summary}</p>
          </Section>

          <Section id={`${topic.id}-why-asked`} title="Why interviewers ask it">
            <p className="text-lg leading-relaxed">{lesson.whyAsked}</p>
          </Section>

          <Section id={`${topic.id}-framework`} title={`Framework: ${lesson.framework.name}`}>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {lesson.framework.intro}
            </p>
            <ol className="mt-6 space-y-3">
              {lesson.framework.steps.map((step, stepIndex) => (
                <li key={step.label} className="flex gap-4 rounded-2xl border bg-card p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 font-heading text-sm font-extrabold text-primary">
                    {stepIndex + 1}
                  </span>
                  <div>
                    <p className="font-heading font-bold">{step.label}</p>
                    <p className="mt-0.5 text-muted-foreground">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section id={`${topic.id}-sample-question`} title="Try a sample question">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                <MessageCircleQuestion className="size-4" aria-hidden="true" />
                Interview question
              </p>
              <p className="mt-2 font-heading text-xl font-bold text-balance">
                “{lesson.sampleQuestion.question}”
              </p>
            </div>
            <p className="mt-6 text-muted-foreground">
              Have a go yourself first, then compare with this model approach:
            </p>
            <h3 className="mt-4 font-heading text-lg font-bold">A model approach</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-6 marker:font-bold marker:text-primary">
              {lesson.sampleQuestion.approach.map((step) => (
                <li key={step} className="pl-1 leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-6 flex gap-3 rounded-2xl bg-celebrate/15 p-4">
              <Lightbulb
                className="mt-0.5 size-5 shrink-0 text-celebrate-strong"
                aria-hidden="true"
              />
              <span>
                <span className="font-bold">Tip: </span>
                {lesson.tip}
              </span>
            </p>
          </Section>

          <Section id={`${topic.id}-resources`} title="Curated resources">
            <ul className="grid gap-4 sm:grid-cols-2">
              {resources.map((resource) => (
                <li key={resource.id}>
                  <ResourceCard resource={resource} />
                </li>
              ))}
            </ul>
          </Section>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CompleteTopicCard
            topicId={topic.id}
            estimatedMinutes={topic.estimatedMinutes}
            nextTopic={next}
          />
        </aside>
      </div>

      <TopicPager previous={previous} next={next} />
    </div>
  )
}
