import Link from "next/link";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending Data", value: "Pending Data" },
  { label: "Data Received", value: "Data Received" },
  { label: "Under Processing", value: "Under Processing" },
  { label: "Filed", value: "Filed" },
  { label: "Closed", value: "Closed" },
  { label: "Overdue", value: "Overdue" },
];

export default function FilterTabs({
  active,
  query,
}: {
  active: string;
  query: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const isActive = active === f.value;
        const params = new URLSearchParams();
        if (f.value) params.set("status", f.value);
        if (query) params.set("q", query);
        const href = `/dashboard${params.toString() ? `?${params.toString()}` : ""}`;

        return (
          <Link
            key={f.label}
            href={href}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
              isActive
                ? "bg-ink text-paper border-ink"
                : "border-rule text-ink-soft hover:bg-gold-soft"
            }`}
          >
            {f.label}
          </Link>
        );
      })}
    </div>
  );
}
