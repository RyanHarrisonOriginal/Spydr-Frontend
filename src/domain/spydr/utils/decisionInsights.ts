import type { DecisionNode } from "@/domain/spydr/utils/types";
import { parseCalendarDate } from "@/domain/spydr/utils/dateOnly";

const RECENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export interface DecisionInsights {
  total: number;
  highImpact: number;
  recentCount: number;
  projectCount: number;
  missingRationale: number;
  latestDecidedAt: string | null;
}

function decisionTimestamp(decision: DecisionNode): number {
  const value = decision.details?.decidedAt ?? decision.updatedAt;
  return parseCalendarDate(value)?.getTime() ?? new Date(value).getTime();
}

function hasRationale(decision: DecisionNode): boolean {
  const rationale = decision.details?.rationale?.trim() || decision.body?.trim();
  return Boolean(rationale);
}

export function buildDecisionInsights(decisions: DecisionNode[]): DecisionInsights {
  const now = Date.now();
  const projectIds = new Set<string>();
  let highImpact = 0;
  let recentCount = 0;
  let missingRationale = 0;
  let latestDecidedAt: string | null = null;
  let latestTimestamp = -1;

  for (const decision of decisions) {
    const impact = decision.details?.impact ?? "medium";
    if (impact === "high") highImpact += 1;
    if (!hasRationale(decision)) missingRationale += 1;

    if (decision.project?.id) {
      projectIds.add(decision.project.id);
    }

    const decidedAt = decision.details?.decidedAt ?? decision.updatedAt;
    const timestamp = decisionTimestamp(decision);
    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
      latestDecidedAt = decidedAt;
    }

    if (now - timestamp <= RECENT_WINDOW_MS) {
      recentCount += 1;
    }
  }

  return {
    total: decisions.length,
    highImpact,
    recentCount,
    projectCount: projectIds.size,
    missingRationale,
    latestDecidedAt,
  };
}

export function formatDecisionHeaderMeta(insights: DecisionInsights): string {
  const parts = [`${insights.total} recorded`];

  if (insights.projectCount > 0) {
    parts.push(
      `across ${insights.projectCount} ${insights.projectCount === 1 ? "project" : "projects"}`
    );
  }

  if (insights.highImpact > 0) {
    parts.push(`${insights.highImpact} high impact`);
  }

  return parts.join(" · ");
}
