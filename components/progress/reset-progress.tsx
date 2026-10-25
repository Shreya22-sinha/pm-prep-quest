"use client"

import { RotateCcw } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useProgressStore } from "@/store/progress-store"

export function ResetProgress() {
  const resetProgress = useProgressStore((state) => state.resetProgress)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="h-10 px-4 text-muted-foreground">
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          Start over
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start over from scratch?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears your XP, levels, badges, streak and interview history on this device. It
            can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep my progress</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              resetProgress()
              toast("Fresh start! Your progress has been reset.")
            }}
          >
            Yes, start over
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
