"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { triggerIngest } from "./actions";
import type { ManifestEntry, RunStatus, IngestResult } from "./actions";

const SPORT_LABELS: Record<string, string> = {
  nba: "NBA",
  nfl: "NFL",
  mlb: "MLB",
  fifa: "FIFA",
};

function StatusBadge({ run }: { run: RunStatus | undefined }) {
  if (!run) {
    return <span className="ingest-status ingest-status--none">Not ingested</span>;
  }
  if (run.status === "running") {
    return <span className="ingest-status ingest-status--running">Running…</span>;
  }
  if (run.status === "succeeded") {
    const date = run.completedAt
      ? new Date(run.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "";
    return (
      <span className="ingest-status ingest-status--ok">
        ✓ {run.chunksCreated?.toLocaleString()} chunks · {date}
      </span>
    );
  }
  return (
    <span className="ingest-status ingest-status--fail" title={run.errorMessage ?? undefined}>
      ✗ Failed
    </span>
  );
}

function IngestRow({
  entry,
  run,
}: {
  entry: ManifestEntry;
  run: RunStatus | undefined;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleIngest = () => {
    startTransition(async () => {
      const result: IngestResult = await triggerIngest(entry);
      if (!result.ok) {
        console.error("Ingest failed:", result.error);
      }
      router.refresh();
    });
  };

  const isRunning = isPending || run?.status === "running";

  return (
    <tr>
      <td>
        <span className="admin-badge">{SPORT_LABELS[entry.sport] ?? entry.sport.toUpperCase()}</span>
      </td>
      <td>{entry.season}</td>
      <td className="ingest-title">{entry.title}</td>
      <td className="ingest-pages">{entry.pages}p</td>
      <td>
        <StatusBadge run={run} />
      </td>
      <td>
        <button
          onClick={handleIngest}
          disabled={isRunning}
          className={clsx("ingest-btn", isRunning && "ingest-btn--loading")}
        >
          {isPending ? (
            <span className="ingest-spinner" aria-hidden />
          ) : null}
          {isPending ? "Ingesting…" : run?.status === "succeeded" ? "Re-ingest" : "Ingest"}
        </button>
      </td>
    </tr>
  );
}

export function IngestBoard({
  entries,
  statuses,
}: {
  entries: ManifestEntry[];
  statuses: Record<string, RunStatus>;
}) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Sport</th>
          <th>Season</th>
          <th>Title</th>
          <th>Size</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <IngestRow
            key={`${entry.sport}::${entry.season}`}
            entry={entry}
            run={statuses[`${entry.sport}::${entry.season}`]}
          />
        ))}
      </tbody>
    </table>
  );
}
