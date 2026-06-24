"use client";

import { useState, useRef } from "react";
import { createClientWithCycle } from "@/app/dashboard/actions";

export default function AddClientForm() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await createClientWithCycle(formData);
      formRef.current?.reset();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add client.");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium bg-ink text-paper px-4 py-2 rounded-md hover:bg-ink/90 transition"
      >
        + Add Client
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="bg-paper-raised border border-rule rounded-lg p-4 flex flex-wrap items-end gap-3"
    >
      <div>
        <label className="block text-xs font-data uppercase text-ink-soft mb-1">
          Client Name
        </label>
        <input
          name="client_name"
          required
          className="border border-rule rounded-md px-3 py-2 text-sm w-48"
        />
      </div>
      <div>
        <label className="block text-xs font-data uppercase text-ink-soft mb-1">
          GSTIN
        </label>
        <input
          name="gstin"
          className="border border-rule rounded-md px-3 py-2 text-sm w-48 font-data"
        />
      </div>
      <div>
        <label className="block text-xs font-data uppercase text-ink-soft mb-1">
          Mobile Number
        </label>
        <input
          name="mobile_number"
          required
          className="border border-rule rounded-md px-3 py-2 text-sm w-40 font-data"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-medium bg-ink text-paper px-4 py-2 rounded-md hover:bg-ink/90 disabled:opacity-50"
      >
        {pending ? "Adding..." : "Save Client"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm px-3 py-2 rounded-md border border-rule hover:bg-paper"
      >
        Cancel
      </button>
      {error && <p className="text-sm text-[var(--overdue)] w-full">{error}</p>}
    </form>
  );
}
