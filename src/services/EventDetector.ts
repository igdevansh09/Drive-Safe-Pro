export type TelemetryEventType =
  | "HARSH_BRAKING"
  | "HARSH_ACCELERATION"
  | "SHARP_TURN"
  | "AGGRESSIVE_STEERING"
  | "EXCESSIVE_MOVEMENT"
  | "PHONE_HANDLING";

export interface TelemetryEvent {
  type: TelemetryEventType;
  gForce: number;
  timestamp: number;
}

export interface SensorFrame {
  accel: { x: number; y: number; z: number };
  gyro: { x: number; y: number; z: number };
  magnet: { x: number; y: number; z: number };
  magnitude: number;
}

export class EventDetector {
  private lastEventTime: number = 0;
  private readonly cooldownMs: number = 3000;
  private readonly thresholds = {
    brakeG: -0.25,
    accelG: 0.25,
    turnRadS: 0.5,
    handlingRadS: 1.0,
    movementG: 0.5,
    steerVariance: 0.8,
    headingChangeDeg: 20,
  };

  public analyzeWindow(buffer: SensorFrame[]): TelemetryEvent | null {
    const now = Date.now();
    if (now - this.lastEventTime < this.cooldownMs) return null;

    let brakeTicks = 0;
    let accelTicks = 0;
    let turnTicks = 0;
    let handlingTicks = 0;
    let movementTicks = 0;
    let peakMagnitude = 0;
    const zRotations: number[] = [];
    const headings: number[] = [];

    for (let i = 0; i < buffer.length; i++) {
      const { accel, gyro, magnet, magnitude } = buffer[i];
      zRotations.push(gyro.z);
      const heading = this.calculateHeading(magnet);
      headings.push(heading);
      if (magnitude > peakMagnitude) peakMagnitude = magnitude;

      if (
        Math.abs(gyro.x) > this.thresholds.handlingRadS ||
        Math.abs(gyro.y) > this.thresholds.handlingRadS
      ) {
        handlingTicks++;
      } else {
        handlingTicks = 0;
      }

      if (magnitude > this.thresholds.movementG) {
        movementTicks++;
      } else {
        movementTicks = 0;
      }

      if (accel.y < this.thresholds.brakeG) {
        brakeTicks++;
      } else {
        brakeTicks = 0;
      }

      if (accel.y > this.thresholds.accelG) {
        accelTicks++;
      } else {
        accelTicks = 0;
      }

      if (Math.abs(gyro.z) > this.thresholds.turnRadS) {
        turnTicks++;
      } else {
        turnTicks = 0;
      }

      if (handlingTicks >= 2)
        return this.trigger("PHONE_HANDLING", peakMagnitude, now);
      if (movementTicks >= 2)
        return this.trigger("EXCESSIVE_MOVEMENT", peakMagnitude, now);
      if (brakeTicks >= 3)
        return this.trigger("HARSH_BRAKING", Math.abs(accel.y), now);
      if (accelTicks >= 3)
        return this.trigger("HARSH_ACCELERATION", Math.abs(accel.y), now);
      if (turnTicks >= 3)
        return this.trigger("SHARP_TURN", Math.abs(gyro.z), now);
    }

    const maxZ = Math.max(...zRotations);
    const minZ = Math.min(...zRotations);
    if (maxZ - minZ > this.thresholds.steerVariance) {
      return this.trigger("AGGRESSIVE_STEERING", maxZ - minZ, now);
    }

    const headingChange = this.calculateHeadingChange(headings);
    if (headingChange > this.thresholds.headingChangeDeg) {
      return this.trigger("SHARP_TURN", headingChange, now);
    }

    return null;
  }

  private calculateHeading(magnet: {
    x: number;
    y: number;
    z: number;
  }): number {
    return Math.atan2(magnet.y, magnet.x) * (180 / Math.PI);
  }

  private calculateHeadingChange(headings: number[]): number {
    if (headings.length < 2) return 0;
    const first = headings[0];
    const last = headings[headings.length - 1];
    let diff = last - first;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return Math.abs(diff);
  }

  private trigger(
    type: TelemetryEventType,
    gForce: number,
    now: number,
  ): TelemetryEvent {
    this.lastEventTime = now;
    return { type, gForce, timestamp: now };
  }
}
