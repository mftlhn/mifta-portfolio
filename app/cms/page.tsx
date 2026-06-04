"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  defaultPortfolioContent,
  hydratePortfolioContent,
  PortfolioContent
} from "@/lib/portfolio-data";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

// lucide-react icons
import {
  ArrowLeft,
  LogOut,
  Plus,
  Trash2,
  Save,
  User,
  Briefcase,
  FolderGit2,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";

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
  const [skillsRaw, setSkillsRaw] = useState(defaultPortfolioContent.skills.join(", "));
  const [projects, setProjects] = useState(defaultPortfolioContent.projects);
  const [workExperiences, setWorkExperiences] = useState(
    defaultPortfolioContent.workExperiences
  );
  const [imageUrlsRaw, setImageUrlsRaw] = useState<Record<number, string>>({});
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // ===== AUTH CHECK =====
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check", { credentials: "include" });
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
      // .then(data => {
      //   const hydrated = hydratePortfolioContent(data.content);
      //   setFormState(hydrated);
      //   setSkillsRaw((hydrated.skills || []).join(", "));
      //   setProjects(hydrated.projects || []);
      //   setWorkExperiences(hydrated.workExperiences || []);
      // })
      .then(data => {
        const hydrated = hydratePortfolioContent(data.content);
        setFormState(hydrated);
        setSkillsRaw((hydrated.skills || []).join(", "));
        setProjects(hydrated.projects || []);
        setWorkExperiences(hydrated.workExperiences || []);

        // reset imageUrlsRaw
        const rawMap: Record<number, string> = {};
        (hydrated.projects || []).forEach((p, i) => {
          rawMap[i] = (p.imageUrls ?? []).join(", ");
        });
        setImageUrlsRaw(rawMap);
      })
      .catch(() => {
        setFormState(defaultPortfolioContent);
      });
  }, [isAuthenticated, isCheckingAuth]);

  // ===== FIELD UPDATE =====
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
      { name: "", description: "", stack: [], demoUrl: "", repoUrl: "" }
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
                  : key === "imageUrls"
                  ? value.split(/[,;]/).map(s => s.trim()).filter(Boolean) // ← split koma atau titik koma
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
    setStatusMessage(null);

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
      setStatusMessage({ type: "success", text: "Portfolio saved successfully!" });
    } catch {
      setStatusMessage({ type: "error", text: "Gagal menyimpan data. Silakan coba lagi." });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  // ===== LOADING STATE =====
  if (isCheckingAuth || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/30">
        {/* ===== HEADER ===== */}
        <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs font-semibold tracking-wider uppercase">
                CMS
              </Badge>
              <h1 className="text-xl font-semibold text-foreground">
                Manage Portfolio
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* ===== MAIN FORM ===== */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ===== PROFILE SECTION ===== */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-primary/10">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Profile Information</CardTitle>
                    <CardDescription className="text-sm">
                      Your personal details and professional summary.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formState.fullName}
                      onChange={e => updateField("fullName", e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role / Title</Label>
                    <Input
                      id="role"
                      value={formState.role}
                      onChange={e => updateField("role", e.target.value)}
                      placeholder="e.g. Fullstack Developer"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formState.location}
                      onChange={e => updateField("location", e.target.value)}
                      placeholder="e.g. Jakarta, Indonesia"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formState.contactEmail}
                      onChange={e => updateField("contactEmail", e.target.value)}
                      placeholder="e.g. johndoe@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={formState.summary}
                    onChange={e => updateField("summary", e.target.value)}
                    placeholder="Write a short bio or professional summary..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pisahkan setiap keahlian dengan tanda koma</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="skills"
                    value={skillsRaw}
                    onChange={e => setSkillsRaw(e.target.value)}
                    onBlur={e => updateField("skills", e.target.value)}
                    placeholder="e.g. React, Next.js, Node.js, TypeScript"
                  />
                  {formState.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formState.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ===== PROJECTS SECTION ===== */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10">
                      <FolderGit2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Projects</CardTitle>
                      <CardDescription className="text-sm">
                        {projects.length} project{projects.length !== 1 ? "s" : ""} listed
                      </CardDescription>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addProject}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                    <FolderGit2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No projects yet. Click "Add Project" to get started.</p>
                  </div>
                )}
                {projects.map((p, i) => (
                  <Card key={i} className="border border-border/60 shadow-none bg-muted/20">
                    <CardHeader className="pb-3 pt-4 px-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          Project #{i + 1}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(i)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 pb-4">
                      <div className="space-y-2">
                        <Label>Project Title</Label>
                        <Input
                          value={p.name}
                          onChange={e => updateProject(i, "name", e.target.value)}
                          placeholder="e.g. E-Commerce Platform"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={p.description}
                          onChange={e => updateProject(i, "description", e.target.value)}
                          placeholder="Describe what this project is about..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>Tech Stack</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Pisahkan dengan tanda koma</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          value={p.stack.join(", ")}
                          onChange={e => updateProject(i, "stack", e.target.value)}
                          placeholder="e.g. Next.js, TailwindCSS, Supabase"
                        />
                        {p.stack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {p.stack.map((tech, j) => (
                              <Badge key={j} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>Image URLs</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Satu URL per baris. Gunakan Cloudinary atau link gambar langsung.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Textarea
                          value={(p.imageUrls ?? []).join("\n")}
                          onChange={e =>
                            updateProject(i, "imageUrls", e.target.value)
                          }
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.stopPropagation(); // mencegah form submit
                            }
                          }}
                          placeholder={"https://res.cloudinary.com/...\nhttps://res.cloudinary.com/..."}
                          rows={4}
                        />
                        {(p.imageUrls ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {(p.imageUrls ?? []).map((url, j) => (
                              <img
                                key={j}
                                src={url}
                                alt={`preview-${j}`}
                                style={{
                                  width: 64, height: 48,
                                  objectFit: "cover",
                                  borderRadius: 6,
                                  border: "1.5px solid #e2e8f0"
                                }}
                                onError={e => (e.currentTarget.style.display = "none")}
                              />
                            ))}
                          </div>
                        )}
                      </div> */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>Image URLs</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Pisahkan setiap URL dengan koma atau titik koma</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Textarea
                          value={imageUrlsRaw[i] ?? (p.imageUrls ?? []).join(", ")}
                          onChange={e => {
                            setImageUrlsRaw(prev => ({ ...prev, [i]: e.target.value }));
                          }}
                          onBlur={e => {
                            updateProject(i, "imageUrls", e.target.value);
                          }}
                          placeholder="https://res.cloudinary.com/..., https://res.cloudinary.com/..."
                          rows={3}
                        />
                        {(p.imageUrls ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {(p.imageUrls ?? []).map((url, j) => (
                              <img
                                key={j}
                                src={url}
                                alt={`preview-${j}`}
                                style={{
                                  width: 64, height: 48,
                                  objectFit: "cover",
                                  borderRadius: 6,
                                  border: "1.5px solid #e2e8f0"
                                }}
                                onError={e => (e.currentTarget.style.display = "none")}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Demo URL</Label>
                          <Input
                            value={p.demoUrl}
                            onChange={e => updateProject(i, "demoUrl", e.target.value)}
                            placeholder="https://example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Repository URL</Label>
                          <Input
                            value={p.repoUrl}
                            onChange={e => updateProject(i, "repoUrl", e.target.value)}
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* ===== WORK EXPERIENCE SECTION ===== */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Work Experiences</CardTitle>
                      <CardDescription className="text-sm">
                        {workExperiences.length} experience{workExperiences.length !== 1 ? "s" : ""} listed
                      </CardDescription>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addWork}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {workExperiences.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No experience yet. Click "Add Experience" to get started.</p>
                  </div>
                )}
                {workExperiences.map((w, i) => (
                  <Card key={i} className="border border-border/60 shadow-none bg-muted/20">
                    <CardHeader className="pb-3 pt-4 px-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          Experience #{i + 1}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWork(i)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Company Name</Label>
                          <Input
                            value={w.companyName}
                            onChange={e => updateWork(i, "companyName", e.target.value)}
                            placeholder="e.g. PT. Teknologi Maju"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year Range</Label>
                          <Input
                            value={w.yearRange}
                            onChange={e => updateWork(i, "yearRange", e.target.value)}
                            placeholder="e.g. 2022 - Present"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Input
                          value={w.position}
                          onChange={e => updateWork(i, "position", e.target.value)}
                          placeholder="e.g. Senior Frontend Engineer"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Job Desk / Responsibilities</Label>
                        <Textarea
                          value={w.jobdesk}
                          onChange={e => updateWork(i, "jobdesk", e.target.value)}
                          placeholder="List your key contributions and responsibilities..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* ===== SUBMIT + STATUS ===== */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-8">
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>

              {statusMessage && (
                <Alert
                  variant={statusMessage.type === "error" ? "destructive" : "default"}
                  className="flex-1 py-2"
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription className="ml-2">
                    {statusMessage.text}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </form>
        </main>
      </div>
    </TooltipProvider>
  );
}