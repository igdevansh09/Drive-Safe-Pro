import {
  Accelerometer,
  DeviceMotion,
  Gyroscope,
  Magnetometer,
} from "expo-sensors";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake"; 
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
  private latestCallback: (event: TelemetryEvent) => void;

  constructor(onEvent: (event: TelemetryEvent) => void) {
    this.processor = new SignalProcessor(ENGINE_CONFIG.LOW_PASS_FILTER_ALPHA);
    this.buffer = new CircularBuffer<SensorFrame>(ENGINE_CONFIG.BUFFER_SIZE);
    this.detector = new EventDetector();
    this.onEventDetected = onEvent;
    this.latestCallback = onEvent;
  }

  public updateCallback(onEvent: (event: TelemetryEvent) => void): void {
    this.latestCallback = onEvent;
  }

  public async startDrive(): Promise<void> {
    if (this.ticker) {
      console.warn("Drive pipeline already active.");
      return;
    }

    const [accelPerm, gyroPerm, motionPerm, magnetPerm] = await Promise.all([
      Accelerometer.requestPermissionsAsync(),
      Gyroscope.requestPermissionsAsync(),
      DeviceMotion.requestPermissionsAsync(),
      Magnetometer.requestPermissionsAsync(),
    ]);

    const allGranted =
      accelPerm.granted &&
      gyroPerm.granted &&
      motionPerm.granted &&
      magnetPerm.granted;

    if (!allGranted) {
      console.warn(
        "SensorManager: one or more sensor permissions were denied.",
        { accelPerm, gyroPerm, motionPerm, magnetPerm },
      );
    }

    await activateKeepAwakeAsync("drive-session");

    Accelerometer.setUpdateInterval(ENGINE_CONFIG.POLLING_INTERVAL_MS);
    Gyroscope.setUpdateInterval(ENGINE_CONFIG.POLLING_INTERVAL_MS);
    DeviceMotion.setUpdateInterval(ENGINE_CONFIG.POLLING_INTERVAL_MS);
    Magnetometer.setUpdateInterval(ENGINE_CONFIG.POLLING_INTERVAL_MS);

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
        this.latestCallback(event);
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

    deactivateKeepAwake("drive-session");

    this.buffer.clear();
    this.processor.reset();
    this.currentRawAccel = { x: 0, y: 0, z: 0 };
    this.currentRawGyro = { x: 0, y: 0, z: 0 };
    this.currentDeviceMotion = { x: 0, y: 0, z: 0 };
    this.currentMagnet = { x: 0, y: 0, z: 0 };
  }
}
