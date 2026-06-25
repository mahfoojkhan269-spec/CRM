const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** e.g. "Jun-2026" */
export function formatMonthLabel(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]}-${date.getFullYear()}`;
}

/** Indian financial year, e.g. "FY 2026-27" for any date Apr 2026 - Mar 2027 */
export function formatFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed; April = 3
  const startYear = month >= 3 ? year : year - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
  return `FY ${startYear}-${endYearShort}`;
}

/** GST filings for a given month are due on the 11th of the following month */
export function dueDateForMonth(date: Date): string {
  const due = new Date(date.getFullYear(), date.getMonth() + 1, 11);
  return due.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function isOverdue(dueDateStr: string, status: string): boolean {
  const terminal = ["Filed", "ARN Shared", "Closed"];
  if (terminal.includes(status)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  return due < today;
}
