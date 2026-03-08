// netlify/functions/ai.js
// This runs on Netlify's servers — your API key stays secret here.
// The frontend calls /api/ai, Netlify routes it to this function.

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// ── Prompts ──────────────────────────────────────────────────────────────────
const PROMPTS = {
  analyze: (imageB64) => ({
    contents: [{
      parts: [
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: imageB64,
          }
        },
        {
          text: `You are WasteWise, an expert on India's waste management system.
Analyze this image carefully and identify what waste item is shown.
Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation:
{
  "itemName": "specific common name of the item",
  "category": "wet" or "dry" or "hazardous" or "ewaste" or "sanitary",
  "confidence": number from 0 to 100,
  "disposal": "one clear sentence on how to dispose in India",
  "tip": "one practical eco-tip for this item",
  "recyclable": true or false,
  "decompositionDays": number or null,
  "impactStat": "one shocking statistic about this type of waste in India"
}
Categories: wet=food/organic, dry=paper/plastic/glass/metal, hazardous=chemicals/batteries/paint, ewaste=electronics, sanitary=diapers/pads`
        }
      ]
    }],
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 800 }
  }),

  impact: (itemName, category) => ({
    contents: [{
      parts: [{
        text: `Calculate the environmental impact of recycling "${itemName}" (${category} waste) instead of sending it to landfill.
Respond ONLY with a valid JSON object — no markdown, no backticks:
{
  "carbonPercent": number (% reduction in carbon footprint, 1-95),
  "carbonSaved": "short phrase like 'saves ~30g CO₂'",
  "energySaved": "short phrase like 'powers a bulb for 3 hours'",
  "waterSaved": "short phrase or null",
  "wildlifeFact": "one vivid emotional sentence about how this helps a specific animal or ecosystem in India",
  "funFact": "one surprising and delightful fact about recycling this material",
  "treesEquivalent": "short phrase or null",
  "recycledInto": "what this material commonly becomes after recycling"
}`
      }]
    }],
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 600 }
  }),

  centers: (itemName, category, city) => {
    const searchHints = {
      wet: "compost facility or organic waste collection",
      dry: "scrap dealer or kabadiwala or recycling center",
      hazardous: "hazardous waste disposal facility",
      ewaste: "e-waste collection or electronics recycling center",
      sanitary: "municipal solid waste collection point",
    };
    return {
      contents: [{
        parts: [{
          text: `Find 3 real or realistic recycling/disposal centers for "${itemName}" (${category} waste) in ${city}, India.
Look for: ${searchHints[category] || "recycling center"}.
Respond ONLY with a valid JSON array — no markdown, no backticks:
[
  {
    "name": "center name",
    "type": "type of facility",
    "address": "full address in ${city}",
    "distance": "approximate distance like ~2 km",
    "phone": "phone number or null",
    "hours": "opening hours or null",
    "tip": "one helpful tip for visiting",
    "mapsQuery": "search query for Google Maps"
  }
]
If you don't know real centers in ${city}, generate 3 realistic fictional ones that sound plausible for that city.`
        }]
      }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 800 }
    };
  }
};

// ── Main handler ─────────────────────────────────────────────────────────────
export const handler = async (event) => {
  // CORS headers — allows your frontend to call this
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle preflight (must be before POST check)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "API key not configured. Add GEMINI_API_KEY in Netlify environment variables." })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { type, imageB64, itemName, category, city } = body;

  // Build Gemini request body based on type
  let geminiBody;
  try {
    if (type === "analyze") {
      if (!imageB64) throw new Error("Missing imageB64");
      geminiBody = PROMPTS.analyze(imageB64);
    } else if (type === "impact") {
      if (!itemName || !category) throw new Error("Missing itemName or category");
      geminiBody = PROMPTS.impact(itemName, category);
    } else if (type === "centers") {
      if (!category) throw new Error("Missing category");
      geminiBody = PROMPTS.centers(itemName || "waste item", category, city || "India");
    } else {
      throw new Error(`Unknown type: ${type}`);
    }
  } catch (err) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: err.message }) };
  }

  // Call Gemini
  try {
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      return {
        statusCode: geminiRes.status,
        headers,
        body: JSON.stringify({ error: "Gemini API error", detail: errText })
      };
    }

    const geminiData = await geminiRes.json();

    // Extract text from Gemini response
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON — strip any accidental markdown fences
    const clean = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed),
    };

  } catch (err) {
    console.error("Handler error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error", detail: err.message })
    };
  }
};
