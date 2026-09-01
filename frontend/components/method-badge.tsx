import { cn, methodTokens } from "@/lib/utils";

export function MethodBadge({
  method,
  size = "sm",
}: {
  method: string;
  size?: "sm" | "md";
}) {
  const t = methodTokens(method);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border font-mono font-semibold tracking-wide tabular-nums",
        t.text,
        t.bg,
        t.border,
        size === "sm" ? "h-5 px-1.5 text-[10px]" : "h-6 px-2 text-xs",
      )}
    >
      {method}
    </span>
  );
}
