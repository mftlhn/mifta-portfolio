"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  defaultPortfolioContent,
  hydratePortfolioContent,
  LOCAL_STORAGE_KEY,
  PortfolioContent
} from "@/lib/portfolio-data";

export default function PortfolioPage() {
  const [content, setContent] = useState<PortfolioContent>(defaultPortfolioContent);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const rawContent = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!rawContent) return;

    try {
      const parsed = JSON.parse(rawContent) as Partial<PortfolioContent>;
      setContent(hydratePortfolioContent(parsed));
    } catch {
      setContent(defaultPortfolioContent);
    }
  }, []);

  const mailtoLink = useMemo(() => {
    const subject = encodeURIComponent(`Portfolio Inquiry from ${name || "Visitor"}`);
    const body = encodeURIComponent(
      `Name: ${name || "-"}\nEmail: ${email || "-"}\n\nMessage:\n${message || "-"}`
    );
    return `mailto:${content.contactEmail}?subject=${subject}&body=${body}`;
  }, [content.contactEmail, email, message, name]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    window.location.href = mailtoLink;
  };

  return (
    <main className="container">
      <header className="hero">
        <div className="heroCard">
          <div className="heroImageWrap">
            <Image
              src="/assets/profile.jpg"
              alt={`Foto profil ${content.fullName}`}
              width={220}
              height={220}
              className="heroImage"
              priority
            />
          </div>
          <div className="heroContent">
            <h1>{content.fullName}</h1>
            <p className="subtitle">{content.role}</p>
            <p className="meta">{content.location}</p>
            <p className="summary">{content.summary}</p>
            <ul className="skills">
              {content.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
            <div className="actions">
              <a href="#projects">View Projects</a>
              <a href="#contact">Send Email</a>
            </div>
          </div>
        </div>
      </header>

      <section className="section" id="projects">
        <h2>Projects</h2>
        <div className="grid projectGrid">
          {content.projects.map((project) => (
            <article key={project.name} className="card portfolioCard projectCard">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <p className="stack">{project.stack.join(" • ")}</p>
              <div className="projectActions">
                <a href={project.demoUrl} target="_blank" rel="noreferrer">
                  Live Demo
                </a>
                <a href={project.repoUrl} target="_blank" rel="noreferrer">
                  Repository
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="experience">
        <h2>Work Experience</h2>
        <div className="grid experienceGrid">
          {(content.workExperiences ?? []).map((experience) => (
            <article key={`${experience.companyName}-${experience.yearRange}`} className="card portfolioCard experienceCard">
              <h3>{experience.companyName}</h3>
              <p className="stack">
                {experience.position} • {experience.yearRange}
              </p>
              <p>{experience.jobdesk}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="contact">
        <h2>Send Email</h2>
        <form className="card portfolioCard contactCard contactForm" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(event) => setName(event.target.value)} required />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
          />

          <button type="submit">Send Email</button>
        </form>
      </section>
    </main>
  );
}
