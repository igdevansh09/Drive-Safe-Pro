export type TelemetryEventType = "AGGRESSIVE_MOVEMENT" | "sharp_turn";

export interface TelemetryEvent {
  type: TelemetryEventType;
  gForce: number;
  timestamp: number;
}

export class EventDetector {
  private readonly thresholdG: number;
  private readonly requiredConsecutiveTicks: number;
  private readonly cooldownMs: number;
  private lastEventTime: number = 0;

  constructor(
    thresholdG = 0.3,
    requiredConsecutiveTicks = 5,
    cooldownMs = 3000,
  ) {
    this.thresholdG = thresholdG;
    this.requiredConsecutiveTicks = requiredConsecutiveTicks;
    this.cooldownMs = cooldownMs;
  }

  public analyzeWindow(buffer: number[]): TelemetryEvent | null {
    const now = Date.now();

    if (now - this.lastEventTime < this.cooldownMs) {
      return null;
    }

    let consecutiveCount = 0;
    let peakGForce = 0;
    for (let i = 0; i < buffer.length; i++) {
      const gForce = buffer[i];

      if (gForce >= this.thresholdG) {
        consecutiveCount++;
        if (gForce > peakGForce) {
          peakGForce = gForce;
        }

        if (consecutiveCount >= this.requiredConsecutiveTicks) {
          this.lastEventTime = now;
          return {
            type: "AGGRESSIVE_MOVEMENT",
            gForce: peakGForce,
            timestamp: now,
          };
        }
      } else {
        consecutiveCount = 0;
      }
    }

    return null;
  }
}
