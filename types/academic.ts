export type SubjectResultStatus = "Pass" | "Fail"

export interface StudentAcademicReport {
  id: string
  studentId?: string
  firstName?: string
  lastName?: string
  studentName: string
  className: string
  academicYear: string
  term: string
  classTeacherId?: string
  classTeacherName: string
  positionInClass?: string
  teacherComment?: string
  headTeacherComment?: string
  generalComment?: string
  reportDate: string
  createdAt: string
  updatedAt: string
}

export interface StudentSubjectResult {
  id: string
  reportId: string
  subjectId: string
  subjectName: string
  marks: number
  percentage: number
  grade: string
  result: SubjectResultStatus
  absent?: boolean
}

export interface SchoolBranding {
  schoolName?: string
  logoDataUrl?: string
  headTeacherName?: string
  classTeacherName?: string
}

export interface AcademicReportCollection {
  id: string
  reportLabel: string
  academicYear: string
  term: string
  classAssigned: string
}

export interface PortalSession {
  studentId: string
  studentName: string
  firstName: string
  lastName: string
}

export interface ReportBundle {
  report: StudentAcademicReport
  results: StudentSubjectResult[]
  collectionLabel?: string
  branding: SchoolBranding
  schoolName: string
}
