import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs';
import { dirname, join } from 'path';

export class FileStorage {
  private static ensureDirectoryExists(filePath: string): void {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  public static readJSON<T>(filePath: string): T | null {
    try {
      if (!existsSync(filePath)) {
        return null;
      }
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error reading JSON file ${filePath}:`, error);
      return null;
    }
  }

  public static writeJSON<T>(filePath: string, data: T): boolean {
    try {
      this.ensureDirectoryExists(filePath);
      
      // Atomic write: write to temp file first, then rename
      const tempPath = `${filePath}.tmp`;
      writeFileSync(tempPath, JSON.stringify(data, null, 2));
      renameSync(tempPath, filePath);
      
      return true;
    } catch (error) {
      console.error(`Error writing JSON file ${filePath}:`, error);
      return false;
    }
  }

  public static exists(filePath: string): boolean {
    return existsSync(filePath);
  }

  public static getDataPath(...segments: string[]): string {
    return join(process.cwd(), 'data', ...segments);
  }

  public static getMediaPath(filename: string): string {
    return this.getDataPath('media', filename);
  }

  public static getItemPath(id: number): string {
    return this.getDataPath('items', `${id}.json`);
  }

  public static getRelationshipPath(itemA: number, itemB: number): string {
    const sortedIds = [itemA, itemB].sort((a, b) => a - b);
    return this.getDataPath('relationships', 'links', `${sortedIds[0]}-${sortedIds[1]}.json`);
  }
}