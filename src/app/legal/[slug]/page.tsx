import { notFound } from "next/navigation";

import { AppShell } from "@/components/chrome";
import { LegalText } from "@/components/legal-text";
import { legalDocument, legalDocuments } from "@/lib/legal-documents";

export function generateStaticParams() {
  return legalDocuments.map((doc) => ({ slug: doc.slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = legalDocument(slug);
  if (!doc) notFound();
  return (
    <AppShell active="home">
      <div className="manual-book">
        <article className="panel legal-page">
          <p className="section-label">{doc.kind === "policy" ? "Policy" : "Agreement"}</p>
          <h1>{doc.title}</h1>
          <LegalText text={doc.text} />
        </article>
      </div>
    </AppShell>
  );
}
