"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Company } from "./types";

const STORAGE_KEY = "wpt-active-company-id";

type CompanyContextValue = {
  companies: Company[];
  activeCompany: Company | null;
  setActiveCompanyId: (id: string) => void;
  setCompanies: (list: Company[]) => void;
  loading: boolean;
};

const CompanyContext = createContext<CompanyContextValue>({
  companies: [],
  activeCompany: null,
  setActiveCompanyId: () => {},
  setCompanies: () => {},
  loading: true,
});

export function CompanyProvider({
  children,
  initialCompanies = [],
}: {
  children: React.ReactNode;
  initialCompanies?: Company[];
}) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCompanies(initialCompanies);
  }, [initialCompanies]);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null;

    if (stored && initialCompanies.some((c) => c.id === stored)) {
      setActiveId(stored);
    } else if (initialCompanies.length === 1) {
      setActiveId(initialCompanies[0].id);
      localStorage.setItem(STORAGE_KEY, initialCompanies[0].id);
    } else if (initialCompanies.length > 0) {
      setActiveId(null);
    }
    setLoading(false);
  }, [initialCompanies]);

  const setActiveCompanyId = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const activeCompany =
    companies.find((c) => c.id === activeId) ?? null;

  return (
    <CompanyContext.Provider
      value={{
        companies,
        activeCompany,
        setActiveCompanyId,
        setCompanies,
        loading,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
