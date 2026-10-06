/**
 * BEACON 3D - Multi-Modal AI Matching Engine
 * Computes semantic, visual, spatial, and temporal affinity between Lost and Found items.
 */

import { CAMPUS_BUILDINGS } from './data.js';

export class AIMatchingEngine {
  constructor() {
    this.weights = {
      category: 0.30,
      keywords: 0.25,
      location: 0.20,
      color: 0.15,
      time: 0.10
    };
  }

  calculateSimilarity(itemA, itemB) {
    // Cannot match items of the same type (must pair lost with found)
    if (itemA.type === itemB.type) {
      return { totalScore: 0, breakdown: {} };
    }

    // 1. Category Score (0 - 100)
    const categoryScore = itemA.category === itemB.category ? 100 : 0;

    // 2. Keyword & Semantic Overlap (0 - 100)
    const tokensA = this.extractTokens(`${itemA.title} ${itemA.description} ${(itemA.tags || []).join(' ')}`);
    const tokensB = this.extractTokens(`${itemB.title} ${itemB.description} ${(itemB.tags || []).join(' ')}`);
    const keywordScore = this.computeJaccardSimilarity(tokensA, tokensB) * 100;

    // 3. Location Proximity Score (0 - 100)
    const locationScore = this.computeLocationProximity(itemA.buildingId, itemB.buildingId);

    // 4. Color Similarity (0 - 100)
    const colorScore = this.computeColorSimilarity(itemA.color, itemB.color, itemA.colorName, itemB.colorName);

    // 5. Time Window Proximity Score (0 - 100)
    const timeScore = this.computeTimeProximity(itemA.date, itemB.date);

    // Weighted Total Score
    const totalScore = Math.round(
      categoryScore * this.weights.category +
      keywordScore * this.weights.keywords +
      locationScore * this.weights.location +
      colorScore * this.weights.color +
      timeScore * this.weights.time
    );

    return {
      totalScore: Math.min(99, Math.max(12, totalScore)),
      breakdown: {
        category: Math.round(categoryScore),
        keywords: Math.round(keywordScore),
        location: Math.round(locationScore),
        color: Math.round(colorScore),
        time: Math.round(timeScore)
      }
    };
  }

  extractTokens(text) {
    if (!text) return new Set();
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'in', 'and', 'or', 'for', 'with', 'to', 'of', 'has', 'my', 'near']);
    const tokens = clean.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    return new Set(tokens);
  }

  computeJaccardSimilarity(setA, setB) {
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersectionCount = 0;
    setA.forEach(item => {
      if (setB.has(item)) intersectionCount++;
    });
    const unionCount = setA.size + setB.size - intersectionCount;
    return unionCount > 0 ? intersectionCount / unionCount : 0;
  }

  computeLocationProximity(bldgIdA, bldgIdB) {
    if (!bldgIdA || !bldgIdB) return 50;
    if (bldgIdA === bldgIdB) return 100;

    const bldgA = CAMPUS_BUILDINGS.find(b => b.id === bldgIdA);
    const bldgB = CAMPUS_BUILDINGS.find(b => b.id === bldgIdB);

    if (!bldgA || !bldgB) return 60;

    const dx = bldgA.coords.x - bldgB.coords.x;
    const dz = bldgA.coords.z - bldgB.coords.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Max campus distance ~12 units
    const proximity = Math.max(20, Math.round(100 - (dist / 12) * 80));
    return proximity;
  }

  computeColorSimilarity(hexA, hexB, nameA, nameB) {
    if (nameA && nameB && nameA.toLowerCase().includes(nameB.toLowerCase())) {
      return 95;
    }
    if (!hexA || !hexB) return 60;

    try {
      const rgbA = this.hexToRgb(hexA);
      const rgbB = this.hexToRgb(hexB);
      const dist = Math.sqrt(
        Math.pow(rgbA.r - rgbB.r, 2) +
        Math.pow(rgbA.g - rgbB.g, 2) +
        Math.pow(rgbA.b - rgbB.b, 2)
      );
      // Max RGB distance is sqrt(255^2 * 3) ~ 441.67
      const similarity = Math.max(10, Math.round(100 - (dist / 441.67) * 100));
      return similarity;
    } catch (e) {
      return 60;
    }
  }

  hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  computeTimeProximity(dateA, dateB) {
    if (!dateA || !dateB) return 70;
    const tA = new Date(dateA).getTime();
    const tB = new Date(dateB).getTime();
    const diffHours = Math.abs(tA - tB) / (1000 * 60 * 60);

    if (diffHours <= 6) return 100;
    if (diffHours <= 24) return 85;
    if (diffHours <= 48) return 70;
    if (diffHours <= 120) return 50;
    return 30;
  }

  findMatchesForItem(sourceItem, allItems) {
    const targetType = sourceItem.type === 'lost' ? 'found' : 'lost';
    const candidates = allItems.filter(item => item.type === targetType && item.status !== 'reunited');

    const matches = candidates.map(candidate => {
      const matchResult = this.calculateSimilarity(sourceItem, candidate);
      return {
        item: candidate,
        score: matchResult.totalScore,
        breakdown: matchResult.breakdown
      };
    });

    matches.sort((a, b) => b.score - a.score);
    return matches;
  }

  simulateImageLabeling(fileName = 'item.jpg') {
    // Simulated deep vision inference (ML Kit image labeling simulator)
    const lower = fileName.toLowerCase();
    if (lower.includes('mac') || lower.includes('laptop') || lower.includes('computer')) {
      return {
        category: 'electronics',
        tags: ['laptop', 'notebook', 'electronics', 'screen', 'aluminum'],
        color: '#383b42',
        colorName: 'Space Gray',
        confidence: 0.98
      };
    }
    if (lower.includes('airpod') || lower.includes('earbud') || lower.includes('headphone')) {
      return {
        category: 'wearables',
        tags: ['audio', 'earbuds', 'wireless', 'charging case', 'bluetooth'],
        color: '#8a5cf6',
        colorName: 'Lavender Purple',
        confidence: 0.96
      };
    }
    if (lower.includes('key') || lower.includes('fob')) {
      return {
        category: 'keys',
        tags: ['keys', 'keychain', 'metal', 'remote fob', 'brass'],
        color: '#1a1c23',
        colorName: 'Metallic Black & Brass',
        confidence: 0.94
      };
    }
    if (lower.includes('pack') || lower.includes('bag')) {
      return {
        category: 'bags',
        tags: ['backpack', 'fabric', 'straps', 'zipper', 'storage'],
        color: '#1f4d36',
        colorName: 'Forest Green',
        confidence: 0.95
      };
    }
    if (lower.includes('card') || lower.includes('id') || lower.includes('badge')) {
      return {
        category: 'ids_cards',
        tags: ['id badge', 'student card', 'rfid', 'plastic card', 'lanyard'],
        color: '#0284c7',
        colorName: 'University Blue',
        confidence: 0.97
      };
    }
    // Generic fallback detection
    return {
      category: 'accessories',
      tags: ['personal item', 'accessory', 'campus item', 'portable'],
      color: '#0284c7',
      colorName: 'Cyan Blue',
      confidence: 0.89
    };
  }
}

export const aiMatchingEngine = new AIMatchingEngine();
