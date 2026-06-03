export type Vector3D = { x: number; y: number; z: number };

export class SignalProcessor {
  private gravity: Vector3D = { x: 0, y: 0, z: 0 };
  private readonly alpha: number;

  constructor(alpha: number = 0.8) {
    this.alpha = alpha;
  }

  public process(raw: Vector3D): { linear: Vector3D; gForce: number } {
    this.gravity.x = this.alpha * this.gravity.x + (1 - this.alpha) * raw.x;
    this.gravity.y = this.alpha * this.gravity.y + (1 - this.alpha) * raw.y;
    this.gravity.z = this.alpha * this.gravity.z + (1 - this.alpha) * raw.z;

    const linear = {
      x: raw.x - this.gravity.x,
      y: raw.y - this.gravity.y,
      z: raw.z - this.gravity.z,
    };

    const gForce = Math.sqrt(
      Math.pow(linear.x, 2) + Math.pow(linear.y, 2) + Math.pow(linear.z, 2),
    );

    return { linear, gForce };
  }

  public reset(): void {
    this.gravity = { x: 0, y: 0, z: 0 };
  }
}