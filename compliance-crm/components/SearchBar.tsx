export default function SearchBar({
  defaultValue,
  status,
}: {
  defaultValue: string;
  status: string;
}) {
  return (
    <form action="/dashboard" method="GET" className="flex gap-2">
      {status && <input type="hidden" name="status" value={status} />}
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search client name or GSTIN..."
        className="border border-rule rounded-md px-3 py-2 text-sm w-64 bg-white focus:outline-none focus:ring-2 focus:ring-gold/40"
      />
      <button
        type="submit"
        className="text-sm px-4 py-2 rounded-md border border-rule hover:bg-gold-soft transition"
      >
        Search
      </button>
    </form>
  );
}
