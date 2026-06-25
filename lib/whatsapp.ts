export const REMINDER_TEMPLATES = [
  { label: "First Reminder", key: "first" },
  { label: "Second Reminder", key: "second" },
  { label: "Final Reminder", key: "final" },
] as const;

export type ReminderKey = (typeof REMINDER_TEMPLATES)[number]["key"];

function buildMessage(
  key: ReminderKey,
  params: { clientName: string; month: string; dueDate: string }
): string {
  const { clientName, month, dueDate } = params;

  switch (key) {
    case "first":
      return (
        `Hi ${clientName}, this is a reminder to share your sales and purchase invoices ` +
        `for ${month} so we can file your GST return on time. ` +
        `Please send the documents on WhatsApp at the earliest. Due date: ${dueDate}.`
      );
    case "second":
      return (
        `Hi ${clientName}, we still haven't received your invoices for ${month}. ` +
        `Kindly share your documents soon to avoid a delay in filing. Due date: ${dueDate}.`
      );
    case "final":
      return (
        `Hi ${clientName}, this is a FINAL reminder — your GST documents for ${month} ` +
        `are still pending. The due date (${dueDate}) is very close. Please send your ` +
        `invoices immediately to avoid late filing.`
      );
  }
}

/** Builds a wa.me deep link that opens WhatsApp with the message pre-filled. */
export function buildWhatsAppLink(
  mobileNumber: string,
  key: ReminderKey,
  params: { clientName: string; month: string; dueDate: string }
): string {
  const digits = mobileNumber.replace(/\D/g, "");
  // Assume Indian numbers if no country code present (10 digits)
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  const message = buildMessage(key, params);
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

export function previewMessage(
  key: ReminderKey,
  params: { clientName: string; month: string; dueDate: string }
): string {
  return buildMessage(key, params);
}