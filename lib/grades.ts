import type { SubjectResultStatus } from "@/types/academic"

export function calculateGradeFromPercentage(percentage: number): string {
  if (percentage >= 80) return "A"
  if (percentage >= 70) return "B"
  if (percentage >= 60) return "C"
  if (percentage >= 50) return "D"
  return "F"
}

export function gradeColor(grade: string): string {
  switch (grade.toUpperCase()) {
    case "A":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "B":
      return "bg-sky-100 text-sky-800 border-sky-200"
    case "C":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "D":
      return "bg-orange-100 text-orange-800 border-orange-200"
    default:
      return "bg-rose-100 text-rose-800 border-rose-200"
  }
}

export function overallStatus(
  results: { percentage: number }[],
): { label: string; average: number; tone: "pass" | "borderline" | "fail" } {
  if (results.length === 0) {
    return { label: "No results", average: 0, tone: "fail" }
  }
  const average =
    Math.round(
      (results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length) * 10,
    ) / 10
  if (average >= 60) return { label: "Pass", average, tone: "pass" }
  if (average >= 50) return { label: "Pass (Borderline)", average, tone: "borderline" }
  return { label: "Needs Improvement", average, tone: "fail" }
}

export function resultBadgeClass(result: SubjectResultStatus): string {
  return result === "Pass"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-rose-50 text-rose-700"
}
