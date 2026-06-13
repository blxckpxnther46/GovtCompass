// src/constants/category.mapping.js

export const CATEGORY_MAP = {
  "Education": "Education & Learning",
  "Healthcare": "Health & Wellness",
  "Agriculture": "Agriculture,Rural & Environment",
  "Business": "Business & Entrepreneurship",
  "Startups": "Business & Entrepreneurship",
  "Housing": "Housing & Shelter",
  "Employment": "Skills & Employment",
  "Skill Development": "Skills & Employment",
  "Women Empowerment": "Women and Child",
  "Financial Assistance": "Banking,Financial Services and Insurance",
  "Transport": "Transport & Infrastructure",
  "Utility": "Utility & Sanitation",
  "Sanitation": "Utility & Sanitation",
  "Science & Technology": "Science, IT & Communications",

  // These don't have a dedicated top-level category in your DB —
  // they likely live under "Social welfare & Empowerment" as
  // sub_categories or tags. Verify with a distinct() on tags
  // before mapping these:
  // "Disability Support": "Social welfare & Empowerment",
  // "Senior Citizens": "Social welfare & Empowerment",
};

export const SUB_CATEGORY_MAP = {
  "Scholarship": "Scholarships and student finance",
  "Scholarships": "Scholarships and student finance",
  "Pension": "Pension",
  "Health Insurance": "Health Insurance",
  "Loan": "Loan",
  "Microfinance": "Micro finance",
  "Entrepreneurship": "Entrepreneurship development",
  "Startup": "Setting up / start-up / entrepreneurship",
  "Skill Training": "Training and Skill Up-gradation",
  "Jobs": "Employment services and jobs",
  "Food Security": "Food Security / Public Distribution System",
  "Electricity": "Electricity",
  "LPG": "LPG cylinder",
};

export const TAG_MAP = {
  "Disability Support": ["Person With Disabilities", "Person With Disability", "Persons With Disability", "PwD"],
  "Senior Citizens": ["Old Age Pension", "Pension", "Family Pension"],
};