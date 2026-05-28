export type ProjectItem = {
  name: string;
  description: string;
  stack: string[];
  demoUrl: string;
  repoUrl: string;
};

export type WorkExperienceItem = {
  companyName: string;
  yearRange: string;
  position: string;
  jobdesk: string;
};

export type PortfolioContent = {
  fullName: string;
  role: string;
  location: string;
  summary: string;
  skills: string[];
  contactEmail: string;
  projects: ProjectItem[];
  workExperiences: WorkExperienceItem[];
};

export const LOCAL_STORAGE_KEY = "portfolioContent";

export const defaultPortfolioContent: PortfolioContent = {
  fullName: "Nama Anda",
  role: "Fullstack Web Developer",
  location: "Indonesia",
  summary:
    "Saya adalah fullstack web developer yang berfokus membangun produk web modern, scalable, dan user-friendly dari sisi frontend maupun backend.",
  skills: ["PHP", "JavaScript", "Dart", "Flutter", "Laravel", "React.js", "Next.js"],
  contactEmail: "your-email@example.com",
  projects: [
    {
      name: "Sistem Manajemen Toko Online",
      description:
        "Aplikasi manajemen produk, pesanan, dan laporan penjualan untuk bisnis retail skala menengah.",
      stack: ["Laravel", "MySQL", "React.js"],
      demoUrl: "https://example.com",
      repoUrl: "https://github.com/username/project-1"
    },
    {
      name: "Dashboard Analytics Performa Marketing",
      description:
        "Dashboard interaktif untuk memantau metrik campaign dan menghasilkan insight secara real-time.",
      stack: ["Next.js", "TypeScript", "PostgreSQL"],
      demoUrl: "https://example.com",
      repoUrl: "https://github.com/username/project-2"
    },
    {
      name: "Aplikasi Mobile Booking Service",
      description:
        "Aplikasi mobile cross-platform dengan sistem booking, notifikasi, dan riwayat transaksi.",
      stack: ["Flutter", "Dart", "Laravel API"],
      demoUrl: "https://example.com",
      repoUrl: "https://github.com/username/project-3"
    }
  ],
  workExperiences: [
    {
      companyName: "PT Digital Inovasi Nusantara",
      yearRange: "2022 - Sekarang",
      position: "Senior Fullstack Web Developer",
      jobdesk:
        "Membangun dan maintain aplikasi web end-to-end menggunakan Laravel dan Next.js, termasuk perancangan API, integrasi payment gateway, serta optimasi performa aplikasi."
    },
    {
      companyName: "CV Solusi Teknologi Kreatif",
      yearRange: "2020 - 2022",
      position: "Fullstack Developer",
      jobdesk:
        "Mengembangkan dashboard admin, fitur manajemen user, dan sistem laporan berbasis data untuk kebutuhan operasional internal dan klien."
    }
  ]
};

export function hydratePortfolioContent(input: Partial<PortfolioContent> | null | undefined): PortfolioContent {
  if (!input) return defaultPortfolioContent;

  return {
    ...defaultPortfolioContent,
    ...input,
    skills: Array.isArray(input.skills) ? input.skills : defaultPortfolioContent.skills,
    projects: Array.isArray(input.projects) ? input.projects : defaultPortfolioContent.projects,
    workExperiences: Array.isArray(input.workExperiences)
      ? input.workExperiences
      : defaultPortfolioContent.workExperiences
  };
}
