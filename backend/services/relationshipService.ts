import { FileStorage } from "../utils/fileStorage.js";
import { readdirSync, existsSync } from "fs";
import { join } from "path";

export interface Relationship {
  itemA: number;
  itemB: number;
  relationshipType: string;
  description?: string;
  strength: number; // 0.0 to 1.0
  createdBy: string;
  createdAt: string;
  bidirectional: boolean;
  tags?: string[];
  aiCluster?: string;
}

export interface RelationshipInput {
  itemA: number;
  itemB: number;
  relationshipType: string;
  description?: string;
  strength?: number;
  createdBy: string;
  tags?: string[];
}

export class RelationshipService {
  private static instance: RelationshipService;

  private constructor() {}

  public static getInstance(): RelationshipService {
    if (!RelationshipService.instance) {
      RelationshipService.instance = new RelationshipService();
    }
    return RelationshipService.instance;
  }

  /**
   * Create a new bidirectional relationship between two media items
   */
  public createRelationship(input: RelationshipInput): Relationship {
    // Validate that both items exist (basic validation)
    if (input.itemA === input.itemB) {
      throw new Error("Cannot create relationship between the same item");
    }

    // Create relationship object
    const relationship: Relationship = {
      itemA: input.itemA,
      itemB: input.itemB,
      relationshipType: input.relationshipType,
      description: input.description,
      strength: input.strength || 0.5, // Default strength
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      bidirectional: true, // All relationships are bidirectional by default
      tags: input.tags || [],
    };

    // Save to file
    const filePath = FileStorage.getRelationshipPath(input.itemA, input.itemB);
    const success = FileStorage.writeJSON(filePath, relationship);

    if (!success) {
      throw new Error("Failed to save relationship");
    }

    // Update graph.json
    this.updateGraphData();

    return relationship;
  }

  /**
   * Get a specific relationship between two items
   */
  public getRelationship(itemA: number, itemB: number): Relationship | null {
    const filePath = FileStorage.getRelationshipPath(itemA, itemB);
    return FileStorage.readJSON<Relationship>(filePath);
  }

  /**
   * Update an existing relationship
   */
  public updateRelationship(
    itemA: number,
    itemB: number,
    updates: Partial<RelationshipInput>
  ): Relationship | null {
    const existing = this.getRelationship(itemA, itemB);
    if (!existing) {
      return null;
    }

    const updated: Relationship = {
      ...existing,
      ...updates,
      itemA: existing.itemA, // Don't allow changing the connected items
      itemB: existing.itemB,
      createdAt: existing.createdAt, // Don't change creation time
    };

    const filePath = FileStorage.getRelationshipPath(itemA, itemB);
    const success = FileStorage.writeJSON(filePath, updated);

    if (!success) {
      throw new Error("Failed to update relationship");
    }

    this.updateGraphData();
    return updated;
  }

  /**
   * Delete a relationship
   */
  public deleteRelationship(itemA: number, itemB: number): boolean {
    const filePath = FileStorage.getRelationshipPath(itemA, itemB);
    
    if (!existsSync(filePath)) {
      return false;
    }

    try {
      const fs = require('fs');
      fs.unlinkSync(filePath);
      this.updateGraphData();
      return true;
    } catch (error) {
      console.error('Error deleting relationship:', error);
      return false;
    }
  }

  /**
   * Get all relationships for a specific media item
   */
  public getRelationshipsForItem(itemId: number): Relationship[] {
    const relationships: Relationship[] = [];
    const linksDir = FileStorage.getDataPath('relationships', 'links');

    if (!existsSync(linksDir)) {
      return relationships;
    }

    try {
      const files = readdirSync(linksDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        // Parse filename: "1-2.json" -> [1, 2]
        const match = file.match(/^(\d+)-(\d+)\.json$/);
        if (!match) continue;

        const itemA = parseInt(match[1]);
        const itemB = parseInt(match[2]);

        // Check if this relationship involves our target item
        if (itemA === itemId || itemB === itemId) {
          const relationship = FileStorage.readJSON<Relationship>(
            join(linksDir, file)
          );
          if (relationship) {
            relationships.push(relationship);
          }
        }
      }
    } catch (error) {
      console.error('Error reading relationships directory:', error);
    }

    return relationships;
  }

  /**
   * Get all relationships in the system
   */
  public getAllRelationships(): Relationship[] {
    const relationships: Relationship[] = [];
    const linksDir = FileStorage.getDataPath('relationships', 'links');

    if (!existsSync(linksDir)) {
      return relationships;
    }

    try {
      const files = readdirSync(linksDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const relationship = FileStorage.readJSON<Relationship>(
          join(linksDir, file)
        );
        if (relationship) {
          relationships.push(relationship);
        }
      }
    } catch (error) {
      console.error('Error reading relationships directory:', error);
    }

    return relationships;
  }

  /**
   * Update the graph.json file with current relationships
   */
  private updateGraphData(): void {
    try {
      const relationships = this.getAllRelationships();
      
      // Create nodes set to avoid duplicates
      const nodeSet = new Set<number>();
      const edges = relationships.map(rel => {
        nodeSet.add(rel.itemA);
        nodeSet.add(rel.itemB);
        
        return {
          source: rel.itemA,
          target: rel.itemB,
          relationshipType: rel.relationshipType,
          strength: rel.strength,
          bidirectional: rel.bidirectional
        };
      });

      const graphData = {
        nodes: Array.from(nodeSet).map(id => ({ id })),
        edges
      };

      const graphPath = FileStorage.getDataPath('relationships', 'graph.json');
      FileStorage.writeJSON(graphPath, graphData);
    } catch (error) {
      console.error('Error updating graph data:', error);
    }
  }

  /**
   * Get graph data for visualization
   */
  public getGraphData() {
    const graphPath = FileStorage.getDataPath('relationships', 'graph.json');
    return FileStorage.readJSON(graphPath) || { nodes: [], edges: [] };
  }
}