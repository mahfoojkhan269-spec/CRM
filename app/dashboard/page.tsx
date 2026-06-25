import { supabaseAdmin } from "@/lib/supabase-admin";
import { isOverdue } from "@/lib/months";
import StatusBadge from "@/components/StatusBadge";
import ActionsMenu from "@/components/ActionsMenu";
import FilterTabs from "@/components/FilterTabs";
import SearchBar from "@/components/SearchBar";
import AddClientForm from "@/components/AddClientForm";
import LogoutButton from "@/components/LogoutButton";
import StatsCards from "@/components/StatsCards";

type CycleRow = {
  id: string;
  month: string;
  due_date: string;
  status: string;
  arn_number: string | null;
  clients: {
    id: string;
    client_name: string;
    gstin: string | null;
    mobile_number: string;
  } | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = sp.status || "";
  const query = (sp.q || "").trim().toLowerCase();

  const { data, error } = await supabaseAdmin
    .from("compliance_cycles")
    .select(
      "id, month, due_date, status, arn_number, clients ( id, client_name, gstin, mobile_number )"
    )
    .order("due_date", { ascending: true });

  const rows: CycleRow[] = (data as unknown as CycleRow[] | null) ?? [];

  const filtered = rows.filter((row) => {
    const overdue = isOverdue(row.due_date, row.status);

    if (statusFilter === "Overdue" && !overdue) return false;
    if (statusFilter && statusFilter !== "Overdue" && row.status !== statusFilter) {
      return false;
    }

    if (query) {
      const name = row.clients?.client_name?.toLowerCase() || "";
      const gstin = row.clients?.gstin?.toLowerCase() || "";
      if (!name.includes(query) && !gstin.includes(query)) return false;
    }

    return true;
  });

  const overdueCount = rows.filter((r) => isOverdue(r.due_date, r.status)).length;
  const countByStatus = (status: string) => rows.filter((r) => r.status === status).length;

  const stats = [
    { label: "Total Cycles", count: rows.length, tone: "default" as const },
    { label: "Pending Data", count: countByStatus("Pending Data"), tone: "warn" as const },
    { label: "Data Received", count: countByStatus("Data Received"), tone: "default" as const },
    { label: "Under Processing", count: countByStatus("Under Processing"), tone: "default" as const },
    { label: "Prepared", count: countByStatus("Prepared"), tone: "default" as const },
    { label: "Filed", count: countByStatus("Filed") + countByStatus("ARN Shared"), tone: "good" as const },
    { label: "Overdue", count: overdueCount, tone: "overdue" as const },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-rule bg-paper-raised px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-data text-xs tracking-[0.2em] text-ink-soft uppercase">
            Compliance Ledger
          </p>
          <h1 className="font-display text-2xl text-ink">GST Compliance Dashboard</h1>
        </div>
        <LogoutButton />
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-5">
        <StatsCards stats={stats} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs active={statusFilter} query={sp.q || ""} />
          <div className="flex items-center gap-3">
            <SearchBar defaultValue={sp.q || ""} status={statusFilter} />
            <AddClientForm />
          </div>
        </div>

        {error && (
          <p className="text-sm text-[var(--overdue)]">
            Failed to load data: {error.message}
          </p>
        )}

        <div className="bg-paper-raised border border-rule rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule text-left text-xs font-data uppercase tracking-wider text-ink-soft">
                <th className="px-4 py-3">Client Name</th>
                <th className="px-4 py-3">GSTIN</th>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">
                    No compliance cycles match this view yet.
                  </td>
                </tr>
              )}
              {filtered.map((row) => {
                const overdue = isOverdue(row.due_date, row.status);
                return (
                  <tr key={row.id} className="border-b border-rule last:border-0 hover:bg-paper">
                    <td className="px-4 py-3 font-medium">
                      {row.clients?.client_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-data text-ink-soft">
                      {row.clients?.gstin || "—"}
                    </td>
                    <td className="px-4 py-3">{row.month}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                      {row.arn_number && (
                        <span className="ml-2 text-xs font-data text-ink-soft">
                          ARN: {row.arn_number}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-data">
                      {row.due_date}
                      {overdue && (
                        <span className="stamp-overdue ml-2">OVERDUE</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionsMenu
                        cycleId={row.id}
                        clientId={row.clients?.id ?? ""}
                        clientName={row.clients?.client_name ?? "this client"}
                        mobileNumber={row.clients?.mobile_number ?? ""}
                        month={row.month}
                        dueDate={row.due_date}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-ink-soft">
          Showing {filtered.length} of {rows.length} compliance cycle{rows.length === 1 ? "" : "s"}.
        </p>
      </main>
    </div>
  );
}