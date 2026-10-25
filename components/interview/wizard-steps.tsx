"use client"

import {
  Briefcase,
  ExternalLink,
  GraduationCap,
  Keyboard,
  Lock,
  Mic,
  MicOff,
  PenLine,
} from "lucide-react"

import { ChoiceCard } from "@/components/interview/choice-card"
import { ResumeInput, type ResumeUpload } from "@/components/interview/resume-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  INTERVIEW_LENGTH_DETAILS,
  INTERVIEW_LENGTHS,
  INTERVIEW_LEVEL_DETAILS,
  INTERVIEW_LEVEL_LABELS,
  INTERVIEW_LEVELS,
  INTERVIEW_SETTINGS,
  type InterviewLength,
  type InterviewLevel,
  type InterviewPath,
} from "@/config/interview"
import { SUPPORTED_BROWSERS_HINT, VOICE_PRIVACY_NOTE } from "@/config/voice"
import { PM_PROGRAMS, PROGRAM_DISCLAIMER } from "@/content/programs"
import { CUSTOM_PROGRAM_ID, type DraftErrors, type WizardDraft } from "@/lib/interview/wizard"

type StepProps = {
  draft: WizardDraft
  errors: DraftErrors
  update: (changes: Partial<WizardDraft>) => void
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-2 text-sm font-medium text-destructive">
      {message}
    </p>
  )
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2
        id="wizard-step-title"
        tabIndex={-1}
        className="font-heading text-2xl font-extrabold tracking-tight focus:outline-none"
      >
        {title}
      </h2>
      <p className="mt-1 text-muted-foreground">{description}</p>
    </div>
  )
}

export function PathStep({
  draft,
  errors,
  update,
  resumeUpload,
  onResumeChange,
}: StepProps & {
  resumeUpload: ResumeUpload | null
  onResumeChange: (text: string, upload: ResumeUpload | null) => void
}) {
  return (
    <div>
      <StepHeading
        title="What are you preparing for?"
        description="Your interviewer will tailor every question to this."
      />
      <RadioGroup
        value={draft.path ?? ""}
        onValueChange={(value) => update({ path: value as InterviewPath })}
        aria-label="Interview target"
        aria-invalid={errors.path ? true : undefined}
        aria-describedby={errors.path ? "path-error" : undefined}
        className="gap-4 sm:grid-cols-2"
      >
        <ChoiceCard
          id="path-job"
          value="job"
          icon={Briefcase}
          title="A specific job"
          description="Paste a job description and we'll interview you for that role."
        />
        <ChoiceCard
          id="path-program"
          value="program"
          icon={GraduationCap}
          title="A PM program"
          description="Practise for a program like Google APM or Meta RPM."
        />
      </RadioGroup>
      <FieldError id="path-error" message={errors.path} />

      {draft.path === "job" && (
        <div className="mt-8">
          <Label htmlFor="job-description" className="text-base font-semibold">
            Job description
          </Label>
          <Textarea
            id="job-description"
            value={draft.jobDescription}
            onChange={(event) => update({ jobDescription: event.target.value })}
            maxLength={INTERVIEW_SETTINGS.maxJobDescriptionChars}
            rows={8}
            placeholder="Paste the full job description here…"
            className="mt-2 min-h-40"
            aria-invalid={errors.jobDescription ? true : undefined}
            aria-describedby="job-description-help job-description-error"
          />
          <p id="job-description-help" className="mt-1 text-right text-xs text-muted-foreground">
            {draft.jobDescription.length.toLocaleString()} /{" "}
            {INTERVIEW_SETTINGS.maxJobDescriptionChars.toLocaleString()}
          </p>
          <FieldError id="job-description-error" message={errors.jobDescription} />
        </div>
      )}

      {draft.path === "program" && (
        <div className="mt-8">
          <p id="program-label" className="text-base font-semibold">
            Choose a program
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{PROGRAM_DISCLAIMER}</p>
          <RadioGroup
            value={draft.programId ?? ""}
            onValueChange={(value) => update({ programId: value })}
            aria-labelledby="program-label"
            aria-invalid={errors.programId ? true : undefined}
            aria-describedby={errors.programId ? "program-error" : undefined}
            className="mt-4 gap-3 sm:grid-cols-2"
          >
            {PM_PROGRAMS.map((program) => (
              <ChoiceCard
                key={program.id}
                id={`program-${program.id}`}
                value={program.id}
                title={program.company}
                meta={program.name}
                description={program.description}
              >
                <a
                  href={program.careersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Official careers page
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </ChoiceCard>
            ))}
            <ChoiceCard
              id={`program-${CUSTOM_PROGRAM_ID}`}
              value={CUSTOM_PROGRAM_ID}
              icon={PenLine}
              title="Another program"
              description="Type the name of any PM, APM or RPM program."
            />
          </RadioGroup>
          <FieldError id="program-error" message={errors.programId} />

          {draft.programId === CUSTOM_PROGRAM_ID && (
            <div className="mt-4">
              <Label htmlFor="custom-program">Program name</Label>
              <Input
                id="custom-program"
                value={draft.customProgram}
                onChange={(event) => update({ customProgram: event.target.value })}
                maxLength={120}
                placeholder="e.g. Salesforce Associate Product Manager"
                className="mt-2"
                aria-invalid={errors.customProgram ? true : undefined}
                aria-describedby={errors.customProgram ? "custom-program-error" : undefined}
              />
              <FieldError id="custom-program-error" message={errors.customProgram} />
            </div>
          )}
        </div>
      )}

      {draft.path && (
        <div className="mt-8">
          <p className="text-base font-semibold">Your resume</p>
          <div className="mt-3">
            <ResumeInput text={draft.resumeText} upload={resumeUpload} onChange={onResumeChange} />
          </div>
        </div>
      )}
    </div>
  )
}

export function LevelStep({ draft, errors, update }: StepProps) {
  return (
    <div>
      <StepHeading
        title="Choose your level"
        description="We'll match the questions to where you are in your career."
      />
      <RadioGroup
        value={draft.level ?? ""}
        onValueChange={(value) => update({ level: value as InterviewLevel })}
        aria-label="Experience level"
        aria-invalid={errors.level ? true : undefined}
        aria-describedby={errors.level ? "level-error" : undefined}
        className="gap-4"
      >
        {INTERVIEW_LEVELS.map((level) => (
          <ChoiceCard
            key={level}
            id={`level-${level}`}
            value={level}
            title={INTERVIEW_LEVEL_LABELS[level]}
            meta={INTERVIEW_LEVEL_DETAILS[level].experience}
            description={INTERVIEW_LEVEL_DETAILS[level].description}
          />
        ))}
      </RadioGroup>
      <FieldError id="level-error" message={errors.level} />
    </div>
  )
}

export function ModeStep({
  draft,
  errors,
  update,
  voiceSupported,
}: StepProps & { voiceSupported: boolean }) {
  return (
    <div>
      <StepHeading
        title="Pick your interview style"
        description="Choose how you'd like to answer and how long you have."
      />
      <p id="mode-label" className="font-semibold">
        How will you answer?
      </p>
      <RadioGroup
        value={draft.mode}
        onValueChange={(value) => update({ mode: value === "voice" ? "voice" : "written" })}
        aria-labelledby="mode-label"
        aria-describedby={errors.mode ? "mode-error" : undefined}
        className="mt-3 gap-4 sm:grid-cols-2"
      >
        <ChoiceCard
          id="mode-written"
          value="written"
          icon={Keyboard}
          title="Written"
          description="Questions appear as text and you type your answers."
        />
        <ChoiceCard
          id="mode-voice"
          value="voice"
          icon={voiceSupported ? Mic : MicOff}
          title="Voice"
          badge={voiceSupported ? undefined : "Not available in this browser"}
          disabled={!voiceSupported}
          description={
            voiceSupported
              ? "Hear each question and answer out loud, like a real interview. You can edit the transcript before submitting."
              : `Your browser can't turn speech into text. Try ${SUPPORTED_BROWSERS_HINT} for voice, or practise in writing.`
          }
        />
      </RadioGroup>
      <FieldError id="mode-error" message={errors.mode} />
      {voiceSupported && draft.mode === "voice" && (
        <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {VOICE_PRIVACY_NOTE}
        </p>
      )}

      <p id="length-label" className="mt-8 font-semibold">
        How long?
      </p>
      <RadioGroup
        value={draft.length}
        onValueChange={(value) => update({ length: value as InterviewLength })}
        aria-labelledby="length-label"
        className="mt-3 gap-4 sm:grid-cols-3"
      >
        {INTERVIEW_LENGTHS.map((length) => {
          const details = INTERVIEW_LENGTH_DETAILS[length]
          return (
            <ChoiceCard
              key={length}
              id={`length-${length}`}
              value={length}
              title={details.label}
              meta={`${details.questionCount} questions`}
              description={details.minutes}
            />
          )
        })}
      </RadioGroup>
    </div>
  )
}

export { StepHeading }
