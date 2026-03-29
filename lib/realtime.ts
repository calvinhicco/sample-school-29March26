// Firebase connections removed - data is managed via Electron desktop app only
// This file is kept for compatibility but returns empty data

export async function getInitial<T>(_tableName: string, _forceFresh = false): Promise<T[]> {
  return []
}

export function subscribe<T>(_tableName: string, _cb: (docs: T[]) => void) {
  // No-op subscription
  return () => {}
}

export async function getOne<T>(_tableName: string, _id: string): Promise<T | null> {
  return null
}

export function subscribeOne<T>(_tableName: string, _id: string, _cb: (doc: T | null) => void) {
  // No-op subscription
  return () => {}
}
