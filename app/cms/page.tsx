"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  defaultPortfolioContent,
  hydratePortfolioContent,
  PortfolioContent,
} from "@/lib/portfolio-data";

import CmsProfileForm from "../components/cms/CmsProfileForm";
import ProjectsForm from "../components/cms/ProjectsForm";
import WorkExperiencesForm from "../components/cms/WorkExperiencesForm";

import { Button } from "@/components/ui/button";

export default function CmsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [formState, setFormState] =
    useState<PortfolioContent>(
      defaultPortfolioContent
    );

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(
        "/api/auth/check",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        router.push("/login");
        return;
      }

      await loadPortfolio();
    } catch {
      router.push("/login");
    }
  };

  const loadPortfolio = async () => {
    try {
      const response = await fetch(
        "/api/portfolio"
      );

      if (!response.ok)
        throw new Error();

      const data = await response.json();

      setFormState(
        hydratePortfolioContent(
          data.content
        )
      );
    } catch {
      setFormState(
        defaultPortfolioContent
      );
    } finally {
      setLoading(false);
    }
  };

  const savePortfolio = async () => {
    try {
      setSaving(true);
      setStatus("");

      const response = await fetch(
        "/api/portfolio",
        {
          method: "PUT",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            content: formState,
          }),
        }
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok)
        throw new Error();

      setStatus(
        "Portfolio saved successfully."
      );
    } catch {
      setStatus(
        "Failed to save portfolio."
      );
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
          Loading...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">

      {/* Header */}

      <div className="rounded-xl border bg-card p-8 shadow-sm">

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-4xl font-bold tracking-tight">
              Portfolio CMS
            </h1>

            <p className="mt-2 text-muted-foreground">
              Manage your personal portfolio information,
              projects and work experiences.
            </p>

          </div>

          <div className="flex gap-3">

            <Button
              asChild
              variant="outline"
            >
              <Link href="/">
                View Portfolio
              </Link>
            </Button>

            <Button
              variant="destructive"
              onClick={logout}
            >
              Logout
            </Button>

          </div>

        </div>

      </div>

      {/* Profile */}

      <CmsProfileForm
        value={formState}
        onChange={setFormState}
      />

      {/* Projects */}

      <ProjectsForm
        value={formState.projects}
        onChange={(projects) =>
          setFormState((prev) => ({
            ...prev,
            projects,
          }))
        }
      />

      {/* Experience */}

      <WorkExperiencesForm
        value={formState.workExperiences}
        onChange={(workExperiences) =>
          setFormState((prev) => ({
            ...prev,
            workExperiences,
          }))
        }
      />

      {/* Footer */}

      <div className="sticky bottom-5 z-50">

        <div className="flex items-center justify-between rounded-xl border bg-background/95 p-5 shadow-lg backdrop-blur">

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFormState(defaultPortfolioContent)
            }
          >
            Reset
          </Button>

          <div className="flex items-center gap-4">

            {status && (
              <p className="text-sm text-muted-foreground">
                {status}
              </p>
            )}

            <Button
              type="button"
              disabled={saving}
              onClick={savePortfolio}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </Button>

          </div>

        </div>

      </div>

    </main>
  );
}