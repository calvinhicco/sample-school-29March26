import { gradeColor } from "@/lib/grades"
import { cn } from "@/lib/utils"

export function GradeBadge({ grade, className }: { grade: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[2rem] items-center justify-center rounded-md border px-2 py-0.5 text-sm font-bold",
        gradeColor(grade),
        className,
      )}
    >
      {grade}
    </span>
  )
}
