export default function SignatureBlock({ labels, withName }: { labels: string[]; withName?: boolean }) {
  return (
    <div className="mt-10 flex flex-wrap justify-between gap-6 border-t border-border pt-6 text-sm">
      {labels.map((label) => (
        <div key={label} className="flex flex-col gap-6">
          <span className="text-ink-muted">{label}</span>
          {withName && (
            <>
              <span className="text-xs text-ink-muted">
                الاسم: <span className="inline-block w-32 border-b border-ink-muted">&nbsp;</span>
              </span>
              <span className="text-xs text-ink-muted">
                التاريخ: <span className="inline-block w-32 border-b border-ink-muted">&nbsp;</span>
              </span>
            </>
          )}
          <span className="w-40 border-t border-ink-muted pt-1 text-xs text-ink-muted">التوقيع</span>
        </div>
      ))}
    </div>
  );
}
