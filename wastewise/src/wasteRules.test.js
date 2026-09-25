import test from "node:test";
import assert from "node:assert/strict";
import { validateWasteClassification, WASTE_STREAMS } from "./wasteRules.js";

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
