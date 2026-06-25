const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  "Pending Data": { color: "var(--status-pending)", bg: "var(--status-pending-bg)" },
  "Data Received": { color: "var(--status-received)", bg: "var(--status-received-bg)" },
  "Under Processing": { color: "var(--status-processing)", bg: "var(--status-processing-bg)" },
  Prepared: { color: "var(--status-prepared)", bg: "var(--status-prepared-bg)" },
  Filed: { color: "var(--status-filed)", bg: "var(--status-filed-bg)" },
  "ARN Shared": { color: "var(--status-arn)", bg: "var(--status-arn-bg)" },
  Closed: { color: "var(--status-closed)", bg: "var(--status-closed-bg)" },
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES["Pending Data"];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {status}
    </span>
  );
}
