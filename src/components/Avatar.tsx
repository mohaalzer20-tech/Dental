const VARIANTS = [
  { bg: "bg-cat-cyan/20", text: "text-cat-cyan" },
  { bg: "bg-cat-violet/20", text: "text-cat-violet" },
  { bg: "bg-cat-pink/20", text: "text-cat-pink" },
  { bg: "bg-cat-green/20", text: "text-cat-green" },
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[1][0];
}

function hashIndex(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash % VARIANTS.length;
}

export default function Avatar({
  name,
  index,
  size = "md",
}: {
  name: string;
  index?: number;
  size?: "sm" | "md";
}) {
  const variant = VARIANTS[(index ?? hashIndex(name)) % VARIANTS.length];
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <span
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full ${variant.bg} font-mono font-semibold ${variant.text}`}
    >
      {initials(name)}
    </span>
  );
}
