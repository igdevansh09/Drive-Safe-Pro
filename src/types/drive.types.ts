import { TelemetryEvent } from "../services/EventDetector";

export interface DriveSessionSummary {
  id: string;
  startTime: number;
  endTime: number;
  totalScore: number;
  eventCount: number;
  events: TelemetryEvent[];
  formattedDate: string;
}
