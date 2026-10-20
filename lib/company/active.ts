const STORAGE_KEY = "wpt-active-company-id";

export function getActiveCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setActiveCompanyId(id: string) {
  localStorage.setItem(STORAGE_KEY, id);
}

export { STORAGE_KEY };
