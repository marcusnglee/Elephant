import { Router, Response } from "express";
import { AuthenticatedRequest } from "../utils/authMiddleware.js";
import multer from "multer";
import { join } from "path";
import { copyFileSync, unlinkSync } from "fs";
import { MediaItem, MediaService } from "../services/mediaService.js";
import { FileStorage } from "../utils/fileStorage.js";
import { authenticateToken } from "../utils/authMiddleware.js";

const router = Router();
const mediaService = MediaService.getInstance();

// Configure multer for file uploads
const upload = multer({
  dest: "temp/", // Temporary directory for uploaded files
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "100000000"), // 100MB default
    files: 10, // Maximum 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for now - can be restricted later
    cb(null, true);
  },
});

// Apply authentication middleware to all media routes
// TODO: Re-enable authentication after implementing login UI
// router.use(authenticateToken);

// Upload endpoint - supports multiple files
router.post(
  "/upload",
  upload.array("files"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      const uploadedBy = req.user?.id || 'friend1'; // Default user for testing

      if (!files || files.length === 0) {
        return res.status(400).json({
          error: "No files provided",
        });
      }

      const uploadedItems = [];
      const errors = [];

      for (const file of files) {
        try {
          // Extract metadata from request body (if provided)
          const metadata = {
            title: req.body[`title_${file.originalname}`],
            description: req.body[`description_${file.originalname}`],
            tags:
              req.body[`tags_${file.originalname}`]
                ?.split(",")
                .map((tag: string) => tag.trim()) || [],
          };

          // Create media item and get sequential filename
          const mediaItem = mediaService.createMediaItem(
            file.originalname,
            file.mimetype,
            file.size,
            uploadedBy,
            metadata
          );

          // Move file from temp location to permanent media storage
          const finalPath = FileStorage.getMediaPath(mediaItem.filename);
          copyFileSync(file.path, finalPath);

          // Clean up temp file
          unlinkSync(file.path);

          uploadedItems.push(mediaItem);
        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
          errors.push({
            filename: file.originalname,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          // Clean up temp file on error
          try {
            unlinkSync(file.path);
          } catch (cleanupError) {
            console.error("Error cleaning up temp file:", cleanupError);
          }
        }
      }

      res.json({
        success: true,
        uploaded: uploadedItems,
        errors: errors.length > 0 ? errors : undefined,
        count: uploadedItems.length,
      });
    } catch (error) {
      console.error("Upload endpoint error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);

// Get all media items
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = mediaService.getAllMediaItems();
    res.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("Get media items error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Get timeline view with pagination and filtering
router.get("/timeline", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const mimeType = req.query.mimeType as string;
    const uploadedBy = req.query.uploadedBy as string;
    
    let items = mediaService.getAllMediaItems();
    
    // Apply filters
    if (mimeType) {
      items = items.filter(item => item.mimeType.startsWith(mimeType));
    }
    
    if (uploadedBy) {
      items = items.filter(item => item.uploadedBy === uploadedBy);
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    // Group by date for timeline display
    const groupedByDate = paginatedItems.reduce((groups, item) => {
      const date = new Date(item.uploadedAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {} as Record<string, MediaItem[]>);
    
    res.json({
      success: true,
      items: paginatedItems,
      groupedByDate,
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit),
        hasNext: endIndex < items.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get timeline error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Get specific media item
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: "Invalid media ID",
      });
    }

    const item = mediaService.getMediaItem(id);

    if (!item) {
      return res.status(404).json({
        error: "Media item not found",
      });
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Get media item error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Update media item metadata
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        error: "Invalid media ID",
      });
    }

    const existingItem = mediaService.getMediaItem(id);

    if (!existingItem) {
      return res.status(404).json({
        error: "Media item not found",
      });
    }

    // extract only updatable fields from JSON
    const { title, description, tags } = req.body;

    // create updates object
    const updates: Partial<MediaItem> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined)
      updates.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((t: string) => t.trim());

    // write to JSON
    const updatedItem = { ...existingItem, ...updates };
    const success = FileStorage.writeJSON(
      FileStorage.getItemPath(id),
      updatedItem
    );
    if (!success) {
      return res.status(500).json({ error: "Failed to update media item" });
    }
    res.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Update media item error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;
