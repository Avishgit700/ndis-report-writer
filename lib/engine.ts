// saas-engine client for NDIS Report Writer
const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? 'https://saas-engine-production.up.railway.app'
const ORG_ID     = process.env.SAAS_ENGINE_ORG_ID!
const PROJECT_ID = process.env.SAAS_ENGINE_PROJECT_ID!
const API_KEY    = process.env.SAAS_ENGINE_API_KEY!

// --- Token management ---
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('ndisrw_token')
}
export function setToken(token: string) {
  localStorage.setItem('ndisrw_token', token)
}
export function clearToken() {
  localStorage.removeItem('ndisrw_token')
  localStorage.removeItem('ndisrw_user')
}
export function getUser(): EngineUser | null {
  if (typeof window === 'undefined') return null
  const u = localStorage.getItem('ndisrw_user')
  return u ? JSON.parse(u) : null
}
export function setUser(user: object) {
  localStorage.setItem('ndisrw_user', JSON.stringify(user))
}

// --- Fetch helpers ---
async function keyFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${ENGINE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Request failed')
  return json.data as T
}

// --- Auth via local proxy (avoids CORS) ---
async function proxyAuth<T>(path: string, body: object): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) {
    if (json.errors) {
      const fieldErrors = Object.values(json.errors as Record<string, string[]>).flat()
      throw new Error(fieldErrors[0] ?? json.message ?? 'Request failed')
    }
    throw new Error(json.message ?? 'Request failed')
  }
  return json.data as T
}

export const engineAuth = {
  register: (name: string, email: string, password: string) =>
    proxyAuth<{ user: EngineUser; accessToken: string; refreshToken: string }>(
      '/api/auth/register', { name, email, password }
    ),
  login: (email: string, password: string) =>
    proxyAuth<{ user: EngineUser; accessToken: string; refreshToken: string }>(
      '/api/auth/login', { email, password }
    ),
}

// --- Data ---
export const engineData = {
  saveNote: (data: {
    userId: string
    clientName: string
    reportType: string
    generatedNote: string
    rawInput: string
    workerName?: string
    duration?: string
  }) => keyFetch(`/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records`, {
    method: 'POST',
    body: JSON.stringify({ entityType: 'ndis_note', data }),
  }),

  getNotes: () => keyFetch<{ data: EngineRecord[] }>(
    `/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records?entityType=ndis_note&limit=100`
  ),

  saveClient: (data: {
    userId: string
    name: string
    ndisNumber?: string
    dob?: string
    diagnosis?: string
    goals?: string
    supports?: string
  }) => keyFetch(`/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records`, {
    method: 'POST',
    body: JSON.stringify({ entityType: 'client_profile', data }),
  }),

  getClients: () => keyFetch<{ data: EngineRecord[] }>(
    `/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records?entityType=client_profile&limit=200`
  ),

  logUsage: (userId: string, plan: string) => keyFetch(
    `/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records`, {
      method: 'POST',
      body: JSON.stringify({ entityType: 'usage_event', data: { userId, plan, action: 'generate_note' } }),
    }
  ),

  getUsageCount: async (userId: string): Promise<number> => {
    const result = await keyFetch<{ data: EngineRecord[] }>(
      `/api/orgs/${ORG_ID}/projects/${PROJECT_ID}/records?entityType=usage_event&limit=1000`
    )
    const currentMonth = new Date().toISOString().slice(0, 7)
    return result.data.filter((r: EngineRecord) =>
      r.data?.userId === userId && r.createdAt?.startsWith(currentMonth)
    ).length
  },
}

// --- Types ---
export interface EngineUser { id: string; name: string; email: string; isVerified: boolean }
export interface EngineRecord {
  id: string; entityType: string; data: Record<string, unknown>; createdAt: string;
}
export { ORG_ID, PROJECT_ID, ENGINE_URL }
