export const aiEligibilityController = async (req, res) => {
  const { schemeId, failedCriteria, profile } = req.body;
  if (!schemeId || !failedCriteria || !profile) {
    return res.status(400).json({ success: false, message: "schemeId, failedCriteria, and profile are required" });
  }

  try {
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
            content: `You are an eligibility advisor for Indian government schemes. Be specific, actionable, and empathetic. Speak directly to the user.`
          },
          {
            role: "user",
            content: `A user is interested in a government scheme but doesn't fully qualify. Based on the gap analysis below, explain in 2-3 sentences why they do not qualify and what concrete steps they could take to find a better match or become eligible.

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
      })
    });

    if (!response.ok) throw new Error("AI service unavailable");

    const data = await response.json();
    const advice = data.choices[0].message.content.trim();
    
    return res.status(200).json({
      success: true,
      schemeId,
      advice
    });
  } catch (err) {
    return res.status(503).json({ success: false, message: "AI service unavailable" });
  }
};
