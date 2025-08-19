import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CounterData {
  current: number;
}

const COUNTER_FILE = join(process.cwd(), 'data', 'counter.json');

export class CounterService {
  private static instance: CounterService;
  private counterData!: CounterData;

  private constructor() {
    this.loadCounter();
  }

  public static getInstance(): CounterService {
    if (!CounterService.instance) {
      CounterService.instance = new CounterService();
    }
    return CounterService.instance;
  }

  private loadCounter(): void {
    try {
      if (existsSync(COUNTER_FILE)) {
        const data = readFileSync(COUNTER_FILE, 'utf-8');
        this.counterData = JSON.parse(data);
      } else {
        this.counterData = { current: 0 };
        this.saveCounter();
      }
    } catch (error) {
      console.error('Error loading counter:', error);
      this.counterData = { current: 0 };
    }
  }

  private saveCounter(): void {
    try {
      writeFileSync(COUNTER_FILE, JSON.stringify(this.counterData, null, 2));
    } catch (error) {
      console.error('Error saving counter:', error);
      throw new Error('Failed to save counter');
    }
  }

  public getNext(): number {
    this.counterData.current += 1;
    this.saveCounter();
    return this.counterData.current;
  }

  public getCurrent(): number {
    return this.counterData.current;
  }

  public reset(): void {
    this.counterData.current = 0;
    this.saveCounter();
  }
}