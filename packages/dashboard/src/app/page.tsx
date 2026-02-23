"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSets } from "@/hooks/useSets";
import { SetCard } from "@/components/SetCard";
import { CreateSetModal } from "@/components/CreateSetModal";
import { ApiKeyBar } from "@/components/ApiKeyBar";
import { deleteSetRequest, createSet } from "@/utils/api";

export default function HomePage() {
  const { sets, loading, error, reload } = useSets();
  const [showCreate, setShowCreate] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (name: string) => {
    const confirmed = window.confirm(
      `Delete rule set "${name}"? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setActionError(null);
    try {
      await deleteSetRequest(name);
      reload();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete set";
      setActionError(message);
    }
  };

  const handleCreate = async (name: string) => {
    setActionError(null);
    try {
      await createSet(name, `# ${name} Rules\n\n- Add your first rule here.\n`);
      setShowCreate(false);
      router.push(`/sets/${encodeURIComponent(name)}/edit`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create set";
      setActionError(message);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Rules Hub</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          New Set
        </button>
      </div>

      <ApiKeyBar />

      {actionError && <div className="error-message">{actionError}</div>}
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading rule sets...</div>
      ) : sets.length === 0 ? (
        <div className="loading">
          No rule sets found. Create your first one.
        </div>
      ) : (
        <div className="grid">
          {sets.map((set) => (
            <SetCard key={set.name} set={set} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateSetModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}


