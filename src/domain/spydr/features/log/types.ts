import type { LucideIcon } from "lucide-react";
import type { ProjectNode } from "@/domain/spydr/utils/types";

export type LogSortMode = "recent" | "ranked";

export type MetaPart =
  | {
      kind: "project";
      id: string;
      title: string;
    }
  | {
      kind: "status";
      status: string;
      label: string;
      color: string;
    }
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "edited";
      label: string;
    };

export interface LogPrimaryAction<T> {
  label: string;
  icon: LucideIcon;
  onRun: (item: T) => void;
}

export interface LogCaptureTargets {
  projects: ProjectNode[];
  /** Defaults to last used project. */
  projectId: string;
  onProjectChange: (projectId: string) => void;
}

export interface LogConfig<T extends { id: string }> {
  primary: (item: T) => string;
  /** Only a real, user-set title — never auto-generated. */
  title?: (item: T) => string | null;
  /** Optional muted secondary (e.g. decision rationale), clamped. */
  secondary?: (item: T) => string | null;
  secondaryLines?: number;
  meta: (item: T) => MetaPart[];
  primaryAction: LogPrimaryAction<T>;
  captureTargets: LogCaptureTargets;
  rankable: boolean;
  capturePlaceholder: string;
  emptyMessage: string;
  /** Singular/plural noun for counts ("note" / "notes"). */
  noun: string;
  nounSingular: string;
  getTimestamp: (item: T) => string;
  getCreatedAt: (item: T) => string;
  getUpdatedAt: (item: T) => string;
  getProjectId?: (item: T) => string | null;
  onCapture: (text: string, projectId: string) => Promise<void>;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  deletingId?: string | null;
}
