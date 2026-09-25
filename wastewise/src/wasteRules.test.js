import test from "node:test";
import assert from "node:assert/strict";
import { validateWasteClassification, parseBoundingBox, validateMultiObjectScan, WASTE_STREAMS } from "./wasteRules.js";

test("CASE 1: Bed (intact / usable) -> REUSE / DONATE, bin is null, NEVER blue-bin dry waste", () => {
  // Even if raw Gemini erroneously said "dry" and "Blue Bin"
  const rawFromAI = {
    object: "bed",
    category: "dry",
    bin: "Blue Bin",
    condition: "usable",
    confidence: 0.94,
  };
  const result = validateWasteClassification(rawFromAI);

  assert.equal(result.object, "bed");
  assert.equal(result.bin, null, "Bed bin must strictly be null");
  assert.equal(result.category, "REUSABLE");
  assert.equal(result.action, "REUSE");
  assert.notEqual(result.category, "DRY_WASTE");
  assert.notEqual(result.bin, "Blue Bin");
});

test("CASE 2: Broken bed -> BULKY_WASTE, bin is null", () => {
  const rawFromAI = {
    object: "broken bed frame",
    category: "dry",
    condition: "damaged",
    confidence: 0.88,
  };
  const result = validateWasteClassification(rawFromAI);

  assert.equal(result.category, "BULKY_WASTE");
  assert.equal(result.action, "BULKY_WASTE");
  assert.equal(result.bin, null, "Broken bed bin must strictly be null");
});

test("CASE 3: Plastic water bottle -> RECYCLABLE, action RECYCLE", () => {
  const rawFromAI = {
    object: "plastic water bottle",
    category: "dry",
    confidence: 0.92,
  };
  const result = validateWasteClassification(rawFromAI);

  assert.equal(result.category, "RECYCLABLE");
  assert.equal(result.action, "RECYCLE");
});

test("CASE 4: Banana peel -> COMPOSTABLE, action COMPOST", () => {
  const rawFromAI = {
    object: "banana peel",
    category: "wet",
    confidence: 0.95,
  };
  const result = validateWasteClassification(rawFromAI);

  assert.equal(result.category, "COMPOSTABLE");
  assert.equal(result.action, "COMPOST");
});

test("CASE 5: Cardboard box -> RECYCLABLE, action RECYCLE", () => {
  const rawFromAI = {
    object: "cardboard box",
    category: "dry",
    confidence: 0.90,
  };
  const result = validateWasteClassification(rawFromAI);

  assert.equal(result.category, "RECYCLABLE");
  assert.equal(result.action, "RECYCLE");
});

test("CASE 6: Battery -> SPECIAL_CARE_WASTE, action SPECIAL_DISPOSAL, bin is null", () => {
  const rawFromAI = {
    object: "AA battery",
    category: "hazardous",
    confidence: 0.93,
  };
  const result = validateWasteClassification(rawFromAI);

  assert.equal(result.category, "SPECIAL_CARE_WASTE");
  assert.equal(result.action, "SPECIAL_DISPOSAL");
  assert.equal(result.bin, null);
});

test("CASE 7: Smartphone -> E_WASTE / REUSABLE, bin is null", () => {
  const rawUsable = {
    object: "smartphone",
    condition: "usable",
    confidence: 0.89,
  };
  const resultUsable = validateWasteClassification(rawUsable);
  assert.equal(resultUsable.category, "REUSABLE");
  assert.equal(resultUsable.bin, null);

  const rawBroken = {
    object: "smartphone",
    condition: "damaged",
    confidence: 0.89,
  };
  const resultBroken = validateWasteClassification(rawBroken);
  assert.equal(resultBroken.category, "E_WASTE");
  assert.equal(resultBroken.action, "SPECIAL_DISPOSAL");
  assert.equal(resultBroken.bin, null);
});

test("CASE 8: Old shirt -> REUSE if wearable, TEXTILE if damaged", () => {
  const rawUsable = {
    object: "old shirt",
    condition: "usable",
    confidence: 0.85,
  };
  const resultUsable = validateWasteClassification(rawUsable);
  assert.equal(resultUsable.category, "REUSABLE");
  assert.equal(resultUsable.action, "DONATE");

  const rawTorn = {
    object: "torn shirt",
    condition: "damaged",
    confidence: 0.85,
  };
  const resultTorn = validateWasteClassification(rawTorn);
  assert.equal(resultTorn.category, "TEXTILE");
  assert.equal(resultTorn.action, "RECYCLE");
});

test("CASE 9: Sofa -> REUSABLE or BULKY_WASTE, bin is null", () => {
  const rawFromAI = {
    object: "leather sofa",
    condition: "usable",
    confidence: 0.91,
  };
  const result = validateWasteClassification(rawFromAI);

  assert.equal(result.category, "REUSABLE");
  assert.equal(result.bin, null);
  assert.notEqual(result.bin, "Blue Bin");
});

test("CASE 10: Medicine packaging / medicine -> SPECIAL_CARE_WASTE, bin is null", () => {
  const rawFromAI = {
    object: "expired medicine tablet strip",
    confidence: 0.87,
  };
  const result = validateWasteClassification(rawFromAI);

  assert.equal(result.category, "SPECIAL_CARE_WASTE");
  assert.equal(result.action, "SPECIAL_DISPOSAL");
  assert.equal(result.bin, null);
});

test("CASE 11: Working laptop -> REUSE / DONATE, bin is null", () => {
  const rawFromAI = {
    object: "laptop",
    condition: "usable",
    confidence: 0.92,
  };
  const result = validateWasteClassification(rawFromAI);

  assert.equal(result.category, "REUSABLE");
  assert.equal(result.action, "DONATE");
  assert.equal(result.bin, null);
});

test("CASE 12: Empty glass bottle -> RECYCLABLE, action RECYCLE", () => {
  const rawFromAI = {
    object: "glass bottle",
    confidence: 0.94,
  };
  const result = validateWasteClassification(rawFromAI);

  assert.equal(result.category, "RECYCLABLE");
  assert.equal(result.action, "RECYCLE");
});

test("STRICT SAFETY: Mattress and Wardrobe are never household-bin dry waste", () => {
  const mattress = validateWasteClassification({ object: "mattress", category: "dry", bin: "Blue Bin" });
  assert.equal(mattress.bin, null);
  assert.equal(mattress.category, "BULKY_WASTE");

  const wardrobe = validateWasteClassification({ object: "wardrobe", category: "dry", bin: "Blue Bin" });
  assert.equal(wardrobe.bin, null);
  assert.equal(wardrobe.category, "BULKY_WASTE");
});

// ─── MULTI-OBJECT & BOUNDING BOX TESTS ──────────────────────────────────────────

test("MULTI-OBJECT: parseBoundingBox normalizes [ymin, xmin, ymax, xmax] accurately", () => {
  // Valid 0..1000 object
  const b1 = parseBoundingBox({ ymin: 250, xmin: 100, ymax: 800, xmax: 600 });
  assert.equal(b1.topPct, 25);
  assert.equal(b1.leftPct, 10);
  assert.equal(b1.widthPct, 50);
  assert.equal(b1.heightPct, 55);

  // Valid array [ymin, xmin, ymax, xmax]
  const b2 = parseBoundingBox([400, 300, 700, 800]);
  assert.equal(b2.topPct, 40);
  assert.equal(b2.leftPct, 30);
  assert.equal(b2.widthPct, 50);
  assert.equal(b2.heightPct, 30);

  // 0..1 float scaling
  const b3 = parseBoundingBox([0.1, 0.2, 0.5, 0.6]);
  assert.equal(b3.ymin, 100);
  assert.equal(b3.xmin, 200);
  assert.equal(b3.ymax, 500);
  assert.equal(b3.xmax, 600);
  assert.equal(b3.topPct, 10);

  // Invalid box: xmin >= xmax
  assert.equal(parseBoundingBox([100, 500, 300, 200]), null);
  // Invalid box: ymin >= ymax
  assert.equal(parseBoundingBox([600, 100, 200, 400]), null);
  // Invalid box: non-numeric
  assert.equal(parseBoundingBox("not-a-box"), null);
});

test("MULTI-OBJECT: validateMultiObjectScan handles room with Bed + 2 Bottles + Battery + Chair", () => {
  const roomResponse = {
    items: [
      {
        id: "item-1",
        object: "Bed",
        condition: "usable",
        category: "dry", // Raw AI mistakenly said dry
        bin: "Blue Bin", // Raw AI mistakenly assigned Blue Bin
        boundingBox: [200, 100, 800, 600]
      },
      {
        id: "item-2",
        object: "Plastic Bottle #1",
        category: "dry",
        boundingBox: [150, 650, 400, 750]
      },
      {
        id: "item-3",
        object: "Plastic Bottle #2",
        category: "dry",
        boundingBox: [420, 660, 670, 760]
      },
      {
        id: "item-4",
        object: "AA Battery",
        category: "dry", // Raw AI mistakenly said dry
        boundingBox: [700, 700, 850, 780]
      },
      {
        id: "item-5",
        object: "Desk Chair",
        condition: "usable",
        boundingBox: [300, 400, 650, 550]
      }
    ]
  };

  const result = validateMultiObjectScan(roomResponse);

  assert.equal(result.count, 5);
  assert.equal(result.items.length, 5);

  // Bed must be corrected to REUSABLE and bin: null
  const bed = result.items[0];
  assert.equal(bed.category, "REUSABLE");
  assert.equal(bed.action, "REUSE");
  assert.equal(bed.bin, null, "Bed bin must strictly be null");
  assert.ok(bed.boundingBox);
  assert.equal(bed.boundingBox.topPct, 20);

  // Both bottles must be preserved as distinct instances
  const b1 = result.items[1];
  const b2 = result.items[2];
  assert.equal(b1.id, "item-2");
  assert.equal(b2.id, "item-3");
  assert.equal(b1.category, "RECYCLABLE");
  assert.equal(b2.category, "RECYCLABLE");
  assert.notEqual(b1.boundingBox.topPct, b2.boundingBox.topPct);

  // Battery must be corrected to SPECIAL_CARE_WASTE and bin: null
  const battery = result.items[3];
  assert.equal(battery.category, "SPECIAL_CARE_WASTE");
  assert.equal(battery.bin, null);

  // Chair must be REUSABLE
  const chair = result.items[4];
  assert.equal(chair.category, "REUSABLE");
  assert.equal(chair.bin, null);

  // Dynamic summary counts check
  assert.ok(result.summary.length >= 3);
  const recyclableSummary = result.summary.find(s => s.label === "Recyclable");
  assert.equal(recyclableSummary.count, 2);
  const reusableSummary = result.summary.find(s => s.label === "Reusable");
  assert.equal(reusableSummary.count, 2);
  const specialCareSummary = result.summary.find(s => s.label === "Special Care");
  assert.equal(specialCareSummary.count, 1);
});

test("MULTI-OBJECT: Single-object legacy response is cleanly wrapped and validated", () => {
  const singleObj = {
    object: "Single Aluminium Can",
    category: "dry",
    boundingBox: [200, 300, 600, 500]
  };

  const result = validateMultiObjectScan(singleObj);
  assert.equal(result.count, 1);
  assert.equal(result.items[0].category, "RECYCLABLE");
  assert.equal(result.items[0].boundingBox.topPct, 20);
});

test("MULTI-OBJECT: Empty items array returns count 0 gracefully", () => {
  const emptyResponse = { items: [] };
  const result = validateMultiObjectScan(emptyResponse);
  assert.equal(result.count, 0);
  assert.equal(result.items.length, 0);
  assert.equal(result.summary.length, 0);
});
