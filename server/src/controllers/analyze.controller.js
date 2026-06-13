// server/src/controllers/analyze.controller.js

import { Scheme } from "../models/Scheme.js";

// Maps goal answers → MongoDB category field values
const GOAL_TO_CATEGORY = {
  "Scholarships & Education":    "Education & Learning",
  "Healthcare Support":          "Health & Wellness",
  "Healthcare":                  "Health & Wellness",
  "Agriculture Support":         "Agriculture,Rural & Environment",
  "Agriculture":                 "Agriculture,Rural & Environment",
  "Business Funding":            "Business & Entrepreneurship",
  "Startup Support":             "Business & Entrepreneurship",
  "Business & Entrepreneurship": "Business & Entrepreneurship",
  "Housing & Welfare":           "Housing & Shelter",
  "Housing":                     "Housing & Shelter",
  "Employment":                  "Skills & Employment",
  "Skill Development":           "Skills & Employment",
  "Women Empowerment":           "Women and Child",
  "Financial Assistance":        "Banking,Financial Services and Insurance",
  "Pension & Senior Benefits":   "Social welfare & Empowerment",
  "Social Welfare":              "Social welfare & Empowerment",
  "Transport":                   "Transport & Infrastructure",
  "Utility":                     "Utility & Sanitation",
  "Science & Technology":        "Science, IT & Communications",
};

async function analyzeController(req, res) {
  const session = req.session || {};

  let answers = Object.keys(req.body || {}).length > 0
    ? { ...req.body }
    : { ...(session.answers || {}) };

  // Step 1: Free text intake via AI
  if (answers.freeText) {
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
              content: `You are a profile extraction assistant for an Indian government scheme recommender.
Extract structured fields from the user's free text. Return ONLY a JSON object with any of these fields if mentioned:
{
  "state": string,
  "category": string,       // Caste: "SC" | "ST" | "OBC" | "EWS" | "General"
  "gender": string,         // "Male" | "Female" | "Other"
  "incomeRange": string,
  "ageRange": string,
  "educationLevel": string,
  "occupation": string,     // "Student" | "Farmer" | "Job Seeker" | "Business Owner" | "Employee" | "Homemaker" | "Senior Citizen"
  "goal": string
}
Only include fields you are confident about. Return nothing else.`
            },
            { role: "user", content: answers.freeText }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices[0].message.content.trim();
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        answers = { ...parsed, ...answers };
      }
    } catch (err) { /* skip silently */ }
  }

  // Extract all profile fields from answers
  const goal          = answers.goal || answers.primaryGoal || null;
  const occupation    = answers.occupation || answers.bestProfileType || null;
  const state         = answers.state || null;
  const gender        = answers.gender || null;
  const caste         = answers.category || answers.casteCategory || null;
  const ageRange      = answers.ageRange || null;
  const incomeRange   = answers.incomeRange || null;
  const educationLevel = answers.educationLevel || null;
  const disability    = answers.disability || null;

  const limit      = parseInt(req.query.limit) || 10;
  const page       = parseInt(req.query.page)  || 1;
  const startIndex = (page - 1) * limit;

  try {
    // Step 2: Smart DB Query — get candidates from MongoDB
    const schemeCategory = GOAL_TO_CATEGORY[goal] || null;

    const query = {};

    // State filter: always include null-state (central govt) schemes
    if (state) {
      query.$or = [
        { state: state },
        { state: null },
        { state: { $exists: false } },
        { state: "" },
      ];
    }

    // Category filter: use goal-derived category if available
    if (schemeCategory) {
      query.categories = schemeCategory;
    }

    let candidates = await Scheme.find(query).limit(100).lean();

    // Fallback: if too few results, broaden to remove category filter
    if (candidates.length < 20) {
      const broadQuery = state
        ? { $or: [{ state }, { state: null }, { state: { $exists: false } }, { state: "" }] }
        : {};
      candidates = await Scheme.find(broadQuery).limit(100).lean();
    }

    // Step 3: Pure AI ranking — let AI pick and score the best matches
    const schemePayload = candidates.map(s => ({
      id: s._id.toString(),
      name: s.scheme_name,
      categories: s.categories,
      tags: s.tags,
      eligibility: s.eligibility,
      brief_description: s.brief_description,
    }));

    const userProfileDesc = [
      state          ? `State: ${state}` : null,
      goal           ? `Goal: ${goal}` : null,
      occupation     ? `Occupation: ${occupation}` : null,
      gender         ? `Gender: ${gender}` : null,
      caste          ? `Caste/Category: ${caste}` : null,
      ageRange       ? `Age Range: ${ageRange}` : null,
      incomeRange    ? `Income Range: ${incomeRange}` : null,
      educationLevel ? `Education Level: ${educationLevel}` : null,
      disability && disability !== "No" ? `Has Disability: Yes` : null,
    ].filter(Boolean).join("\n");

    const systemPrompt = `You are an expert Indian government scheme eligibility advisor.
Given a user profile and a list of government schemes, identify which schemes this user is eligible for or most likely to benefit from.

For each relevant scheme, provide:
- An eligibility score from 0 to 100
- A list of matched criteria (why they qualify)
- A list of failed criteria (why they might not qualify), if any

Return ONLY valid JSON in exactly this format (no markdown, no preamble):
{
  "results": [
    {
      "id": "<scheme_id_string>",
      "score": <number 0-100>,
      "matched": ["<reason>", "<reason>"],
      "failed": ["<reason>"]
    }
  ]
}

Rules:
- Include ONLY schemes with score >= 40.
- Return a maximum of 20 results, sorted by score descending.
- Be inclusive: if a scheme broadly targets the user's occupation/goal, include it even if income/caste data is missing.
- A farmer should match all agriculture, farming, livestock, fisheries, horticulture schemes.
- A student should match all scholarship, education, youth schemes.`;

    const userPrompt = `USER PROFILE:
${userProfileDesc}

SCHEMES TO EVALUATE (${schemePayload.length} total):
${JSON.stringify(schemePayload)}`;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!aiResponse.ok) throw new Error(`AI service error: ${aiResponse.status}`);

    const aiData = await aiResponse.json();
    const aiRaw = aiData.choices[0].message.content.trim();

    let aiResults;
    try {
      aiResults = JSON.parse(aiRaw);
    } catch (e) {
      const match = aiRaw.match(/\{[\s\S]*\}/);
      if (match) aiResults = JSON.parse(match[0]);
      else throw new Error("Could not parse AI response as JSON");
    }

    const rankedByAI = (aiResults.results || []).sort((a, b) => b.score - a.score);

    // Build full scheme response objects
    const candidateMap = Object.fromEntries(candidates.map(s => [s._id.toString(), s]));

    const recommendedSchemes = rankedByAI
      .slice(startIndex, startIndex + limit)
      .map(r => {
        const scheme = candidateMap[r.id];
        if (!scheme) return null;
        return {
          scheme_data: {
            _id: scheme._id,
            scheme_name: scheme.scheme_name,
            ministry: scheme.ministry,
            department: scheme.department,
            beneficiary_type: scheme.beneficiary_type,
            detailed_description: scheme.detailed_description,
            benefits: scheme.benefits,
            eligibility: scheme.eligibility,
            application_mode: scheme.application_mode,
            application_process: scheme.application_process,
            documents_required: scheme.documents_required,
            references: scheme.references,
            brief_description: scheme.brief_description,
            categories: scheme.categories,
            tags: scheme.tags,
          },
          matching_data: {
            score: r.score,
            matchPercentage: r.score,
            matched: r.matched || [],
            failedCriteria: (r.failed || []).map(f => ({
              field: "ai_scan",
              expected: "Eligible",
              actual: f,
            })),
          }
        };
      })
      .filter(Boolean);

    const profile = {
      state, goal, occupation, gender,
      casteCategory: caste,
      ageRange, incomeRange, educationLevel,
    };

    return res.status(200).json({
      success: true,
      message: "Analysis complete",
      profile,
      recommendedSchemes,
      page,
      limit,
      total: rankedByAI.length,
      totalPages: Math.ceil(rankedByAI.length / limit),
    });

  } catch (err) {
    console.error("[analyzeController Error]:", err.message);
    res.status(500).json({
      success: false,
      message: err.message || "Analysis failed",
    });
  }
}

export { analyzeController };