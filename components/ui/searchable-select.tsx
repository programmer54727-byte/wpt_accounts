"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SearchOption = {
  id: string;
  label: string;
  sublabel?: string;
};

type Props = {
  options: SearchOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  createLabel?: string;
  onCreate?: (query: string) => void;
  className?: string;
  disabled?: boolean;
};

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search…",
  createLabel = "Add new",
  onCreate,
  className = "",
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) {
      setQuery(selected?.label ?? "");
    }
  }, [selected, open, value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 50);
    return options
      .filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          (o.sublabel && o.sublabel.toLowerCase().includes(q))
      )
      .slice(0, 50);
  }, [options, query]);

  const exactMatch = options.some(
    (o) => o.label.toLowerCase() === query.trim().toLowerCase()
  );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        value={open ? query : selected?.label ?? query}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setQuery(selected?.label ?? "");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange("");
        }}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-60"
        autoComplete="off"
      />

      {open && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg">
          {filtered.length === 0 && !onCreate && (
            <p className="px-3 py-2 text-xs text-[var(--text-muted)]">No results</p>
          )}

          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-[var(--background)] ${
                o.id === value ? "bg-[var(--background)]" : ""
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(o.id);
                setQuery(o.label);
                setOpen(false);
              }}
            >
              <span className="text-[var(--text-primary)]">{o.label}</span>
              {o.sublabel && (
                <span className="text-xs text-[var(--text-muted)]">{o.sublabel}</span>
              )}
            </button>
          ))}

          {onCreate && query.trim() && !exactMatch && (
            <button
              type="button"
              className="w-full border-t border-[var(--border)] px-3 py-2 text-left text-sm font-medium text-[var(--primary)] hover:bg-[var(--background)]"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen(false);
                onCreate(query.trim());
              }}
            >
              {createLabel}: “{query.trim()}”
            </button>
          )}

          {onCreate && (
            <button
              type="button"
              className="w-full border-t border-[var(--border)] px-3 py-2 text-left text-xs text-[var(--text-secondary)] hover:bg-[var(--background)]"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen(false);
                onCreate(query.trim());
              }}
            >
              + {createLabel}…
            </button>
          )}
        </div>
      )}
    </div>
  );
}
