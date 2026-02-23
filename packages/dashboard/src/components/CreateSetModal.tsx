"use client";

import { useState } from "react";

interface CreateSetModalProps {
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreateSetModal({ onClose, onCreate }: CreateSetModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onCreate(trimmed);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New Rule Set</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="e.g. company-conventions"
            value={name}
            onChange={(e) => setName(e.target.value)}
            pattern="^[a-zA-Z0-9_-]+$"
            title="Alphanumeric characters, hyphens, and underscores only"
            autoFocus
            required
          />
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
