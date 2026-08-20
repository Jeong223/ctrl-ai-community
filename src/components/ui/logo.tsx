import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="logo" aria-label="Ctrl + AI 홈">
      <span className="logo-mark" aria-hidden="true">
        <Sparkles size={19} strokeWidth={2.4} />
      </span>
      {!compact && (
        <span>
          <strong>Ctrl + AI</strong>
          <small>Community workspace</small>
        </span>
      )}
    </Link>
  );
}
