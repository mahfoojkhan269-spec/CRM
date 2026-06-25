"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatMonthLabel, formatFinancialYear, dueDateForMonth } from "@/lib/months";

const VALID_STATUSES = [
  "Pending Data",
  "Data Received",
  "Under Processing",
  "Prepared",
  "Filed",
  "ARN Shared",
  "Closed",
] as const;

type Status = (typeof VALID_STATUSES)[number];

export async function updateCycleStatus(cycleId: string, status: Status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid status.");
  }
  const { error } = await supabaseAdmin
    .from("compliance_cycles")
    .update({ status })
    .eq("id", cycleId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function addArnNumber(cycleId: string, arnNumber: string) {
  if (!arnNumber.trim()) {
    throw new Error("ARN number is required.");
  }
  const { error } = await supabaseAdmin
    .from("compliance_cycles")
    .update({ arn_number: arnNumber.trim(), status: "ARN Shared" })
    .eq("id", cycleId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function createClientWithCycle(formData: FormData) {
  const clientName = String(formData.get("client_name") || "").trim();
  const gstin = String(formData.get("gstin") || "").trim();
  const mobileNumber = String(formData.get("mobile_number") || "").trim();

  if (!clientName || !mobileNumber) {
    throw new Error("Client name and mobile number are required.");
  }

  const { data: client, error: clientError } = await supabaseAdmin
    .from("clients")
    .insert({
      client_name: clientName,
      gstin: gstin || null,
      mobile_number: mobileNumber,
    })
    .select()
    .single();

  if (clientError) throw new Error(clientError.message);

  const now = new Date();
  const { error: cycleError } = await supabaseAdmin.from("compliance_cycles").insert({
    client_id: client.id,
    month: formatMonthLabel(now),
    financial_year: formatFinancialYear(now),
    due_date: dueDateForMonth(now),
    status: "Pending Data",
  });

  if (cycleError) throw new Error(cycleError.message);

  revalidatePath("/dashboard");
}

/**
 * Logs a manually-triggered WhatsApp reminder for audit-trail purposes.
 * The actual message is sent by staff clicking through a wa.me deep link
 * (see ActionsMenu) - this just records that it happened. Once the
 * Meta WhatsApp Cloud API is wired up (Priority 4), this same table will
 * also receive the message_id and delivery status automatically.
 */
export async function logManualReminder(
  clientId: string,
  month: string,
  reminderLabel: string
) {
  const { error } = await supabaseAdmin.from("notifications").insert({
    client_id: clientId,
    month,
    reminder_type: "Manual Reminder",
    delivered: false,
    message_id: null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");

  // reminderLabel is accepted for clarity in call sites/logging but the
  // notifications table intentionally stores a constant "Manual Reminder"
  // type so the partial unique index never blocks repeat manual sends.
  void reminderLabel;
}