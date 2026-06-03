export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export const formatDuration = (startMs: number, endMs: number): string => {
  const diffMs = Math.max(0, endMs - startMs);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

export const getSafetyRating = (
  score: number,
): { grade: string; statusKey: "excellent" | "good" | "fair" | "poor" } => {
  if (score >= 90) return { grade: "Excellent (A)", statusKey: "excellent" };
  if (score >= 80) return { grade: "Good (B)", statusKey: "good" };
  if (score >= 70) return { grade: "Fair (C)", statusKey: "fair" };
  return { grade: "Poor (D/F)", statusKey: "poor" };
};