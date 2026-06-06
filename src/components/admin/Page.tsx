/** Standard admin page shell — header + body padding. */
export default function AdminPage({
  title,
  subtitle,
  action,
  children,
}: {
  title:     string;
  subtitle?: string;
  action?:   React.ReactNode;
  children:  React.ReactNode;
}) {
  return (
    <div className="px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-[24px] font-bold leading-tight" style={{ color: "#1A1A1A", letterSpacing: "-0.4px" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] mt-1 font-light" style={{ color: "#888" }}>{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Body */}
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
      <p className="text-[11px] uppercase tracking-[1.2px] font-semibold mb-2" style={{ color: "#999" }}>{label}</p>
      <div className="text-[28px] font-bold leading-none mb-1" style={{ color: "#1C3A2F", letterSpacing: "-0.5px" }}>
        {value}
      </div>
      {hint && <p className="text-[11px]" style={{ color: "#999" }}>{hint}</p>}
    </div>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold no-underline transition-opacity hover:opacity-90" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>
      {children}
    </a>
  );
}

export function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold no-underline transition-all" style={{ background: "transparent", border: "1.5px solid #E5E0D8", color: "#1C3A2F" }}>
      {children}
    </a>
  );
}
