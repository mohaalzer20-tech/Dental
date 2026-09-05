export default function SignatureBlock({ labels }: { labels: string[] }) {
  return (
    <div className="mt-10 flex flex-wrap justify-between gap-6 border-t border-border pt-6 text-sm">
      {labels.map((label) => (
        <div key={label} className="flex flex-col gap-8">
          <span className="text-ink-muted">{label}</span>
          <span className="w-40 border-t border-ink-muted"></span>
        </div>
      ))}
    </div>
  );
}
