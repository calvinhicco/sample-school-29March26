"use client"

import { format } from "date-fns"
import { Download, LogOut } from "lucide-react"
import { GradeBadge } from "./GradeBadge"
import { downloadReportPdf } from "@/lib/reportPdf"
import { overallStatus, resultBadgeClass } from "@/lib/grades"
import { cn } from "@/lib/utils"
import type { ReportBundle } from "@/types/academic"

export function ReportView({
  bundles,
  selectedId,
  onSelect,
  onLogout,
}: {
  bundles: ReportBundle[]
  selectedId: string
  onSelect: (id: string) => void
  onLogout: () => void
}) {
  const bundle = bundles.find((b) => b.report.id === selectedId) ?? bundles[0]
  const { report, results, schoolName, collectionLabel } = bundle
  const summary = overallStatus(results)

  const displayComment =
    report.teacherComment && report.headTeacherComment
      ? null
      : report.generalComment || report.teacherComment || report.headTeacherComment

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
            {schoolName}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{report.studentName}</h1>
          <p className="mt-1 text-slate-600">
            {report.className} · {report.academicYear} · {report.term}
          </p>
          {collectionLabel && (
            <p className="mt-1 text-sm text-slate-500">{collectionLabel}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadReportPdf(bundle)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      {bundles.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {bundles.map((b) => (
            <button
              key={b.report.id}
              type="button"
              onClick={() => onSelect(b.report.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                b.report.id === bundle.report.id
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand-300",
              )}
            >
              {b.report.term} {b.report.academicYear}
            </button>
          ))}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Student ID", value: report.studentId || "—" },
          { label: "Class teacher", value: report.classTeacherName },
          { label: "Position", value: report.positionInClass || "—" },
          {
            label: "Report date",
            value: report.reportDate
              ? format(new Date(report.reportDate), "dd MMM yyyy")
              : "—",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {item.label}
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "mb-6 rounded-xl border p-5",
          summary.tone === "pass" && "border-emerald-200 bg-emerald-50",
          summary.tone === "borderline" && "border-amber-200 bg-amber-50",
          summary.tone === "fail" && "border-rose-200 bg-rose-50",
        )}
      >
        <p className="text-sm font-medium text-slate-600">Overall performance</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {summary.average}% — {summary.label}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="font-semibold text-slate-900">Subject results</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold text-right">Marks</th>
                <th className="px-4 py-3 font-semibold text-right">%</th>
                <th className="px-4 py-3 font-semibold text-center">Grade</th>
                <th className="px-4 py-3 font-semibold text-center">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No subject marks recorded for this report yet.
                  </td>
                </tr>
              ) : (
                results.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.subjectName}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{row.marks}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {row.percentage}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <GradeBadge grade={row.grade} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          resultBadgeClass(row.result),
                        )}
                      >
                        {row.result}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {results.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 font-semibold text-slate-900">
                  <td className="px-4 py-3">Average</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right tabular-nums">{summary.average}%</td>
                  <td className="px-4 py-3 text-center">
                    <GradeBadge
                      grade={
                        summary.average >= 80
                          ? "A"
                          : summary.average >= 70
                            ? "B"
                            : summary.average >= 60
                              ? "C"
                              : summary.average >= 50
                                ? "D"
                                : "F"
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        summary.tone === "fail"
                          ? resultBadgeClass("Fail")
                          : resultBadgeClass("Pass"),
                      )}
                    >
                      {summary.tone === "fail" ? "Fail" : "Pass"}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {(displayComment || (report.teacherComment && report.headTeacherComment)) && (
        <div className="mt-6 space-y-4">
          {report.teacherComment && report.headTeacherComment ? (
            <>
              <CommentBlock title="Class teacher's comment" text={report.teacherComment} />
              <CommentBlock title="Head teacher's comment" text={report.headTeacherComment} />
            </>
          ) : (
            <CommentBlock title="Comments" text={displayComment || ""} />
          )}
        </div>
      )}
    </div>
  )
}

function CommentBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-slate-800 leading-relaxed">{text}</p>
    </div>
  )
}
