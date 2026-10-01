"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";

import { BurnoutNavLink } from "@/components/route-burnout-loader";
import type { ManualChapter } from "@/lib/manual-content";

// Searchable manual with a table of contents; every section links to the screen it describes.
export function ManualBook({ title, intro, chapters }: { title: string; intro: string; chapters: ManualChapter[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!needle) return chapters;
    return chapters
      .map((chapter) => ({
        ...chapter,
        sections: chapter.sections.filter((section) => [section.title, section.what, section.when ?? "", ...(section.steps ?? []), ...(section.tips ?? [])].join(" ").toLowerCase().includes(needle))
      }))
      .filter((chapter) => chapter.sections.length);
  }, [chapters, needle]);

  return (
    <div className="manual-book">
      <div className="panel">
        <div className="panel-title">
          <div><p className="section-label">Job book</p><h2>{title}</h2></div>
          <BookOpen />
        </div>
        <p className="legal-note">{intro}</p>
        <label className="wide-field manual-search">
          <span><Search size={13} /> Search the manual</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. VIN, payment, torque, technician, receipt" />
        </label>
        {!needle ? (
          <nav className="manual-toc" aria-label="Contents">
            {chapters.map((chapter) => (
              <div key={chapter.id}>
                <a href={`#${chapter.id}`}><strong>{chapter.title}</strong></a>
                {chapter.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
              </div>
            ))}
          </nav>
        ) : null}
      </div>

      {visible.map((chapter) => (
        <section className="panel manual-chapter" id={chapter.id} key={chapter.id}>
          <h2>{chapter.title}</h2>
          {chapter.sections.map((section) => (
            <article className="manual-section" id={section.id} key={section.id}>
              <h3>{section.title}</h3>
              <p>{section.what}</p>
              {section.when ? <p><strong>When:</strong> {section.when}</p> : null}
              {section.steps?.length ? <ol>{section.steps.map((step) => <li key={step}>{step}</li>)}</ol> : null}
              {section.tips?.length ? <ul className="manual-tips">{section.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul> : null}
              {section.links?.length ? (
                <div className="research-link-row">
                  {section.links.map((link) => <BurnoutNavLink className="secondary-button" href={link.href} key={link.href + link.label}>{link.label}</BurnoutNavLink>)}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ))}
      {!visible.length ? <div className="panel"><p>Nothing in the manual matches &quot;{query}&quot;.</p></div> : null}
    </div>
  );
}
