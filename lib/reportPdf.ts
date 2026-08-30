import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { overallStatus } from "./grades"
import type { ReportBundle } from "@/types/academic"

export function downloadReportPdf(bundle: ReportBundle): void {
  const { report, results, schoolName, collectionLabel, branding } = bundle
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const margin = 14
  let y = 16

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text(schoolName, margin, y)
  y += 8

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  const subtitle = collectionLabel
    ? `Academic Report — ${collectionLabel}`
    : "Student Academic Report"
  doc.text(subtitle, margin, y)
  y += 10

  doc.setFontSize(10)
  const info = [
    `Student: ${report.studentName}`,
    `Student ID: ${report.studentId || "—"}`,
    `Class: ${report.className}`,
    `Academic Year: ${report.academicYear}`,
    `Term: ${report.term}`,
    `Class Teacher: ${report.classTeacherName}`,
    report.positionInClass ? `Position in Class: ${report.positionInClass}` : "",
    `Report Date: ${report.reportDate}`,
  ].filter(Boolean)

  info.forEach((line) => {
    doc.text(line, margin, y)
    y += 5
  })

  y += 4

  autoTable(doc, {
    startY: y,
    head: [["Subject", "Marks", "%", "Grade", "Result"]],
    body: results.map((r) => [
      r.subjectName,
      String(r.marks),
      String(r.percentage),
      r.grade,
      r.result,
    ]),
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: margin, right: margin },
  })

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 20
  const summary = overallStatus(results)

  doc.setFont("helvetica", "bold")
  doc.text(`Overall Average: ${summary.average}% — ${summary.label}`, margin, finalY + 10)

  const comment =
    report.teacherComment && report.headTeacherComment
      ? `Class Teacher: ${report.teacherComment}\n\nHead Teacher: ${report.headTeacherComment}`
      : report.generalComment || report.teacherComment || report.headTeacherComment || ""

  if (comment) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    const lines = doc.splitTextToSize(comment, 180)
    doc.text(lines, margin, finalY + 18)
  }

  if (branding.headTeacherName) {
    doc.setFontSize(9)
    doc.text(`Head Teacher: ${branding.headTeacherName}`, margin, 285)
  }

  const safeName = report.studentName.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_")
  doc.save(`${safeName}_${report.term}_${report.academicYear}_results.pdf`)
}
