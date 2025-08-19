import { FileStorage } from '../utils/fileStorage.js';
import { CounterService } from './counterService.js';

export interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  title?: string;
  description?: string;
  uploadThoughts?: string;
  tags: string[];
  temporalContext: {
    dayOfWeek: string;
    timeOfDay: string;
    season: string;
  };
}

export class MediaService {
  private static instance: MediaService;
  private counterService: CounterService;

  private constructor() {
    this.counterService = CounterService.getInstance();
  }

  public static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  public createMediaItem(
    originalName: string,
    mimeType: string,
    fileSize: number,
    uploadedBy: string,
    metadata?: {
      title?: string;
      description?: string;
      uploadThoughts?: string;
      tags?: string[];
    }
  ): MediaItem {
    const id = this.counterService.getNext();
    const fileExtension = this.getFileExtension(originalName);
    const filename = `${id}.${fileExtension}`;
    
    const now = new Date();
    const mediaItem: MediaItem = {
      id,
      filename,
      originalName,
      mimeType,
      fileSize,
      uploadedBy,
      uploadedAt: now.toISOString(),
      title: metadata?.title,
      description: metadata?.description,
      uploadThoughts: metadata?.uploadThoughts,
      tags: metadata?.tags || [],
      temporalContext: {
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
        timeOfDay: this.getTimeOfDay(now),
        season: this.getSeason(now)
      }
    };

    // Save metadata
    const success = FileStorage.writeJSON(FileStorage.getItemPath(id), mediaItem);
    if (!success) {
      throw new Error('Failed to save media metadata');
    }

    return mediaItem;
  }

  public getMediaItem(id: number): MediaItem | null {
    return FileStorage.readJSON<MediaItem>(FileStorage.getItemPath(id));
  }

  public getAllMediaItems(): MediaItem[] {
    const items: MediaItem[] = [];
    const currentId = this.counterService.getCurrent();
    
    for (let i = 1; i <= currentId; i++) {
      const item = this.getMediaItem(i);
      if (item) {
        items.push(item);
      }
    }
    
    return items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()! : 'bin';
  }

  private getTimeOfDay(date: Date): string {
    const hour = date.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  private getSeason(date: Date): string {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }
}