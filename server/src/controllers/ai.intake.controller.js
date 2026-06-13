import { fetchOpenRouter } from "../services/openrouter.service.js";

export const aiIntakeController = async (req, res) => {
  const { freeText } = req.body;
  
  try {
    const response = await fetchOpenRouter({
      model: "openrouter/auto",
      messages: [
        {
          role: "system",
          content: `You are a profile extraction assistant for an Indian government scheme recommender.\nExtract structured fields from the user's free text. Return ONLY a JSON object with any of these fields if mentioned:\n{\n  "state": string,\n  "category": string,      // Caste: "SC" | "ST" | "OBC" | "EWS" | "General"\n  "gender": string,        // "Male" | "Female" | "Other"\n  "incomeRange": string,   // "0-5k" | "5k-10k" | "10k-25k" | "25k+"\n  "ageRange": string,      // "18-24" | "25-35" | "36-50" | "50-60" | "60+"\n  "educationLevel": string,// "Below 10th" | "10th" | "12th" | "Graduate" | "Postgraduate"\n  "occupation": string,    // "Student" | "Farmer" | "Unemployed" | "Self Employed" | "Salaried"\n  "goal": string           // "Scholarships & Education" | "Healthcare" | "Agriculture" | "Business & Entrepreneurship" | "Housing" | "Employment" | "Skill Development" | "Women Empowerment" | "Financial Assistance"\n}\nOnly include fields you are confident about. Return nothing else — no explanation, no markdown, no code fences.`
        },
        { role: "user", content: freeText || "" }
      ]
    });

    if (!response.ok) throw new Error("AI service unavailable");

    const data = await response.json();
    const text = data.choices[0].message.content.trim();
    
    let parsed = {};
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      return res.status(200).json({ success: false, message: "Could not parse profile from text" });
    }

    req.session = req.session || {};
    req.session.answers = { ...parsed, ...(req.session.answers || {}) };

    return res.status(200).json({
      success: true,
      extracted: parsed,
      merged: req.session.answers
    });
  } catch (err) {
    return res.status(503).json({ success: false, message: "AI service unavailable" });
  }
};
