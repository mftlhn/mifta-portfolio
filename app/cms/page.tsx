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
  const [formState, setFormState] = useState<CmsFormState>(defaultPortfolioContent);
  const [projectsJson, setProjectsJson] = useState(JSON.stringify(defaultPortfolioContent.projects, null, 2));
  const [workExperiencesJson, setWorkExperiencesJson] = useState(
    JSON.stringify(defaultPortfolioContent.workExperiences, null, 2)
  );
  const [cmsToken, setCmsToken] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user has valid session cookie
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          method: "GET",
          credentials: "include"
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated || isCheckingAuth) return;

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
  }, [isAuthenticated, isCheckingAuth]);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      router.push("/login");
    } catch {
      setStatusMessage("Failed to logout.");
    }
  };

  if (isCheckingAuth || !isAuthenticated) {
    return (
      <main className="container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

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
            <button onClick={handleLogout} className="logoutBtn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <form className="card cmsForm" onSubmit={handleSubmit}>
        <label htmlFor="cmsToken">CMS Access Token</label>
        <input
          id="cmsToken"
          type="password"
          value={cmsToken}
          onChange={(event) => setCmsToken(event.target.value)}
          placeholder="Enter your CMS token"
          required
        />

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
