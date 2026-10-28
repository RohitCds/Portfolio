// Shared Logbook types and helpers (safe to import from server and client code)

export const LOG_KINDS = {
  "deep-dive": { label: "Deep dive", color: "#6ef2c8" },
  paper: { label: "Paper notes", color: "#a58bff" },
  notes: { label: "Study notes", color: "#5aa9ff" },
} as const;

export type LogKind = keyof typeof LOG_KINDS;

export type Attachment = {
  url: string;
  name: string;
  type: "image" | "pdf" | "file";
  size?: number;
};

export type LogEntryDTO = {
  id: number;
  number: number;
  slug: string;
  title: string;
  summary: string;
  kind: LogKind;
  tags: string[];
  body: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  attachments: Attachment[];
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// Slugs that would collide with the admin routes under /logbook
export const RESERVED_SLUGS = new Set(["edit", "new"]);

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const logNumber = (n: number) => `Log ${String(n).padStart(3, "0")}`;

export function readingMinutes(markdown: string) {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/[#>*_`~\-[\]()!|]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export const formatLogDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "Draft";

export function attachmentType(contentType: string, name: string): Attachment["type"] {
  if (contentType.startsWith("image/")) return "image";
  if (contentType === "application/pdf" || name.toLowerCase().endsWith(".pdf")) return "pdf";
  return "file";
}

export const isHttpUrl = (value: string) => {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

// Prisma row -> JSON-safe object for client components
export function toLogEntryDTO(row: {
  id: number;
  number: number;
  slug: string;
  title: string;
  summary: string;
  kind: string;
  tags: string[];
  body: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  attachments: unknown;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): LogEntryDTO {
  return {
    ...row,
    kind: (row.kind in LOG_KINDS ? row.kind : "deep-dive") as LogKind,
    attachments: Array.isArray(row.attachments) ? (row.attachments as Attachment[]) : [],
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
