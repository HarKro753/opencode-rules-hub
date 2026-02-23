"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRuleSet } from "@/hooks/useRuleSet";
import { useApiKey } from "@/hooks/useApiKey";
import { saveSet } from "@/utils/api";

interface EditPageProps {
  params: Promise<{ set: string }>;
}

export default function EditPage({ params }: EditPageProps) {
  const { set: setName } = use(params);
  const decodedName = decodeURIComponent(setName);
  const { content, loading, error: loadError } = useRuleSet(decodedName);
  const { apiKey } = useApiKey();
  const router = useRouter();

  const [editorContent, setEditorContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (content !== null) {
      setEditorContent(content);
    }
  }, [content]);

  const handleSave = async () => {
    if (!apiKey) {
      setSaveError("API key is required. Set it on the home page.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      await saveSet(decodedName, editorContent);
      router.push(`/sets/${setName}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save rule set";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link href="/">Rules Hub</Link> /{" "}
        <Link href={`/sets/${setName}`}>{decodedName}</Link> / Edit
      </div>

      <div className="header">
        <h1>Edit: {decodedName}</h1>
      </div>

      {loadError && <div className="error-message">{loadError}</div>}
      {saveError && <div className="error-message">{saveError}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <textarea
            className="editor-area"
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
          />
          <div className="actions-bar">
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <Link href={`/sets/${setName}`}>
              <button className="btn-ghost">Cancel</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}


