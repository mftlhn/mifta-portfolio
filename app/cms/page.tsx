"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  defaultPortfolioContent,
  hydratePortfolioContent,
  PortfolioContent
} from "@/lib/portfolio-data";

type CmsFormState = PortfolioContent;
type EditableTextField = "fullName" | "role" | "location" | "summary" | "skills" | "contactEmail";

export default function CmsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState<CmsFormState>(defaultPortfolioContent);
  const [projectsJson, setProjectsJson] = useState(JSON.stringify(defaultPortfolioContent.projects, null, 2));
  const [workExperiencesJson, setWorkExperiencesJson] = useState(
    JSON.stringify(defaultPortfolioContent.workExperiences, null, 2)
  );
  const [cmsToken, setCmsToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("cms_session_token");
    if (!sessionToken) {
      router.push("/cms/login");
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(false);

    const controller = new AbortController();

    fetch("/api/portfolio", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load content.");
        const data = (await response.json()) as { content?: Partial<PortfolioContent> };
        const hydrated = hydratePortfolioContent(data.content);
        setFormState(hydrated);
        setProjectsJson(JSON.stringify(hydrated.projects, null, 2));
        setWorkExperiencesJson(JSON.stringify(hydrated.workExperiences, null, 2));
      })
      .catch(() => {
        setFormState(defaultPortfolioContent);
        setProjectsJson(JSON.stringify(defaultPortfolioContent.projects, null, 2));
        setWorkExperiencesJson(JSON.stringify(defaultPortfolioContent.workExperiences, null, 2));
      });

    return () => controller.abort();
  }, [router]);

  const updateField = (key: EditableTextField, value: string) => {
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
    fetch("/api/portfolio", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-cms-token": cmsToken
      },
      body: JSON.stringify({ content: formState })
    })
      .then(async (response) => {
        if (response.status === 401) {
          setStatusMessage("Unauthorized. Please provide valid CMS token.");
          return;
        }
        if (!response.ok) {
          setStatusMessage("Failed to save content.");
          return;
        }

        setStatusMessage("Portfolio content saved successfully.");
      })
      .catch(() => setStatusMessage("Failed to save content."));
  };

  const handleReset = () => {
    setFormState(defaultPortfolioContent);
    setProjectsJson(JSON.stringify(defaultPortfolioContent.projects, null, 2));
    setWorkExperiencesJson(JSON.stringify(defaultPortfolioContent.workExperiences, null, 2));
    setStatusMessage("Form has been reset to default (not saved yet).");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("cms_session_token");
    router.push("/cms/login");
  };

  return (
    <main className="container cms">
      {isLoading && (
        <div className="loadingOverlay">
          <p>Loading...</p>
        </div>
      )}

      <header className="hero">
        <div>
          <p className="badge">CMS Page</p>
          <h1>Manage Portfolio</h1>
          <p className="summary">
            Update profile, skills, projects, work experience, and contact email for your portfolio page.
          </p>
          <div className="actions">
            <Link href="/">Back to Portfolio</Link>
            {isAuthenticated && (
              <button type="button" onClick={handleLogout} className="logoutButton">
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {isAuthenticated && !isLoading && (
        <>
      <form className="card cmsForm" onSubmit={handleSubmit}>
        <div className="tokenInputWrapper">
          <label htmlFor="cmsToken">CMS Access Token</label>
          <div className="tokenInputContainer">
            <input
              id="cmsToken"
              type={showToken ? "text" : "password"}
              value={cmsToken}
              onChange={(event) => setCmsToken(event.target.value)}
              placeholder="Enter your CMS token"
              required
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="toggleTokenButton"
              title={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? "Hide" : "Show"}
            </button>
          </div>
        </div>

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
        </>
      )}
    </main>
  );
}
