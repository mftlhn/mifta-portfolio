"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  defaultPortfolioContent,
  hydratePortfolioContent,
  PortfolioContent
} from "@/lib/portfolio-data";

type CmsFormState = PortfolioContent;

type EditableTextField =
  | "fullName"
  | "role"
  | "location"
  | "summary"
  | "skills"
  | "contactEmail";

export default function CmsPage() {
  const [formState, setFormState] =
    useState<CmsFormState>(defaultPortfolioContent);

  const [projects, setProjects] = useState(defaultPortfolioContent.projects);
  const [workExperiences, setWorkExperiences] = useState(
    defaultPortfolioContent.workExperiences
  );

  const [statusMessage, setStatusMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // ===== AUTH CHECK =====
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check", {
          credentials: "include"
        });
        if (!res.ok) throw new Error();
        setIsAuthenticated(true);
      } catch {
        router.push("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  // ===== LOAD DATA =====
  useEffect(() => {
    if (!isAuthenticated || isCheckingAuth) return;

    fetch("/api/portfolio")
      .then(res => res.json())
      .then(data => {
        const hydrated = hydratePortfolioContent(data.content);
        setFormState(hydrated);
        setProjects(hydrated.projects || []);
        setWorkExperiences(hydrated.workExperiences || []);
      })
      .catch(() => {
        setFormState(defaultPortfolioContent);
      });
  }, [isAuthenticated, isCheckingAuth]);

  // ===== BASIC FIELD UPDATE =====
  const updateField = (key: EditableTextField, value: string) => {
    if (key === "skills") {
      setFormState(prev => ({
        ...prev,
        skills: value.split(",").map(s => s.trim()).filter(Boolean)
      }));
      return;
    }
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  // ===== PROJECTS =====
  const addProject = () => {
    setProjects(prev => [
      ...prev,
      {
        name: "", 
        description: "",
        stack: [],
        demoUrl: "",
        repoUrl: ""
      }
    ]);
  };

  const updateProject = (i: number, key: string, value: string) => {
    setProjects(prev =>
      prev.map((p, idx) =>
        idx === i
          ? {
              ...p,
              [key]:
                key === "stack"
                  ? value.split(",").map(s => s.trim()).filter(Boolean)
                  : value
            }
          : p
      )
    );
  };

  const removeProject = (i: number) => {
    setProjects(prev => prev.filter((_, idx) => idx !== i));
  };

  // ===== WORK EXPERIENCES =====
  const addWork = () => {
    setWorkExperiences(prev => [
      ...prev,
      { companyName: "", yearRange: "", position: "", jobdesk: "" }
    ]);
  };

  const updateWork = (i: number, key: string, value: string) => {
    setWorkExperiences(prev =>
      prev.map((w, idx) => (idx === i ? { ...w, [key]: value } : w))
    );
  };

  const removeWork = (i: number) => {
    setWorkExperiences(prev => prev.filter((_, idx) => idx !== i));
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: PortfolioContent = {
        ...formState,
        projects,
        workExperiences
      };

      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: payload })
      });

      if (!res.ok) throw new Error();
      setStatusMessage("✅ Portfolio saved successfully");
    } catch {
      setStatusMessage("❌ Gagal menyimpan data");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    router.push("/login");
  };

  if (isCheckingAuth || !isAuthenticated) {
    return <p style={{ padding: 40, textAlign: "center" }}>Loading...</p>;
  }

  return (
    <main className="container cms">
      <header className="hero">
        <p className="badge">CMS</p>
        <h1>Manage Portfolio</h1>
        <div className="actions">
          <Link href="/">Back</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <form className="card cmsForm" onSubmit={handleSubmit}>
        {/* === Profile Section === */}
        <div className="form-section">
          <h3>Profile Information</h3>
          
          <label>
            <span className="label-text">Full Name</span>
            <input
              value={formState.fullName}
              onChange={e => updateField("fullName", e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </label>

          <label>
            <span className="label-text">Role / Title</span>
            <input
              value={formState.role}
              onChange={e => updateField("role", e.target.value)}
              placeholder="e.g. Fullstack Developer"
              required
            />
          </label>

          <label>
            <span className="label-text">Location</span>
            <input
              value={formState.location}
              onChange={e => updateField("location", e.target.value)}
              placeholder="e.g. Jakarta, Indonesia"
              required
            />
          </label>

          <label>
            <span className="label-text">Professional Summary</span>
            <textarea
              value={formState.summary}
              onChange={e => updateField("summary", e.target.value)}
              placeholder="Write a short bio or professional summary..."
              rows={4}
            />
          </label>

          <label>
            <span className="label-text">Skills</span>
            <input
              value={formState.skills.join(", ")}
              onChange={e => updateField("skills", e.target.value)}
              placeholder="e.g. React, Next.js, Node.js, TypeScript"
            />
            <small className="helper-text">
              💡 Pisahkan setiap keahlian dengan tanda koma (contoh: Python, Django, Docker).
            </small>
          </label>

          <label>
            <span className="label-text">Contact Email</span>
            <input
              type="email"
              value={formState.contactEmail}
              onChange={e => updateField("contactEmail", e.target.value)}
              placeholder="e.g. johndoe@example.com"
            />
          </label>
        </div>

        <hr />

        {/* === Projects Section === */}
        <div className="form-section">
          <div className="section-header">
            <h3>Projects</h3>
            <button type="button" className="btn-add" onClick={addProject}>
              + Add Project
            </button>
          </div>
          
          <div className="items-grid">
            {projects.map((p, i) => (
              <div key={i} className="box card-item">
                <div className="item-header">
                  <h4>Project #{i + 1}</h4>
                  <button type="button" className="btn-remove" onClick={() => removeProject(i)}>
                    Remove
                  </button>
                </div>
                
                <label>
                  <span className="label-text">Project Title</span>
                  <input
                    value={p.name}
                    onChange={e => updateProject(i, "name", e.target.value)}
                    placeholder="e.g. E-Commerce Platform"
                  />
                </label>

                <label>
                  <span className="label-text">Description</span>
                  <textarea
                    value={p.description}
                    onChange={e => updateProject(i, "description", e.target.value)}
                    placeholder="Describe what this project is about..."
                    rows={3}
                  />
                </label>

                <label>
                  <span className="label-text">Tech Stack</span>
                  <input
                    value={p.stack.join(", ")}
                    onChange={e => updateProject(i, "stack", e.target.value)}
                    placeholder="e.g. Next.js, TailwindCSS, Supabase"
                  />
                  <small className="helper-text">💡 Pisahkan dengan tanda koma.</small>
                </label>

                <div className="input-group">
                  <label>
                    <span className="label-text">Demo URL</span>
                    <input
                      value={p.demoUrl}
                      onChange={e => updateProject(i, "demoUrl", e.target.value)}
                      placeholder="https://example.com"
                    />
                  </label>
                  <label>
                    <span className="label-text">Repository URL</span>
                    <input
                      value={p.repoUrl}
                      onChange={e => updateProject(i, "repoUrl", e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr />

        {/* === Work Experience Section === */}
        <div className="form-section">
          <div className="section-header">
            <h3>Work Experiences</h3>
            <button type="button" className="btn-add" onClick={addWork}>
              + Add Experience
            </button>
          </div>

          <div className="items-grid">
            {workExperiences.map((w, i) => (
              <div key={i} className="box card-item">
                <div className="item-header">
                  <h4>Experience #{i + 1}</h4>
                  <button type="button" className="btn-remove" onClick={() => removeWork(i)}>
                    Remove
                  </button>
                </div>

                <div className="input-group">
                  <label>
                    <span className="label-text">Company Name</span>
                    <input
                      value={w.companyName}
                      onChange={e => updateWork(i, "companyName", e.target.value)}
                      placeholder="e.g. PT. Teknologi Maju"
                    />
                  </label>
                  <label>
                    <span className="label-text">Year Range</span>
                    <input
                      value={w.yearRange}
                      onChange={e => updateWork(i, "yearRange", e.target.value)}
                      placeholder="e.g. 2022 - Present"
                    />
                  </label>
                </div>

                <label>
                  <span className="label-text">Position</span>
                  <input
                    value={w.position}
                    onChange={e => updateWork(i, "position", e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </label>

                <label>
                  <span className="label-text">Job Desk / Responsibilities</span>
                  <textarea
                    value={w.jobdesk}
                    onChange={e => updateWork(i, "jobdesk", e.target.value)}
                    placeholder="List your key contributions and responsibilities..."
                    rows={3}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">Save Changes</button>
          {statusMessage && <p className="status-text">{statusMessage}</p>}
        </div>
      </form>
    </main>
  );
}