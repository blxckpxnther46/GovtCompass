import { Scheme } from "../models/Scheme.js";

export const aiExplainController = async (req, res) => {
  const { schemeId } = req.body;
  if (!schemeId) return res.status(400).json({ success: false, message: "schemeId is required" });

  try {
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) return res.status(404).json({ success: false, message: "Scheme not found" });

    // Caching logic: if already generated and saved, return instantly
    if (scheme.ai_explanation) {
      return res.status(200).json({
        success: true,
        schemeId: scheme._id,
        schemeName: scheme.scheme_name,
        explanation: scheme.ai_explanation
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
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that explains Indian government schemes to citizens in simple, plain English. Be concise, warm, and avoid bureaucratic language. Return ONLY the 3 sentences requested. Do not include conversational filler like "Here is the explanation:" or "Sure, I can help".`
          },
          {
            role: "user",
            content: `Explain this government scheme in exactly 3 sentences. First sentence: what it is and who it's for. Second sentence: what benefit they get (amount, service, or resource). Third sentence: how to apply or where to find more info.\n\nScheme: ${scheme.scheme_name}\nDescription: ${scheme.description || "Not provided"}\nCategories: ${scheme.categories?.join(", ") || ""}\nTags: ${scheme.tags?.join(", ") || ""}\nBeneficiary: ${scheme.beneficiary_type || "Not specified"}`
          }
        ]
      })
    });

    if (!response.ok) throw new Error("AI service unavailable");

    const data = await response.json();
    const explanation = data.choices[0].message.content.trim();
    
    // Save generated explanation to DB for next time
    scheme.ai_explanation = explanation;
    await scheme.save();

    return res.status(200).json({
      success: true,
      schemeId: scheme._id,
      schemeName: scheme.scheme_name,
      explanation
    });
  } catch (err) {
    return res.status(503).json({ success: false, message: "AI service unavailable" });
  }
};
