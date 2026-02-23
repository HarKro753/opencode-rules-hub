"use client";

import Link from "next/link";
import type { RuleSetInfo } from "@/utils/api";

interface SetCardProps {
  set: RuleSetInfo;
  onDelete: (name: string) => void;
}

export function SetCard({ set, onDelete }: SetCardProps) {
  const lastModified = new Date(set.lastModified).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="card">
      <Link href={`/sets/${encodeURIComponent(set.name)}`}>
        <div className="card-title">{set.name}</div>
      </Link>
      <div className="card-meta">
        {set.ruleCount} rule{set.ruleCount !== 1 ? "s" : ""} &middot; Updated{" "}
        {lastModified}
      </div>
      <div className="card-actions">
        <Link href={`/sets/${encodeURIComponent(set.name)}/edit`}>
          <button className="btn-ghost">Edit</button>
        </Link>
        <button
          className="btn-danger"
          onClick={() => onDelete(set.name)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
