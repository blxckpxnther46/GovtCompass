import { Scheme } from "../models/Scheme.js";

export const aiExplainController = async (req, res) => {
  const { schemeId } = req.body;
  if (!schemeId) return res.status(400).json({ success: false, message: "schemeId is required" });

  try {
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) return res.status(404).json({ success: false, message: "Scheme not found" });

    // Caching logic: if already generated and saved, return instantly
    if (scheme.ai_summary) {
      return res.status(200).json({
        success: true,
        schemeId: scheme._id,
        schemeName: scheme.scheme_name,
        summary: scheme.ai_summary
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an expert at simplifying Indian government schemes for citizens. Read the provided scheme details and rewrite them into very simple, human-readable bullet points.
CRITICAL INSTRUCTIONS:
1. You MUST return a valid JSON object.
2. The JSON object MUST have exactly these four keys: "overview", "benefits", "eligibility", and "applicationProcess".
3. Each key MUST contain an array of strings (bullet points).
4. Keep the language extremely simple (5th-grade reading level). No bureaucratic jargon.`
          },
          {
            role: "user",
            content: `Simplify this scheme into JSON:
Scheme Name: ${scheme.scheme_name}
Description: ${scheme.detailed_description || scheme.description || "Not provided"}
Benefits: ${scheme.benefits || "Not provided"}
Eligibility: ${scheme.eligibility || "Not provided"}
Application Process: ${scheme.application_process || "Not provided"}
Categories: ${scheme.categories?.join(", ") || ""}
Tags: ${scheme.tags?.join(", ") || ""}`
          }
        ]
      })
    });

    if (!response.ok) throw new Error("AI service unavailable");

    const data = await response.json();
    let summary;
    try {
      summary = JSON.parse(data.choices[0].message.content.trim());
    } catch (e) {
      // Fallback if AI fails to return strict JSON
      summary = {
        overview: ["Failed to generate simple overview."],
        benefits: ["Failed to generate simple benefits."],
        eligibility: ["Failed to generate simple eligibility."],
        applicationProcess: ["Failed to generate simple application process."]
      };
    }
    
    // Save generated explanation to DB for next time
    scheme.ai_summary = summary;
    await scheme.save();

    return res.status(200).json({
      success: true,
      schemeId: scheme._id,
      schemeName: scheme.scheme_name,
      summary
    });
  } catch (err) {
    return res.status(503).json({ success: false, message: "AI service unavailable" });
  }
};
