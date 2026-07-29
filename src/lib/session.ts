// Tiny pub/sub so the API layer can tell AuthContext that the JWT is no longer
// accepted, without importing React or creating a circular dependency.
// JWT lifetime is 30 days; a 401 means it expired (or was revoked server-side).

type Listener = () => void

const listeners = new Set<Listener>()

export function onSessionExpired(fn: Listener): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export function notifySessionExpired(): void {
  for (const fn of listeners) fn()
}
