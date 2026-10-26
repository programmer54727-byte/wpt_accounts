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
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) {
      setQuery(selected?.label ?? "");
      setHighlight(0);
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

  // Virtual rows: filtered options + optional create row
  const showCreateRow = Boolean(onCreate && query.trim() && !exactMatch);
  const showCreateAlways = Boolean(onCreate);
  const createRowCount = showCreateRow ? 1 : showCreateAlways ? 1 : 0;
  const totalRows = filtered.length + createRowCount;

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${highlight}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const pickOption = (o: SearchOption) => {
    onChange(o.id);
    setQuery(o.label);
    setOpen(false);
    // Move focus to next focusable in form (Tab-like)
    requestAnimationFrame(() => {
      const form = inputRef.current?.form;
      if (!form || !inputRef.current) return;
      const focusables = Array.from(
        form.querySelectorAll<HTMLElement>(
          'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]):not([type="button"])'
        )
      ).filter((el) => el.offsetParent !== null || el === inputRef.current);
      // Prefer any focusable after current input
      const all = Array.from(
        form.querySelectorAll<HTMLElement>(
          'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
        )
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        return style.visibility !== "hidden" && style.display !== "none";
      });
      const idx = all.indexOf(inputRef.current!);
      if (idx >= 0 && idx < all.length - 1) {
        all[idx + 1].focus();
      }
    });
  };

  const triggerCreate = () => {
    if (!onCreate) return;
    setOpen(false);
    onCreate(query.trim());
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlight(0);
        return;
      }
      if (totalRows === 0) return;
      setHighlight((h) => (h + 1) % totalRows);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlight(Math.max(0, totalRows - 1));
        return;
      }
      if (totalRows === 0) return;
      setHighlight((h) => (h - 1 + totalRows) % totalRows);
      return;
    }

    if (e.key === "Enter") {
      if (!open) return;
      e.preventDefault();
      if (highlight < filtered.length) {
        pickOption(filtered[highlight]);
        return;
      }
      // create row highlighted
      if (onCreate && highlight >= filtered.length) {
        triggerCreate();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery(selected?.label ?? "");
      return;
    }

    if (e.key === "Tab") {
      setOpen(false);
      if (selected) setQuery(selected.label);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        value={open ? query : selected?.label ?? query}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-activedescendant={open ? `ss-opt-${highlight}` : undefined}
        onFocus={() => {
          setOpen(true);
          setQuery(selected?.label ?? "");
          setHighlight(0);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange("");
        }}
        onKeyDown={onKeyDown}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-60"
        autoComplete="off"
      />

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg"
        >
          {filtered.length === 0 && !onCreate && (
            <p className="px-3 py-2 text-xs text-[var(--text-muted)]">No results</p>
          )}

          {filtered.map((o, i) => (
            <button
              key={o.id}
              id={`ss-opt-${i}`}
              data-index={i}
              type="button"
              role="option"
              aria-selected={i === highlight}
              className={`flex w-full flex-col px-3 py-2 text-left text-sm ${
                i === highlight
                  ? "bg-[var(--primary)]/10 text-[var(--text-primary)]"
                  : "hover:bg-[var(--background)]"
              } ${o.id === value ? "font-medium" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => pickOption(o)}
            >
              <span className="text-[var(--text-primary)]">{o.label}</span>
              {o.sublabel && (
                <span className="text-xs text-[var(--text-muted)]">{o.sublabel}</span>
              )}
            </button>
          ))}

          {showCreateRow && (
            <button
              type="button"
              data-index={filtered.length}
              id={`ss-opt-${filtered.length}`}
              role="option"
              aria-selected={highlight === filtered.length}
              className={`w-full border-t border-[var(--border)] px-3 py-2 text-left text-sm font-medium text-[var(--primary)] ${
                highlight === filtered.length ? "bg-[var(--primary)]/10" : "hover:bg-[var(--background)]"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlight(filtered.length)}
              onClick={triggerCreate}
            >
              {createLabel}: “{query.trim()}”
            </button>
          )}

          {onCreate && !showCreateRow && (
            <button
              type="button"
              data-index={filtered.length}
              id={`ss-opt-${filtered.length}`}
              role="option"
              aria-selected={highlight === filtered.length}
              className={`w-full border-t border-[var(--border)] px-3 py-2 text-left text-xs text-[var(--text-secondary)] ${
                highlight === filtered.length ? "bg-[var(--primary)]/10" : "hover:bg-[var(--background)]"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlight(filtered.length)}
              onClick={triggerCreate}
            >
              + {createLabel}…
            </button>
          )}
        </div>
      )}
    </div>
  );
}
