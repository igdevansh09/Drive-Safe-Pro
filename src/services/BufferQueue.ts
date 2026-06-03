export class CircularBuffer<T> {
  private buffer: T[];
  private maxSize: number;
  private head: number = 0; 
  private count: number = 0;

  constructor(size: number) {
    this.maxSize = size;
    this.buffer = new Array<T>(size);
  }

  public push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.maxSize;
    if (this.count < this.maxSize) {
      this.count++;
    }
  }

  public toArray(): T[] {
    const result: T[] = [];

    if (this.count < this.maxSize) {
      for (let i = 0; i < this.head; i++) {
        result.push(this.buffer[i]);
      }
      return result;
    }

    for (let i = 0; i < this.maxSize; i++) {
      const index = (this.head + i) % this.maxSize;
      result.push(this.buffer[index]);
    }

    return result;
  }

  public isFull(): boolean {
    return this.count === this.maxSize;
  }

  public clear(): void {
    this.head = 0;
    this.count = 0;
    this.buffer = new Array<T>(this.maxSize);
  }
}
