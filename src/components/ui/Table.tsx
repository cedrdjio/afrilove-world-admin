import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className={cn("w-full text-sm", className)}>{children}</table>
      </div>
    </div>
  );
}

export function THead({ columns }: { columns: { label: string; className?: string }[] }) {
  return (
    <thead>
      <tr className="border-b border-espresso-500/10 text-left text-xs uppercase tracking-wide text-espresso-500/60">
        {columns.map((c, i) => (
          <th key={i} className={cn("px-5 py-3.5 font-semibold", c.className)}>{c.label}</th>
        ))}
      </tr>
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-espresso-500/5">{children}</tbody>;
}

export function EmptyRow({ colSpan, message = "Nothing here yet." }: { colSpan: number; message?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16 text-center text-espresso-500">{message}</td>
    </tr>
  );
}
