import { FileStorage } from '../utils/fileStorage.js';

interface CounterData {
  current: number;
}

// TODO: For high-traffic applications, consider caching the file path to improve performance.
// Current implementation resolves path fresh each time to support hot-reload during development.
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
      // Resolve path fresh each time (hot-reload friendly)
      const counterPath = FileStorage.getDataPath('counter.json');
      const data = FileStorage.readJSON<CounterData>(counterPath);
      
      if (data) {
        this.counterData = data;
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
      // Resolve path fresh each time (hot-reload friendly)
      const counterPath = FileStorage.getDataPath('counter.json');
      const success = FileStorage.writeJSON(counterPath, this.counterData);
      if (!success) {
        throw new Error('Failed to save counter');
      }
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