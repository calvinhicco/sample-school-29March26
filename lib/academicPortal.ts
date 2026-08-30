import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore"
import { getDb } from "./firebase"
import { namesMatch, normalizeName } from "./utils"
import type {
  PortalSession,
  ReportBundle,
  SchoolBranding,
  StudentAcademicReport,
  StudentSubjectResult,
} from "@/types/academic"

const SESSION_KEY = "academicPortalSession"

export function saveSession(session: PortalSession): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function loadSession(): PortalSession | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PortalSession
  } catch {
    return null
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(SESSION_KEY)
}

async function fetchSchoolBranding(): Promise<SchoolBranding> {
  const db = getDb()
  try {
    const brandingSnap = await getDoc(doc(db, "academicSchoolBranding", "data"))
    if (brandingSnap.exists()) {
      return brandingSnap.data() as SchoolBranding
    }
  } catch {
    /* optional */
  }
  try {
    const settingsSnap = await getDoc(doc(db, "settings", "app"))
    if (settingsSnap.exists()) {
      const data = settingsSnap.data()
      return { schoolName: data.schoolName as string | undefined }
    }
  } catch {
    /* optional */
  }
  return {}
}

export async function loginParent(input: {
  firstName: string
  lastName: string
  studentId: string
}): Promise<PortalSession> {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const studentId = input.studentId.trim()

  if (!firstName || !lastName || !studentId) {
    throw new Error("Please enter the child's first name, surname, and student ID.")
  }

  const db = getDb()
  const studentSnap = await getDoc(doc(db, "students", studentId))

  if (!studentSnap.exists()) {
    throw new Error("No student found with that ID. Check the ID on the school report or admission letter.")
  }

  const student = studentSnap.data()
  const fullName = String(student.fullName || student.studentName || "")

  if (!namesMatch(firstName, lastName, fullName)) {
    throw new Error("The name does not match our records for this student ID.")
  }

  const session: PortalSession = {
    studentId,
    studentName: fullName,
    firstName,
    lastName,
  }
  saveSession(session)
  return session
}

function reportBelongsToStudent(
  report: StudentAcademicReport,
  session: PortalSession,
): boolean {
  if (report.studentId && report.studentId === session.studentId) return true
  return namesMatch(session.firstName, session.lastName, report.studentName)
}

export async function fetchReportsForSession(
  session: PortalSession,
): Promise<ReportBundle[]> {
  const db = getDb()
  const branding = await fetchSchoolBranding()
  const schoolName = branding.schoolName || "School Academic Results"

  let reports: StudentAcademicReport[] = []

  try {
    const byIdSnap = await getDocs(
      query(collection(db, "academicStudentReports"), where("studentId", "==", session.studentId)),
    )
    reports = byIdSnap.docs.map((d) => ({ id: d.id, ...d.data() } as StudentAcademicReport))
  } catch {
    /* index may be missing — fall back to full scan */
  }

  if (reports.length === 0) {
    const allSnap = await getDocs(collection(db, "academicStudentReports"))
    reports = allSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as StudentAcademicReport))
      .filter((r) => reportBelongsToStudent(r, session))
  }

  if (reports.length === 0) {
    try {
      const colSnap = await getDocs(collection(db, "academicReportCollections"))
      const fromCollections: StudentAcademicReport[] = []
      const seen = new Set<string>()
      for (const colDoc of colSnap.docs) {
        const nested = (colDoc.data().studentReports || []) as StudentAcademicReport[]
        for (const report of nested) {
          if (!report?.id || seen.has(report.id)) continue
          if (!reportBelongsToStudent(report, session)) continue
          seen.add(report.id)
          fromCollections.push(report)
        }
      }
      reports = fromCollections
    } catch {
      /* optional */
    }
  }

  if (reports.length === 0) {
    throw new Error(
      "No published results yet for this student. Ask the school to save and sync academic reports from the desktop app.",
    )
  }

  const resultsSnap = await getDocs(collection(db, "academicStudentSubjectResults"))
  const allResults = resultsSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as StudentSubjectResult),
  )

  let collections: { id: string; reportLabel: string; studentReports: StudentAcademicReport[] }[] = []
  try {
    const colSnap = await getDocs(collection(db, "academicReportCollections"))
    collections = colSnap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        reportLabel: String(data.reportLabel || ""),
        studentReports: (data.studentReports || []) as StudentAcademicReport[],
      }
    })
  } catch {
    /* optional */
  }

  const bundles: ReportBundle[] = reports.map((report) => {
    const collectionMatch = collections.find((c) =>
      c.studentReports.some((r) => r.id === report.id),
    )
    return {
      report,
      results: allResults
        .filter((r) => r.reportId === report.id)
        .sort((a, b) => a.subjectName.localeCompare(b.subjectName)),
      collectionLabel: collectionMatch?.reportLabel,
      branding,
      schoolName,
    }
  })

  return bundles.sort((a, b) => {
    const yearCmp = b.report.academicYear.localeCompare(a.report.academicYear)
    if (yearCmp !== 0) return yearCmp
    return b.report.reportDate.localeCompare(a.report.reportDate)
  })
}

export async function fetchReportBundle(
  session: PortalSession,
  reportId: string,
): Promise<ReportBundle> {
  const bundles = await fetchReportsForSession(session)
  const bundle = bundles.find((b) => b.report.id === reportId)
  if (!bundle) {
    throw new Error("Report not found or access denied.")
  }
  return bundle
}
