import {
  Accelerometer,
  DeviceMotion,
  Gyroscope,
  Magnetometer,
} from "expo-sensors";
import { ENGINE_CONFIG } from "../constants/thresholds";
import { CircularBuffer } from "./BufferQueue";
import { EventDetector, SensorFrame, TelemetryEvent } from "./EventDetector";
import { SignalProcessor } from "./SignalProcessor";

export class SensorManager {
  private processor: SignalProcessor;
  private buffer: CircularBuffer<SensorFrame>;
  private detector: EventDetector;
  private accelSub: any = null;
  private gyroSub: any = null;
  private deviceMotionSub: any = null;
  private magnetSub: any = null;
  private ticker: ReturnType<typeof setInterval> | null = null;
  private currentRawAccel = { x: 0, y: 0, z: 0 };
  private currentRawGyro = { x: 0, y: 0, z: 0 };
  private currentDeviceMotion = { x: 0, y: 0, z: 0 };
  private currentMagnet = { x: 0, y: 0, z: 0 };
  private onEventDetected: (event: TelemetryEvent) => void;

  constructor(onEvent: (event: TelemetryEvent) => void) {
    this.processor = new SignalProcessor(ENGINE_CONFIG.LOW_PASS_FILTER_ALPHA);
    this.buffer = new CircularBuffer<SensorFrame>(ENGINE_CONFIG.BUFFER_SIZE);
    this.detector = new EventDetector();
    this.onEventDetected = onEvent;
  }

  public startDrive(): void {
    if (this.ticker) {
      console.warn("Drive pipeline already active.");
      return;
    }

    Accelerometer.setUpdateInterval(80);
    Gyroscope.setUpdateInterval(80);
    DeviceMotion.setUpdateInterval(80);
    Magnetometer.setUpdateInterval(80);

    this.accelSub = Accelerometer.addListener((data) => {
      this.currentRawAccel = data;
    });

    this.gyroSub = Gyroscope.addListener((data) => {
      this.currentRawGyro = data;
    });

    this.deviceMotionSub = DeviceMotion.addListener((data) => {
      if (data.acceleration) {
        this.currentDeviceMotion = data.acceleration;
      }
    });

    this.magnetSub = Magnetometer.addListener((data) => {
      this.currentMagnet = data;
    });

    this.ticker = setInterval(
      () => this.tick(),
      ENGINE_CONFIG.POLLING_INTERVAL_MS,
    );
  }

  private tick(): void {
    const { linear, gForce } = this.processor.process(this.currentDeviceMotion);
    const frame: SensorFrame = {
      accel: linear,
      gyro: this.currentRawGyro,
      magnet: this.currentMagnet,
      magnitude: gForce,
    };

    this.buffer.push(frame);

    if (this.buffer.isFull()) {
      const event = this.detector.analyzeWindow(this.buffer.toArray());
      if (event) {
        this.onEventDetected(event);
      }
    }
  }

  public endDrive(): void {
    if (this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }

    if (this.accelSub) {
      this.accelSub.remove();
      this.accelSub = null;
    }

    if (this.gyroSub) {
      this.gyroSub.remove();
      this.gyroSub = null;
    }

    if (this.deviceMotionSub) {
      this.deviceMotionSub.remove();
      this.deviceMotionSub = null;
    }

    if (this.magnetSub) {
      this.magnetSub.remove();
      this.magnetSub = null;
    }

    this.buffer.clear();
    this.processor.reset();
    this.currentRawAccel = { x: 0, y: 0, z: 0 };
    this.currentRawGyro = { x: 0, y: 0, z: 0 };
    this.currentDeviceMotion = { x: 0, y: 0, z: 0 };
    this.currentMagnet = { x: 0, y: 0, z: 0 };
  }
}
