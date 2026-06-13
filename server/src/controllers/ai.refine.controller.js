export const aiRefineController = async (req, res) => {
  const { query, schemes } = req.body;
  if (!query || !schemes || !Array.isArray(schemes)) {
    return res.status(400).json({ success: false, message: "query and schemes array are required" });
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
            content: `You are a scheme filter assistant. The user has a list of recommended government schemes and wants to refine them with a natural language query. Return ONLY a flat JSON array of scheme _id strings that match the user's query. No explanation, no markdown, no code fences.\nExample format: ["6a2c27a0013ca70f", "6a2c27a0013ca71a"]`
          },
          {
            role: "user",
            content: `User query: "${query}"\n\nSchemes:\n${JSON.stringify(schemes.map(s => ({
              _id: s._id,
              name: s.scheme_name || s.name,
              categories: s.categories,
              tags: s.tags,
              matched: s.matched
            })), null, 2)}\n\nReturn ONLY a JSON array of _id string values for schemes that match the query.`
          }
        ]
      })
    });

    if (!response.ok) throw new Error("AI service unavailable");

    const data = await response.json();
    const text = data.choices[0].message.content.trim();
    
    let filteredIds = [];
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      filteredIds = JSON.parse(clean);
      if (!Array.isArray(filteredIds) || filteredIds.length === 0) {
        throw new Error("Empty or invalid filter result");
      }
    } catch (e) {
      return res.status(200).json({ 
        success: true, 
        query, 
        filteredSchemes: schemes, 
        warning: "Could not apply filter, showing all results" 
      });
    }

    const filteredSchemes = schemes.filter(s => filteredIds.includes(s._id.toString()));

    return res.status(200).json({
      success: true,
      query,
      filteredSchemes
    });
  } catch (err) {
    return res.status(503).json({ success: false, message: "AI service unavailable" });
  }
};
