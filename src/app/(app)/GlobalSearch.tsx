"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { searchGlobal, type GlobalSearchResult } from "./actions";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const r = await searchGlobal(query);
        setResults(r);
        setOpen(true);
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function handleChange(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults(null);
    }
  }

  const hasResults = !!(results && (results.patients.length || results.invoices.length));

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        placeholder="بحث عن مريض أو رقم فاتورة..."
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg">
          {pending ? (
            <p className="px-3 py-2 text-sm text-ink-muted">جاري البحث...</p>
          ) : hasResults ? (
            <div className="flex flex-col divide-y divide-border">
              {results!.patients.map((p) => (
                <Link
                  key={p.id}
                  href={`/patients/${p.id}`}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-sm text-ink hover:bg-surface-alt"
                >
                  {p.name} {p.phone ? <span className="font-mono text-ink-muted">— {p.phone}</span> : null}
                </Link>
              ))}
              {results!.invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 font-mono text-sm text-ink hover:bg-surface-alt"
                >
                  فاتورة {inv.invoice_no}
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-3 py-2 text-sm text-ink-muted">ما في نتائج</p>
          )}
        </div>
      )}
    </div>
  );
}
