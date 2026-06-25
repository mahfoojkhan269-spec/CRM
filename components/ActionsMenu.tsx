"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { updateCycleStatus, addArnNumber, logManualReminder } from "@/app/dashboard/actions";
import {
  REMINDER_TEMPLATES,
  buildWhatsAppLink,
  previewMessage,
  type ReminderKey,
} from "@/lib/whatsapp";

const ACTIONS: { label: string; status: string }[] = [
  { label: "Mark Data Received", status: "Data Received" },
  { label: "Mark Under Processing", status: "Under Processing" },
  { label: "Mark Prepared", status: "Prepared" },
  { label: "Mark Filed", status: "Filed" },
  { label: "Close Cycle", status: "Closed" },
];

type ActionsMenuProps = {
  cycleId: string;
  clientId: string;
  clientName: string;
  mobileNumber: string;
  month: string;
  dueDate: string;
};

export default function ActionsMenu({
  cycleId,
  clientId,
  clientName,
  mobileNumber,
  month,
  dueDate,
}: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [arnOpen, setArnOpen] = useState(false);
  const [arnValue, setArnValue] = useState("");
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderKey, setReminderKey] = useState<ReminderKey>("first");
  const [pending, setPending] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function computePosition() {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 208; // w-52
    let left = rect.right - menuWidth;
    if (left < 8) left = 8;
    setMenuPos({ top: rect.bottom + 4, left });
  }

  function toggleOpen() {
    if (!open) computePosition();
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleReposition() {
      computePosition();
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  async function handleStatus(status: string) {
    setPending(true);
    try {
      await updateCycleStatus(cycleId, status as never);
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  async function handleArnSubmit() {
    setPending(true);
    try {
      await addArnNumber(cycleId, arnValue);
      setArnOpen(false);
      setArnValue("");
    } finally {
      setPending(false);
    }
  }

  async function handleSendReminder() {
    setPending(true);
    try {
      const link = buildWhatsAppLink(mobileNumber, reminderKey, {
        clientName,
        month,
        dueDate,
      });
      const templateLabel =
        REMINDER_TEMPLATES.find((t) => t.key === reminderKey)?.label ?? "Reminder";
      await logManualReminder(clientId, month, templateLabel);
      window.open(link, "_blank");
      setReminderOpen(false);
    } finally {
      setPending(false);
    }
  }

  const preview = previewMessage(reminderKey, { clientName, month, dueDate });

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        disabled={pending}
        className="text-xs font-medium border border-rule rounded-md px-3 py-1.5 hover:bg-gold-soft transition disabled:opacity-50"
      >
        Actions ▾
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}
            className="w-52 bg-paper-raised border border-rule rounded-md shadow-lg z-50 overflow-hidden"
          >
            <button
              onClick={() => {
                setReminderOpen(true);
                setOpen(false);
              }}
              className="block w-full text-left text-sm px-3 py-2 hover:bg-gold-soft transition font-medium"
            >
              Send Reminder
            </button>
            <div className="border-t border-rule" />
            {ACTIONS.map((a) => (
              <button
                key={a.status}
                onClick={() => handleStatus(a.status)}
                className="block w-full text-left text-sm px-3 py-2 hover:bg-gold-soft transition"
              >
                {a.label}
              </button>
            ))}
            <button
              onClick={() => {
                setArnOpen(true);
                setOpen(false);
              }}
              className="block w-full text-left text-sm px-3 py-2 hover:bg-gold-soft transition border-t border-rule"
            >
              Add ARN
            </button>
          </div>,
          document.body
        )}

      {arnOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-paper-raised border border-rule rounded-lg p-6 w-80">
              <h3 className="font-display text-lg mb-3">Add ARN Number</h3>
              <input
                autoFocus
                value={arnValue}
                onChange={(e) => setArnValue(e.target.value)}
                placeholder="e.g. AA0706240012345"
                className="w-full border border-rule rounded-md px-3 py-2 font-data text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setArnOpen(false)}
                  className="text-sm px-3 py-1.5 rounded-md border border-rule hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArnSubmit}
                  disabled={pending || !arnValue.trim()}
                  className="text-sm px-3 py-1.5 rounded-md bg-ink text-paper hover:bg-ink/90 disabled:opacity-50"
                >
                  Save & Mark ARN Shared
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {reminderOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-paper-raised border border-rule rounded-lg p-6 w-full max-w-md">
              <h3 className="font-display text-lg mb-1">Send WhatsApp Reminder</h3>
              <p className="text-xs text-ink-soft mb-4">
                To {clientName} · {mobileNumber}
              </p>

              <label className="block text-xs font-data uppercase text-ink-soft mb-2">
                Template
              </label>
              <div className="flex gap-2 mb-4">
                {REMINDER_TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setReminderKey(t.key)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                      reminderKey === t.key
                        ? "bg-ink text-paper border-ink"
                        : "border-rule text-ink-soft hover:bg-gold-soft"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <label className="block text-xs font-data uppercase text-ink-soft mb-2">
                Message Preview
              </label>
              <div className="bg-paper border border-rule rounded-md p-3 text-sm mb-4 whitespace-pre-wrap">
                {preview}
              </div>

              <p className="text-xs text-ink-soft mb-4">
                This opens WhatsApp with the message ready — you&apos;ll still need to hit
                Send there yourself.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setReminderOpen(false)}
                  className="text-sm px-3 py-1.5 rounded-md border border-rule hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={pending}
                  className="text-sm px-3 py-1.5 rounded-md bg-ink text-paper hover:bg-ink/90 disabled:opacity-50"
                >
                  {pending ? "Opening..." : "Open in WhatsApp"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}