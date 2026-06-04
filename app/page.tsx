"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  defaultPortfolioContent,
  PortfolioContent
} from "@/lib/portfolio-data";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// lucide-react
import {
  MapPin,
  Mail,
  ExternalLink,
  Send,
  ChevronDown,
  GitBranch
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

export default function PortfolioPage() {
  const [content, setContent] = useState<PortfolioContent>(defaultPortfolioContent);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [contactStatus, setContactStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/portfolio", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to fetch portfolio.");
        const data = (await response.json()) as { content?: PortfolioContent };
        setContent(data.content ?? defaultPortfolioContent);
      })
      .catch(() => setContent(defaultPortfolioContent));
    return () => controller.abort();
  }, []);

  function AutoCarousel({ images }: { images: string[] }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
      if (images.length <= 1) return;
      const interval = setInterval(() => {
        setCurrent(prev => (prev + 1) % images.length);
      }, 3000); // ganti angka ini untuk kecepatan slide (ms)
      return () => clearInterval(interval);
    }, [images.length]);

    return (
      <div style={{ position: "relative", width: "100%", height: 180, overflow: "hidden" }}>
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`project-image-${idx}`}
            style={{
              position: "absolute",
              top: 0, left: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              opacity: idx === current ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
            }}
          />
        ))}
        {/* Dot indicator */}
        {images.length > 1 && (
          <div style={{
            position: "absolute", bottom: 8, left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: 5
          }}>
            {images.map((_, idx) => (
              <div key={idx} style={{
                width: idx === current ? 16 : 6,
                height: 6,
                borderRadius: 999,
                background: idx === current ? "#fff" : "rgba(255,255,255,0.5)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ===== SCROLL REVEAL for experience items =====
  useEffect(() => {
    // Run once items exist in DOM — poll briefly after content loads
    let observer: IntersectionObserver | null = null;

    const attach = () => {
      const items = Array.from(
        document.querySelectorAll<HTMLElement>(".experienceItem")
      );
      if (items.length === 0) return false;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );

      items.forEach((el) => observer!.observe(el));
      return true;
    };

    // Try immediately, then retry up to 10x every 150ms (handles async data load)
    if (!attach()) {
      let tries = 0;
      const interval = setInterval(() => {
        tries++;
        if (attach() || tries >= 10) clearInterval(interval);
      }, 150);
      return () => clearInterval(interval);
    }

    return () => observer?.disconnect();
  }, [content.workExperiences]);


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    setContactStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) throw new Error();

      setContactStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setContactStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
        :root {
          --saw-yellow: #F5A623;
          --saw-yellow-dark: #D4881A;
          --saw-teal: #4FC3B0;
          --saw-teal-dark: #2FA899;
          --saw-pink: #FF8FAB;
          --saw-pink-dark: #E06080;
          --saw-dark: #1A1A2E;
          --saw-ink: #111111;
          --saw-shadow: 5px 5px 0px var(--saw-ink);
          --saw-shadow-hover: 7px 7px 0px var(--saw-ink);
          --saw-shadow-sm: 3px 3px 0px var(--saw-ink);
        }

        .saw-card {
          background: #fff;
          border: 2.5px solid var(--saw-ink);
          border-radius: 16px;
          box-shadow: var(--saw-shadow);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .saw-card:hover {
          transform: translate(-2px, -2px);
          box-shadow: var(--saw-shadow-hover);
        }

        .saw-badge {
          display: inline-block;
          border: 2px solid var(--saw-ink);
          border-radius: 999px;
          padding: 4px 14px;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 2px 2px 0 var(--saw-ink);
          background: #fff;
          color: var(--saw-ink);
        }

        .saw-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 22px;
          border: 2.5px solid var(--saw-ink);
          border-radius: 12px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          box-shadow: var(--saw-shadow-sm);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
          text-decoration: none;
        }
        .saw-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 5px 5px 0 var(--saw-ink);
        }
        .saw-btn:active {
          transform: translate(1px, 1px);
          box-shadow: 2px 2px 0 var(--saw-ink);
        }
        .saw-btn-yellow { background: var(--saw-yellow); color: var(--saw-ink); }
        .saw-btn-teal   { background: var(--saw-teal);   color: var(--saw-ink); }
        .saw-btn-pink   { background: var(--saw-pink);   color: var(--saw-ink); }
        .saw-btn-white  { background: #fff;              color: var(--saw-ink); }

        .saw-input {
          width: 100%;
          padding: 10px 14px;
          border: 2.5px solid var(--saw-ink);
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          background: #fff;
          box-shadow: 3px 3px 0 var(--saw-ink);
          outline: none;
          transition: box-shadow 0.12s;
          box-sizing: border-box;
        }
        .saw-input:focus {
          box-shadow: 5px 5px 0 var(--saw-yellow);
        }

        .saw-section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--saw-ink);
          color: #fff;
          font-weight: 800;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 6px 16px;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .project-card {
          background: #fff;
          border: 2.5px solid var(--saw-ink);
          border-radius: 16px;
          box-shadow: var(--saw-shadow);
          display: flex;
          flex-direction: column;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          overflow: hidden;
        }
        .project-card:hover {
          transform: translate(-3px, -3px);
          box-shadow: 8px 8px 0px var(--saw-ink);
        }

        .exp-card {
          background: #fff;
          border: 2.5px solid var(--saw-ink);
          border-radius: 16px;
          box-shadow: var(--saw-shadow);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          padding: 22px 24px;
        }
        .exp-card:hover {
          transform: translate(-3px, -3px);
          box-shadow: 8px 8px 0px var(--saw-ink);
        }

        /* ---- Timeline wrapper ---- */
        .timeline {
          position: relative;
          max-width: 860px;
          margin: 0 auto;
        }

        /* Vertical line — left on mobile, center on desktop */
        .timeline::before {
          content: "";
          position: absolute;
          top: 0; bottom: 0;
          left: 18px;
          width: 3px;
          background: var(--saw-ink);
          border-radius: 4px;
        }

        /* Each row — hidden by default, revealed by JS observer */
        .experienceItem {
          position: relative;
          display: flex;
          justify-content: flex-end;
          padding-left: 52px;
          padding-right: 12px;
          margin-bottom: 32px;
          width: 100%;
          box-sizing: border-box;
          /* slide-from direction set per class below */
          opacity: 0;
          transition: opacity 0.55s ease, transform 0.55s ease;
          transition-delay: var(--reveal-delay, 0ms);
        }

        /* Mobile & default: slide up */
        .experienceItem { transform: translateY(32px); }

        /* Desktop left items: slide in from left */
        @media (min-width: 768px) {
          .experienceItem.left  { transform: translateX(-48px); }
          .experienceItem.right { transform: translateX( 48px); }
        }

        .experienceItem.visible {
          opacity: 1;
          transform: translate(0, 0);
        }

        /* Dot on the line */
        .timeline-dot {
          position: absolute;
          left: 10px;
          top: 22px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--saw-teal);
          border: 3px solid var(--saw-ink);
          box-shadow: 2px 2px 0 var(--saw-ink);
          z-index: 1;
          flex-shrink: 0;
        }

        /* Card takes full width on mobile */
        .exp-card-wrap {
          width: 100%;
        }

        /* ---- Desktop: zigzag ---- */
        @media (min-width: 768px) {
          .timeline::before {
            left: 50%;
            transform: translateX(-50%);
          }

          /* Even items → card on the LEFT */
          .experienceItem.left {
            justify-content: flex-start;
            padding-left: 12px;
            padding-right: calc(50% + 32px);
          }
          .experienceItem.left .timeline-dot {
            left: auto;
            right: calc(50% - 9px);
          }
          .experienceItem.left .exp-card-wrap {
            width: 100%;
          }

          /* Odd items → card on the RIGHT */
          .experienceItem.right {
            justify-content: flex-end;
            padding-left: calc(50% + 32px);
            padding-right: 12px;
          }
          .experienceItem.right .timeline-dot {
            left: calc(50% - 9px);
          }
          .experienceItem.right .exp-card-wrap {
            width: 100%;
          }
        }

        .hero-bg {
          background: #FFF8F0;
          border-bottom: 3px solid var(--saw-ink);
        }

        /* Hero card responsive */
        .hero-card {
          padding: 36px 40px;
          display: flex;
          flex-wrap: nowrap;
          flex-direction: row;
          gap: 36px;
          align-items: center;
        }
        .hero-img-outer {
          flex-shrink: 0;
          width: 260px;
        }
        .hero-img-wrap {
          width: 260px;
          height: 360px;
          border-radius: 20px;
          border: 3px solid var(--saw-ink);
          box-shadow: 5px 5px 0 var(--saw-ink);
          overflow: hidden;
          background: #eee;
        }
        @media (max-width: 640px) {
          .hero-card {
            padding: 24px 20px;
            gap: 20px;
            flex-direction: column;
          }
          .hero-img-outer {
            width: 100%;
          }
          .hero-img-wrap {
            width: 100%;
            height: 280px;
          }
        }

        .scroll-bounce {
          animation: bounce 1.5s infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(8px); }
        }
      `}</style>

      <main style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#FAFAF8", color: "#111", minHeight: "100vh" }}>

        {/* ===== HERO ===== */}
        <header className="hero-bg" style={{ padding: "60px 24px 48px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div className="saw-card hero-card">

              {/* Avatar */}
              <div className="hero-img-outer">
                <div className="hero-img-wrap">
                  <Image
                    src="/assets/profile.jpg"
                    alt={`Foto profil ${content.fullName}`}
                    width={260} height={360}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    priority
                  />
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 4px", lineHeight: 1.1 }}>
                  {content.fullName}
                </h1>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#555", margin: "0 0 6px" }}>
                  {content.role}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#777", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                  <MapPin size={14} />
                  {content.location}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "#444", marginBottom: 16, maxWidth: 480 }}>
                  {content.summary}
                </p>

                {/* Skills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                  {content.skills.map((skill, i) => (
                    <span key={skill} className="saw-badge" style={{
                      background: i % 3 === 0 ? "var(--saw-yellow)" : i % 3 === 1 ? "var(--saw-teal)" : "var(--saw-pink)"
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <a href="#projects" className="saw-btn saw-btn-yellow" onClick={(e) => handleNavClick(e, "projects")}>
                    View Projects →
                  </a>
                  <a href="#contact" className="saw-btn saw-btn-teal" onClick={(e) => handleNavClick(e, "contact")}>
                    <Mail size={16} /> Send Email
                  </a>
                </div>
              </div>
            </div>

            {/* scroll indicator */}
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <span className="scroll-bounce" style={{ display: "inline-block", fontSize: 28 }}>↓</span>
            </div>
          </div>
        </header>

        {/* ===== PROJECTS ===== */}
        <section id="projects" style={{ padding: "64px 24px", background: "#FFF8F0" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ marginBottom: 32 }}>
              <span className="saw-section-label">Projects</span>
              <h2 style={{ fontSize: 30, fontWeight: 900, margin: "4px 0 0" }}>What I've built</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
              {/* {content.projects.map((project, i) => {
                const accentBgs = ["#FFF0D6", "#E0F7F4", "#FFE8EF"];
                const accentBorders = ["var(--saw-yellow)", "var(--saw-teal)", "var(--saw-pink)"];
                const accent = accentBorders[i % 3];
                const accentBg = accentBgs[i % 3];
                return (
                  <div key={project.name} className="project-card">
                    <div style={{ height: 10, background: accent }} />
                    <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>{project.name}</h3>
                      <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, flex: 1, marginBottom: 14 }}>
                        {project.description}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                        {project.stack.map((tech) => (
                          <span key={tech} style={{
                            fontSize: 12, fontWeight: 700,
                            background: accentBg,
                            border: `1.5px solid ${accent}`,
                            borderRadius: 6, padding: "2px 10px",
                            color: "#111"
                          }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        {project.demoUrl && (
                          <a href={project.demoUrl} target="_blank" rel="noreferrer"
                            className="saw-btn saw-btn-yellow"
                            style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "8px 12px" }}>
                            <ExternalLink size={13} /> Demo
                          </a>
                        )}
                        {project.repoUrl && (
                          <a href={project.repoUrl} target="_blank" rel="noreferrer"
                            className="saw-btn saw-btn-white"
                            style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "8px 12px" }}>
                            <FaGithub size={13} /> Repo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })} */}
              {content.projects.map((project, i) => {
                const accentBgs = ["#FFF0D6", "#E0F7F4", "#FFE8EF"];
                const accentBorders = ["var(--saw-yellow)", "var(--saw-teal)", "var(--saw-pink)"];
                const accent = accentBorders[i % 3];
                const accentBg = accentBgs[i % 3];

                return (
                  <div key={project.name} className="project-card">
                    {/* Auto Carousel */}
                    {project.imageUrls && project.imageUrls.length > 0 && (
                      <AutoCarousel images={project.imageUrls} />
                    )}

                    {/* colored top strip */}
                    <div style={{ height: 10, background: accent }} />
                    <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>{project.name}</h3>
                      <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, flex: 1, marginBottom: 14 }}>
                        {project.description}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                        {project.stack.map((tech) => (
                          <span key={tech} style={{
                            fontSize: 12, fontWeight: 700,
                            background: accentBg,
                            border: `1.5px solid ${accent}`,
                            borderRadius: 6, padding: "2px 10px",
                            color: "#111"
                          }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== WORK EXPERIENCE ===== */}
        <section id="experience" style={{ padding: "64px 24px", background: "#E8FAF7" }}>
          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            <div style={{ marginBottom: 40, textAlign: "center" }}>
              <span className="saw-section-label">Work Experience</span>
              <h2 style={{ fontSize: 30, fontWeight: 900, margin: "8px 0 0" }}>Where I've worked</h2>
            </div>

            <div className="timeline">
              {(content.workExperiences ?? []).map((experience, index) => (
                <div
                  key={`${experience.companyName}-${experience.yearRange}`}
                  className={`experienceItem ${index % 2 === 0 ? "left" : "right"}`}
                  style={{ "--reveal-delay": `${index * 130}ms` } as CSSProperties}
                >
                  {/* Dot */}
                  <span className="timeline-dot" aria-hidden="true" />

                  {/* Card */}
                  <div className="exp-card-wrap">
                    <div className="exp-card">
                      {/* Year badge */}
                      <div style={{ marginBottom: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 800,
                          background: "var(--saw-teal)",
                          border: "2px solid var(--saw-ink)",
                          borderRadius: 7, padding: "3px 12px",
                          color: "#111", boxShadow: "2px 2px 0 var(--saw-ink)",
                          display: "inline-block"
                        }}>
                          {experience.yearRange}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 900, margin: "0 0 3px" }}>
                        {experience.position}
                      </h3>
                      <p style={{ fontSize: 13, fontWeight: 800, color: "#666", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {experience.companyName}
                      </p>
                      <div style={{ fontSize: 14, color: "#444", lineHeight: 1.65, margin: 0 }}>
                        {experience.jobdesk.split("\n").map((line, i) => {
                          const trimmed = line.trim();
                          if (!trimmed) return null;

                          const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
                          if (numberedMatch) {
                            return (
                              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, paddingLeft: 16 }}>
                                <span style={{ fontWeight: 700, minWidth: 18 }}>{numberedMatch[1]}.</span>
                                <span>{numberedMatch[2]}</span>
                              </div>
                            );
                          }

                          const bulletMatch = trimmed.match(/^[-•]\s+(.+)/);
                          if (bulletMatch) {
                            return (
                              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontWeight: 700 }}>–</span>
                                <span>{bulletMatch[1]}</span>
                              </div>
                            );
                          }

                          return (
                            <div key={i} style={{ marginBottom: 6 }}>
                              <span>{trimmed}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CONTACT ===== */}
        <section id="contact" style={{ padding: "64px 24px", background: "#FFF0F5" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span className="saw-section-label">Contact</span>
              <h2 style={{ fontSize: 30, fontWeight: 900, margin: "4px 0 8px" }}>Hubungi saya!</h2>
              <p style={{ color: "#666", fontSize: 15 }}>
                Isi form di bawah. Saya akan segera membalas pesanmu!
              </p>
            </div>

            <div className="saw-card" style={{ padding: "32px 28px" }}>
              {/* Success state */}
              {contactStatus === "success" && (
                <div style={{
                  textAlign: "center", padding: "32px 20px",
                  background: "#E8FAF7", border: "2px solid var(--saw-teal)",
                  borderRadius: 12, boxShadow: "3px 3px 0 var(--saw-teal)"
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px" }}>Pesan Terkirim!</h3>
                  <p style={{ color: "#555", fontSize: 14, marginBottom: 20 }}>
                    Terima kasih sudah menghubungi. Saya akan segera membalas!
                  </p>
                  <button
                    onClick={() => setContactStatus("idle")}
                    className="saw-btn saw-btn-teal"
                    style={{ fontSize: 14, padding: "8px 20px" }}
                  >
                    Kirim Pesan Lagi
                  </button>
                </div>
              )}

              {/* Form */}
              {contactStatus !== "success" && (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
                      Nama
                    </label>
                    <input
                      className="saw-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama lengkap kamu"
                      required
                      disabled={isSending}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
                      Email
                    </label>
                    <input
                      className="saw-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@kamu.com"
                      required
                      disabled={isSending}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
                      Pesan
                    </label>
                    <textarea
                      className="saw-input"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tulis pesanmu di sini..."
                      required
                      disabled={isSending}
                      style={{ resize: "vertical" }}
                    />
                  </div>

                  {/* Error alert */}
                  {contactStatus === "error" && (
                    <div style={{
                      padding: "10px 14px", background: "#FFE8EF",
                      border: "2px solid var(--saw-pink)", borderRadius: 8,
                      fontSize: 13, fontWeight: 700, color: "#c0003c",
                      boxShadow: "2px 2px 0 var(--saw-pink)"
                    }}>
                      ❌ Gagal mengirim pesan. Coba lagi beberapa saat.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="saw-btn saw-btn-pink"
                    disabled={isSending}
                    style={{
                      justifyContent: "center", fontSize: 16, padding: "12px 20px",
                      opacity: isSending ? 0.7 : 1,
                      cursor: isSending ? "not-allowed" : "pointer"
                    }}
                  >
                    {isSending ? (
                      <>
                        <span style={{
                          display: "inline-block", width: 16, height: 16,
                          border: "2.5px solid #111", borderTopColor: "transparent",
                          borderRadius: "50%", animation: "spin 0.7s linear infinite"
                        }} />
                        Mengirim...
                      </>
                    ) : (
                      <><Send size={16} /> Kirim Pesan</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer style={{
          borderTop: "3px solid var(--saw-ink)",
          background: "var(--saw-ink)",
          color: "#fff",
          textAlign: "center",
          padding: "20px",
          fontWeight: 700,
          fontSize: 14
        }}>
          © {new Date().getFullYear()} {content.fullName}. All rights reserved.
        </footer>
      </main>
    </>
  );
}