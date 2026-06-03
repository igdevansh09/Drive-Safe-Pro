import { Accelerometer } from "expo-sensors";
import { SignalProcessor } from "./SignalProcessor";
import { CircularBuffer } from "./BufferQueue";
import { EventDetector, TelemetryEvent } from "./EventDetector";
import { TELEMETRY_THRESHOLDS, ENGINE_CONFIG } from "../constants/thresholds";

export class TelemetryEngine {
  private processor: SignalProcessor;
  private buffer: CircularBuffer<number>;
  private detector: EventDetector;
  private subscription: any = null;
  private onEventDetected: (event: TelemetryEvent) => void;

  constructor(onEvent: (event: TelemetryEvent) => void) {
    this.processor = new SignalProcessor(ENGINE_CONFIG.LOW_PASS_FILTER_ALPHA);
    this.buffer = new CircularBuffer<number>(ENGINE_CONFIG.BUFFER_SIZE);
    this.detector = new EventDetector(
      TELEMETRY_THRESHOLDS.AGGRESSIVE_MOVEMENT_G,
      TELEMETRY_THRESHOLDS.REQUIRED_CONSECUTIVE_TICKS,
      TELEMETRY_THRESHOLDS.COOLDOWN_MS
    );
    this.onEventDetected = onEvent;
  }

  public startDrive(): void {
    if (this.subscription) {
      console.warn("Drive already in progress.");
      return;
    }

    Accelerometer.setUpdateInterval(100);
    this.subscription = Accelerometer.addListener((rawSensorData) => {
      this.tick(rawSensorData);
    });
  }

  private tick(raw: { x: number; y: number; z: number }): void {
    const { gForce } = this.processor.process(raw);
    this.buffer.push(gForce);
    if (this.buffer.isFull()) {
      const event = this.detector.analyzeWindow(this.buffer.toArray());
      if (event) {
        this.onEventDetected(event);
      }
    }
  }

  public endDrive(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }

    this.buffer.clear();
    this.processor.reset();
  }
}
