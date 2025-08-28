import { Router, Response } from "express";
import { AuthenticatedRequest } from "../utils/authMiddleware.js";
import { RelationshipService, RelationshipInput } from "../services/relationshipService.js";
import { MediaService } from "../services/mediaService.js";

const router = Router();
const relationshipService = RelationshipService.getInstance();
const mediaService = MediaService.getInstance();

// Apply authentication middleware to all relationship routes
// TODO: Re-enable authentication after implementing login UI
// router.use(authenticateToken);

/**
 * POST /api/relationships - Create a new relationship
 */
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemA, itemB, relationshipType, description, strength, tags } = req.body;
    const createdBy = req.user?.id || 'friend1'; // Default user for testing

    // Validation
    if (!itemA || !itemB || !relationshipType) {
      return res.status(400).json({
        error: "Missing required fields: itemA, itemB, relationshipType",
      });
    }

    if (!Number.isInteger(itemA) || !Number.isInteger(itemB)) {
      return res.status(400).json({
        error: "itemA and itemB must be integers",
      });
    }

    if (itemA === itemB) {
      return res.status(400).json({
        error: "Cannot create relationship between the same item",
      });
    }

    // Check if items exist
    const mediaItemA = mediaService.getMediaItem(itemA);
    const mediaItemB = mediaService.getMediaItem(itemB);

    if (!mediaItemA || !mediaItemB) {
      return res.status(404).json({
        error: "One or both media items do not exist",
      });
    }

    // Check if relationship already exists
    const existing = relationshipService.getRelationship(itemA, itemB);
    if (existing) {
      return res.status(409).json({
        error: "Relationship already exists between these items",
        relationship: existing,
      });
    }

    // Create relationship
    const relationshipInput: RelationshipInput = {
      itemA,
      itemB,
      relationshipType: relationshipType.trim(),
      description: description?.trim(),
      strength: typeof strength === 'number' ? Math.max(0, Math.min(1, strength)) : 0.5,
      createdBy,
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()) : [],
    };

    const relationship = relationshipService.createRelationship(relationshipInput);

    res.status(201).json({
      success: true,
      relationship,
    });
  } catch (error) {
    console.error("Create relationship error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * GET /api/relationships - Get all relationships with optional filtering
 */
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId, createdBy, relationshipType } = req.query;
    
    let relationships = relationshipService.getAllRelationships();

    // Apply filters
    if (itemId) {
      const targetId = parseInt(itemId as string);
      if (!isNaN(targetId)) {
        relationships = relationships.filter(
          rel => rel.itemA === targetId || rel.itemB === targetId
        );
      }
    }

    if (createdBy) {
      relationships = relationships.filter(
        rel => rel.createdBy === createdBy
      );
    }

    if (relationshipType) {
      relationships = relationships.filter(
        rel => rel.relationshipType.toLowerCase().includes((relationshipType as string).toLowerCase())
      );
    }

    res.json({
      success: true,
      relationships,
      count: relationships.length,
    });
  } catch (error) {
    console.error("Get relationships error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/relationships/:itemA/:itemB - Get specific relationship
 */
router.get("/:itemA/:itemB", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const itemA = parseInt(req.params.itemA);
    const itemB = parseInt(req.params.itemB);

    if (isNaN(itemA) || isNaN(itemB)) {
      return res.status(400).json({
        error: "Invalid item IDs",
      });
    }

    const relationship = relationshipService.getRelationship(itemA, itemB);

    if (!relationship) {
      return res.status(404).json({
        error: "Relationship not found",
      });
    }

    res.json({
      success: true,
      relationship,
    });
  } catch (error) {
    console.error("Get relationship error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * PUT /api/relationships/:itemA/:itemB - Update existing relationship
 */
router.put("/:itemA/:itemB", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const itemA = parseInt(req.params.itemA);
    const itemB = parseInt(req.params.itemB);

    if (isNaN(itemA) || isNaN(itemB)) {
      return res.status(400).json({
        error: "Invalid item IDs",
      });
    }

    const { relationshipType, description, strength, tags } = req.body;

    // Build updates object
    const updates: Partial<RelationshipInput> = {};
    if (relationshipType) updates.relationshipType = relationshipType.trim();
    if (description !== undefined) updates.description = description?.trim();
    if (typeof strength === 'number') {
      updates.strength = Math.max(0, Math.min(1, strength));
    }
    if (Array.isArray(tags)) {
      updates.tags = tags.map((t: string) => t.trim());
    }

    const updatedRelationship = relationshipService.updateRelationship(itemA, itemB, updates);

    if (!updatedRelationship) {
      return res.status(404).json({
        error: "Relationship not found",
      });
    }

    res.json({
      success: true,
      relationship: updatedRelationship,
    });
  } catch (error) {
    console.error("Update relationship error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * DELETE /api/relationships/:itemA/:itemB - Delete relationship
 */
router.delete("/:itemA/:itemB", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const itemA = parseInt(req.params.itemA);
    const itemB = parseInt(req.params.itemB);

    if (isNaN(itemA) || isNaN(itemB)) {
      return res.status(400).json({
        error: "Invalid item IDs",
      });
    }

    const deleted = relationshipService.deleteRelationship(itemA, itemB);

    if (!deleted) {
      return res.status(404).json({
        error: "Relationship not found",
      });
    }

    res.json({
      success: true,
      message: "Relationship deleted successfully",
    });
  } catch (error) {
    console.error("Delete relationship error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/relationships/graph - Get graph data for visualization
 */
router.get("/graph", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const graphData = relationshipService.getGraphData();
    
    res.json({
      success: true,
      graph: graphData,
    });
  } catch (error) {
    console.error("Get graph data error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;