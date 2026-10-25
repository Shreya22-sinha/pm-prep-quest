"use client"

import { useId, useState } from "react"
import { CheckCircle2, FileText, Loader2, Lock, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { INTERVIEW_SETTINGS } from "@/config/interview"
import { ApiRequestError, apiPost } from "@/lib/api/client"
import { resumeParseResponseSchema } from "@/lib/interview/schema"

export type ResumeUpload = { fileName: string; pages: number; truncated: boolean }

type ResumeInputProps = {
  text: string
  upload: ResumeUpload | null
  onChange: (text: string, upload: ResumeUpload | null) => void
}

export function ResumeInput({ text, upload, onChange }: ResumeInputProps) {
  const id = useId()
  const [status, setStatus] = useState<"idle" | "uploading">("idle")
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    if (file.size > INTERVIEW_SETTINGS.maxResumeFileBytes) {
      setError(new ApiRequestError("file_too_large").message)
      return
    }
    setStatus("uploading")
    try {
      const form = new FormData()
      form.append("file", file)
      const result = await apiPost("/api/resume/parse", form, resumeParseResponseSchema)
      onChange(result.text, {
        fileName: file.name,
        pages: result.pages,
        truncated: result.truncated,
      })
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : "Something went wrong.")
    } finally {
      setStatus("idle")
    }
  }

  return (
    <div>
      <Tabs defaultValue="upload">
        <TabsList aria-label="How to add your resume">
          <TabsTrigger value="upload">Upload PDF</TabsTrigger>
          <TabsTrigger value="paste">Paste text</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          {upload ? (
            <div className="flex items-center gap-3 rounded-2xl border border-success/40 bg-success/10 p-4">
              <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{upload.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  Resume loaded · {upload.pages} {upload.pages === 1 ? "page" : "pages"}
                  {upload.truncated && " · trimmed to fit"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove resume"
                onClick={() => onChange("", null)}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor={`${id}-file`}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
            >
              {status === "uploading" ? (
                <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
              ) : (
                <Upload className="size-6 text-primary" aria-hidden="true" />
              )}
              <span className="font-semibold">
                {status === "uploading" ? "Reading your resume…" : "Choose a PDF"}
              </span>
              <span className="text-sm text-muted-foreground">PDF, up to 5 MB</span>
              <input
                id={`${id}-file`}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                disabled={status === "uploading"}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (file) void handleFile(file)
                }}
              />
            </label>
          )}
        </TabsContent>

        <TabsContent value="paste" className="mt-3">
          <Label htmlFor={`${id}-text`} className="sr-only">
            Resume text
          </Label>
          <Textarea
            id={`${id}-text`}
            value={upload ? "" : text}
            disabled={upload !== null}
            onChange={(event) => onChange(event.target.value, null)}
            maxLength={INTERVIEW_SETTINGS.maxResumeChars}
            rows={8}
            placeholder="Paste your resume here…"
            className="min-h-40"
            aria-describedby={`${id}-count`}
          />
          <p id={`${id}-count`} className="mt-1 text-right text-xs text-muted-foreground">
            {upload
              ? "Using your uploaded PDF. Remove it to paste text instead."
              : `${text.length.toLocaleString()} / ${INTERVIEW_SETTINGS.maxResumeChars.toLocaleString()}`}
          </p>
        </TabsContent>
      </Tabs>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Your resume stays in this browser. It&apos;s only sent to the AI to tailor your questions
        and is never stored on our servers.
      </p>
      {!text && (
        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
          <FileText className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Optional, but adding it unlocks personalised questions and resume feedback.
        </p>
      )}
    </div>
  )
}
