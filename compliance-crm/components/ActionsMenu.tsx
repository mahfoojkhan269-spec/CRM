"use client";

import { useState, useRef, useEffect } from "react";
import { updateCycleStatus, addArnNumber } from "@/app/dashboard/actions";

const ACTIONS: { label: string; status: string }[] = [
  { label: "Mark Data Received", status: "Data Received" },
  { label: "Mark Under Processing", status: "Under Processing" },
  { label: "Mark Prepared", status: "Prepared" },
  { label: "Mark Filed", status: "Filed" },
  { label: "Close Cycle", status: "Closed" },
];

export default function ActionsMenu({ cycleId }: { cycleId: string }) {
  const [open, setOpen] = useState(false);
  const [arnOpen, setArnOpen] = useState(false);
  const [arnValue, setArnValue] = useState("");
  const [pending, setPending] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className="text-xs font-medium border border-rule rounded-md px-3 py-1.5 hover:bg-gold-soft transition disabled:opacity-50"
      >
        Actions ▾
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-52 bg-paper-raised border border-rule rounded-md shadow-md z-10 overflow-hidden">
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
        </div>
      )}

      {arnOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20">
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
        </div>
      )}
    </div>
  );
}
