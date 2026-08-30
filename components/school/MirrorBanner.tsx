import { SCHOOL_NAME } from "@/lib/schoolConfig"

export function MirrorBanner() {
  return (
    <div className="w-full bg-brand-gradient py-2.5 text-center text-sm font-medium text-white shadow-sm">
      {SCHOOL_NAME} — financial mirror synced from the desktop app. Editing is disabled on this site.
    </div>
  )
}
