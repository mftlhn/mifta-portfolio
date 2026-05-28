"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  defaultPortfolioContent,
  hydratePortfolioContent,
  LOCAL_STORAGE_KEY,
  PortfolioContent
} from "@/lib/portfolio-data";

type CmsFormState = PortfolioContent;

export default function CmsPage() {
  const [formState, setFormState] = useState<CmsFormState>(defaultPortfolioContent);
  const [projectsJson, setProjectsJson] = useState(JSON.stringify(defaultPortfolioContent.projects, null, 2));
  const [workExperiencesJson, setWorkExperiencesJson] = useState(
    JSON.stringify(defaultPortfolioContent.workExperiences, null, 2)
  );
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const rawContent = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!rawContent) return;

    try {
      const parsed = JSON.parse(rawContent) as Partial<PortfolioContent>;
      const hydrated = hydratePortfolioContent(parsed);
      setFormState(hydrated);
      setProjectsJson(JSON.stringify(hydrated.projects, null, 2));
      setWorkExperiencesJson(JSON.stringify(hydrated.workExperiences, null, 2));
    } catch {
      setFormState(defaultPortfolioContent);
      setProjectsJson(JSON.stringify(defaultPortfolioContent.projects, null, 2));
      setWorkExperiencesJson(JSON.stringify(defaultPortfolioContent.workExperiences, null, 2));
    }
  }, []);

  const updateField = (key: keyof PortfolioContent, value: string) => {
    if (key === "skills") {
      setFormState((prev) => ({ ...prev, skills: value.split(",").map((skill) => skill.trim()).filter(Boolean) }));
      return;
    }
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const updateProjects = (rawText: string) => {
    try {
      const parsed = JSON.parse(rawText) as PortfolioContent["projects"];
      setFormState((prev) => ({ ...prev, projects: parsed }));
      setStatusMessage("Project format is valid.");
    } catch {
      setStatusMessage("Invalid project format (use a JSON array).");
    }
  };

  const updateWorkExperiences = (rawText: string) => {
    try {
      const parsed = JSON.parse(rawText) as PortfolioContent["workExperiences"];
      setFormState((prev) => ({ ...prev, workExperiences: parsed }));
      setStatusMessage("Work experience format is valid.");
    } catch {
      setStatusMessage("Invalid work experience format (use a JSON array).");
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formState));
    setStatusMessage("Portfolio content saved successfully.");
  };

  const handleReset = () => {
    setFormState(defaultPortfolioContent);
    setProjectsJson(JSON.stringify(defaultPortfolioContent.projects, null, 2));
    setWorkExperiencesJson(JSON.stringify(defaultPortfolioContent.workExperiences, null, 2));
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultPortfolioContent));
    setStatusMessage("Content has been reset to default.");
  };

  return (
    <main className="container cms">
      <header className="hero">
        <div>
          <p className="badge">CMS Page</p>
          <h1>Manage Portfolio</h1>
          <p className="summary">
            Update profile, skills, projects, work experience, and contact email for your portfolio page.
          </p>
          <div className="actions">
            <Link href="/">Back to Portfolio</Link>
          </div>
        </div>
      </header>

      <form className="card cmsForm" onSubmit={handleSubmit}>
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          value={formState.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          required
        />

        <label htmlFor="role">Role</label>
        <input id="role" value={formState.role} onChange={(event) => updateField("role", event.target.value)} required />

        <label htmlFor="location">Location</label>
        <input
          id="location"
          value={formState.location}
          onChange={(event) => updateField("location", event.target.value)}
          required
        />

        <label htmlFor="summary">Profile Summary</label>
        <textarea
          id="summary"
          rows={4}
          value={formState.summary}
          onChange={(event) => updateField("summary", event.target.value)}
          required
        />

        <label htmlFor="skills">Skills (comma separated)</label>
        <input
          id="skills"
          value={formState.skills.join(", ")}
          onChange={(event) => updateField("skills", event.target.value)}
          required
        />

        <label htmlFor="contactEmail">Contact Email</label>
        <input
          id="contactEmail"
          type="email"
          value={formState.contactEmail}
          onChange={(event) => updateField("contactEmail", event.target.value)}
          required
        />

        <label htmlFor="projects">Projects (JSON Array)</label>
        <textarea
          id="projects"
          rows={12}
          value={projectsJson}
          onChange={(event) => setProjectsJson(event.target.value)}
          onBlur={(event) => updateProjects(event.target.value)}
        />

        <label htmlFor="workExperiences">Work Experience (JSON Array)</label>
        <textarea
          id="workExperiences"
          rows={10}
          value={workExperiencesJson}
          onChange={(event) => setWorkExperiencesJson(event.target.value)}
          onBlur={(event) => updateWorkExperiences(event.target.value)}
        />

        <div className="cmsActions">
          <button type="submit">Save Changes</button>
          <button type="button" onClick={handleReset}>
            Reset to Default
          </button>
        </div>

        <p className="statusText">{statusMessage}</p>
      </form>
    </main>
  );
}
