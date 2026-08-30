import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

export function namesMatch(
  firstName: string,
  lastName: string,
  fullName: string,
): boolean {
  const entered = normalizeName(`${firstName} ${lastName}`)
  const stored = normalizeName(fullName)
  return stored === entered || stored.startsWith(`${entered} `) || stored.endsWith(` ${entered}`)
}
