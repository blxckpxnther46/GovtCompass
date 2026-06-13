// server/src/controllers/analyze.controller.js

import { Scheme } from "../models/Scheme.js";
import { rankSchemes, attachAlternatives } from "../services/recommendation.service.js";
import { CATEGORY_MAP, SUB_CATEGORY_MAP, TAG_MAP } from "../constants/category.mapping.js";

// Maps onboarding `goal` answers → scheme.categories[] values
const GOAL_TO_CATEGORY = {
  "Scholarships & Education":    "Education & Learning",
  "Education":                   "Education & Learning",
  "Healthcare":                  "Health & Wellness",
  "Health":                      "Health & Wellness",
  "Agriculture":                 "Agriculture,Rural & Environment",
  "Business & Entrepreneurship": "Business & Entrepreneurship",
  "Business":                    "Business & Entrepreneurship",
  "Housing":                     "Housing & Shelter",
  "Employment":                  "Skills & Employment",
  "Skill Development":           "Skills & Employment",
  "Women Empowerment":           "Women and Child",
  "Financial Assistance":        "Banking,Financial Services and Insurance",
  "Transport":                   "Transport & Infrastructure",
  "Utility":                     "Utility & Sanitation",
  "Sanitation":                  "Utility & Sanitation",
  "Science & Technology":        "Science, IT & Communications",
  "Social Welfare":              "Social welfare & Empowerment",
};

// Maps onboarding `goal` answers → scheme.sub_categories[] values
const GOAL_TO_SUB_CATEGORY = {
  "Scholarships & Education": "Scholarships and student finance",
  "Skill Development":        "Training and Skill Up-gradation",
  "Employment":               "Employment services and jobs",
};

// Maps onboarding `occupation` → scheme.tags[] values
const OCCUPATION_TO_TAGS = {
  "Student":       ["Student"],
  "Farmer":        ["Farmer", "Agriculture"],
  "Unemployed":    ["Unemployed", "Job Seeker"],
  "Self Employed": ["Self Employed", "Entrepreneur"],
  "Salaried":      ["Salaried"],
  "Business":      ["Business", "Entrepreneur"],
};

// Maps onboarding `category` (caste) → scheme.tags[] values
const CASTE_TO_TAGS = {
  "SC":      ["SC", "Scheduled Caste", "Scheduled Castes"],
  "ST":      ["ST", "Scheduled Tribe", "Scheduled Tribes"],
  "OBC":     ["OBC", "Other Backward Class", "Other Backward Classes"],
  "EWS":     ["EWS", "Economically Weaker Section"],
  "General": ["General"],
};

// Maps onboarding `gender` → scheme.tags[] values
const GENDER_TO_TAGS = {
  "Female": ["Women", "Girl", "Female"],
  "Male":   ["Male"],
  "Other":  ["Transgender", "Third Gender"],
};

function buildProfileFromAnswers(answers) {
  const {
    state,
    category: casteCategory, // "OBC" etc — this is caste, NOT scheme.categories
    gender,
    disability,
    incomeRange,
    ageRange,
    educationLevel,
  } = answers;
  
  const occupation = answers.occupation || answers.bestProfileType;
  const goal = answers.goal || answers.primaryGoal;

  // --- Engine-facing fields ---

  // profile.category must match scheme.categories[] — derived from goal
  const schemeCategory =
    GOAL_TO_CATEGORY[goal] ?? CATEGORY_MAP[goal] ?? null;

  // profile.subCategory must match scheme.sub_categories[] — derived from goal
  const schemeSubCategory =
    GOAL_TO_SUB_CATEGORY[goal] ?? SUB_CATEGORY_MAP[goal] ?? null;

  // profile.tags must match scheme.tags[] — assembled from caste, gender, occupation, disability
  const tags = new Set();

  (CASTE_TO_TAGS[casteCategory] || []).forEach((t) => tags.add(t));
  (GENDER_TO_TAGS[gender] || []).forEach((t) => tags.add(t));
  (OCCUPATION_TO_TAGS[occupation] || []).forEach((t) => tags.add(t));

  if (disability && disability !== "No") {
    (TAG_MAP["Disability Support"] || []).forEach((t) => tags.add(t));
  }

  if (ageRange === "60+" || ageRange === "55-60") {
    (TAG_MAP["Senior Citizens"] || []).forEach((t) => tags.add(t));
  }

  const profile = {
    // Display/passthrough fields (shown in response, not used by engine)
    state:          state        ?? null,
    gender,
    incomeRange,
    ageRange,
    educationLevel,
    occupation,
    goal,
    casteCategory:  casteCategory ?? null, // kept separately for display

    // Engine-facing fields (must match scheme document field values)
    category:    schemeCategory,    // → scheme.categories[]
    subCategory: schemeSubCategory, // → scheme.sub_categories[]
    tags:        [...tags],         // → scheme.tags[]
  };

  // Remove nulls/undefineds so engine doesn't score against missing fields
  Object.keys(profile).forEach((k) => {
    if (profile[k] == null || profile[k] === "") delete profile[k];
  });

  return profile;
}

async function analyzeController(req, res) {
  const session = req.session || {};

  let answers = Object.keys(req.body || {}).length > 0
    ? { ...req.body }
    : { ...(session.answers || {}) };

  // Step 1: Free text intake
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
              content: `You are a profile extraction assistant for an Indian government scheme recommender.\nExtract structured fields from the user's free text. Return ONLY a JSON object with any of these fields if mentioned:\n{\n  "state": string,\n  "category": string,      // Caste: "SC" | "ST" | "OBC" | "EWS" | "General"\n  "gender": string,        // "Male" | "Female" | "Other"\n  "incomeRange": string,   // "0-5k" | "5k-10k" | "10k-25k" | "25k+"\n  "ageRange": string,      // "18-24" | "25-35" | "36-50" | "50-60" | "60+"\n  "educationLevel": string,// "Below 10th" | "10th" | "12th" | "Graduate" | "Postgraduate"\n  "occupation": string,    // "Student" | "Farmer" | "Unemployed" | "Self Employed" | "Salaried"\n  "goal": string           // "Scholarships & Education" | "Healthcare" | "Agriculture" | "Business & Entrepreneurship" | "Housing" | "Employment" | "Skill Development" | "Women Empowerment" | "Financial Assistance"\n}\nOnly include fields you are confident about. Return nothing else — no explanation, no markdown, no code fences.`
            },
            {
              role: "user",
              content: answers.freeText
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices[0].message.content.trim();
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        // Merge extracted fields into answers — explicit fields take priority
        answers = { ...parsed, ...answers };
      }
    } catch (err) {
      // Skip silently if AI call fails
    }
  }

  const profile = buildProfileFromAnswers(answers);

  const limit      = parseInt(req.query.limit) || 10;
  const page       = parseInt(req.query.page)  || 1;
  const startIndex = (page - 1) * limit;
  const endIndex   = startIndex + limit;

  try {
    const query = {};
    if (profile.state) {
      query.$or = [
        { state: profile.state },
        { state: null },
        { state: { $exists: false } },
        { state: "" }
      ];
    }
    const schemes = await Scheme.find(query);
    const ranked           = rankSchemes(profile, schemes);
    const paginated        = ranked.slice(startIndex, endIndex);
    const withAlternatives = attachAlternatives(paginated, schemes);

    return res.status(200).json({
      success: true,
      message: "Analysis complete",
      profile,
      recommendedSchemes: withAlternatives,
      page,
      limit,
      total:      ranked.length,
      totalPages: Math.ceil(ranked.length / limit),
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Analysis failed",
    });
  }
}

export { analyzeController };