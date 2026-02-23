"use client";

import { use } from "react";
import Link from "next/link";
import { useRuleSet } from "@/hooks/useRuleSet";

interface SetPageProps {
  params: Promise<{ set: string }>;
}

export default function SetPage({ params }: SetPageProps) {
  const { set: setName } = use(params);
  const decodedName = decodeURIComponent(setName);
  const { content, loading, error } = useRuleSet(decodedName);

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link href="/">Rules Hub</Link> / {decodedName}
      </div>

      <div className="header">
        <h1>{decodedName}</h1>
        <Link href={`/sets/${setName}/edit`}>
          <button className="btn-primary">Edit</button>
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <pre className="markdown-content">{content}</pre>
      )}
    </div>
  );
}


