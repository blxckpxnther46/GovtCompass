import { fetchOpenRouter } from "../services/openrouter.service.js";

export const aiEligibilityController = async (req, res) => {
  const { schemeId, failedCriteria, profile } = req.body;
  if (!schemeId || !failedCriteria || !profile) {
    return res.status(400).json({ success: false, message: "schemeId, failedCriteria, and profile are required" });
  }

  try {
    const response = await fetchOpenRouter({
      model: "openrouter/auto",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an eligibility advisor for Indian government schemes. Be specific, actionable, and empathetic. Speak directly to the user.

You must respond ONLY with a valid JSON object, no markdown, no preamble, no code fences. Do not use markdown formatting (no **, no [], no links) inside any of the text values - plain text only.

The JSON object must have exactly this shape:
{
  "reasons": ["short bullet point explaining one reason for ineligibility", "..."],
  "next_steps": ["short, concrete, actionable bullet point", "..."]
}

Keep each bullet point to one sentence. Provide 1-3 reasons and 2-4 next steps.`
        },
        {
          role: "user",
          content: `A user is interested in a government scheme but doesn't fully qualify. Based on the gap analysis below, list out why they do not qualify and what concrete steps they could take to find a better match or become eligible.

IMPORTANT - How to read the Gap Analysis:
- "expected" is the attribute the USER has in their profile.
- "actual" is the attribute the SCHEME requires or supports.
For example, if field="tag", expected="OBC", and actual=["SC"], it means the user is OBC, but the scheme is only for SC.

Failed criteria:
${JSON.stringify(failedCriteria, null, 2)}

User profile:
${JSON.stringify(profile, null, 2)}`
        }
      ]
    });

    if (!response.ok) throw new Error("AI service unavailable");

    const data = await response.json();
    const raw = data.choices[0].message.content.trim();

    let advice;
    try {
      advice = JSON.parse(raw);
    } catch (parseErr) {
      // Fallback in case the model still wraps it in code fences or adds stray text
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Could not parse AI response as JSON");
      advice = JSON.parse(match[0]);
    }

    const reasonsArray = advice.reasons || advice.reason || [];
    const nextStepsArray = advice.next_steps || advice.nextSteps || advice.nextStep || [];

    if (!Array.isArray(reasonsArray) || !Array.isArray(nextStepsArray)) {
      throw new Error("AI response missing expected fields");
    }

    return res.status(200).json({
      success: true,
      schemeId,
      advice: {
        reasons: reasonsArray,
        nextSteps: nextStepsArray
      }
    });
  } catch (err) {
    return res.status(503).json({ success: false, message: "AI service unavailable" });
  }
};
