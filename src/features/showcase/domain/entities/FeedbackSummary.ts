import { ProjectFeedback } from "./ProjectFeedback";

// Los promedios de la retroalimentacion de un prototipo: el `FeedbackSummary`
// de `feedback_summary.dart`. Cada promedio va redondeado a un decimal, y el
// general es el promedio de los cuatro ya redondeados.
export type FeedbackSummary = {
  usabilityAverage: number;
  innovationAverage: number;
  visualDesignAverage: number;
  feasibilityAverage: number;
  overallAverage: number;
  totalCount: number;
};

const roundOneDecimal = (value: number) => Math.round(value * 10) / 10;

export function summarizeFeedback(feedbacks: ProjectFeedback[]): FeedbackSummary {
  const count = feedbacks.length;
  if (count === 0) {
    return {
      usabilityAverage: 0,
      innovationAverage: 0,
      visualDesignAverage: 0,
      feasibilityAverage: 0,
      overallAverage: 0,
      totalCount: 0,
    };
  }
  const average = (pick: (f: ProjectFeedback) => number) =>
    roundOneDecimal(feedbacks.reduce((sum, f) => sum + pick(f), 0) / count);
  const usability = average((f) => f.usability);
  const innovation = average((f) => f.innovation);
  const visualDesign = average((f) => f.visualDesign);
  const feasibility = average((f) => f.feasibility);
  return {
    usabilityAverage: usability,
    innovationAverage: innovation,
    visualDesignAverage: visualDesign,
    feasibilityAverage: feasibility,
    overallAverage: roundOneDecimal((usability + innovation + visualDesign + feasibility) / 4),
    totalCount: count,
  };
}

export const isEmptySummary = (s: FeedbackSummary) => s.totalCount === 0;
