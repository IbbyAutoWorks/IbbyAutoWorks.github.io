"use client";

import { useState } from "react";
import { Save, SlidersHorizontal, Wrench } from "lucide-react";

const defaultFlow = ["Accept job", "En route", "Walkaround", "Pre-inspect", "Parts", "Start job", "Finish job", "Billing"];

export function ServiceSettings() {
  const [steps, setSteps] = useState(defaultFlow);
  const [saved, setSaved] = useState(false);

  function updateStep(index: number, value: string) {
    setSteps((current) => current.map((step, stepIndex) => stepIndex === index ? value : step));
    setSaved(false);
  }

  return (
    <div className="settings-workspace service-settings-page">
      <section className="admin-header">
        <div>
          <p className="section-label">Service settings</p>
          <h1>Edit service flow, technician operations, and field workflow labels.</h1>
        </div>
        <button className="primary-button" onClick={() => setSaved(true)}><Save size={16} /> Save service draft</button>
      </section>
      <section className="settings-stack">
        <details className="panel settings-accordion" open>
          <summary><span><SlidersHorizontal size={16} /> Service flow steps</span><Wrench size={16} /></summary>
          <p className="legal-note">This is the editable service-ops surface. Next pass can wire these labels into the live service wizard and Supabase business settings.</p>
          <div className="settings-fields">
            {steps.map((step, index) => (
              <label key={index}><span>Step {index + 1}</span><input value={step} onChange={(event) => updateStep(index, event.target.value)} /></label>
            ))}
          </div>
          {saved ? <p className="legal-note">Service settings draft saved for this prototype session.</p> : null}
        </details>
        <div className="panel">
          <div className="panel-title"><div><p className="section-label">Support links</p><h2>Issues and feature requests stay available here.</h2></div><Wrench /></div>
          <p className="legal-note">Use the footer links below for service portal bugs and service-flow requests.</p>
        </div>
      </section>
    </div>
  );
}
