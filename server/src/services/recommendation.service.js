// recommendation.service.js

import {
  RECOMMENDATION_WEIGHTS,
} from "../constants/recommendation.constants.js";

import { findAlternatives } from "./alternatives.service.js";

const calculateMaxScore = (userProfile) => {
  let max = 0;

  if (userProfile.category) max += RECOMMENDATION_WEIGHTS.CATEGORY;
  if (userProfile.subCategory) max += RECOMMENDATION_WEIGHTS.SUB_CATEGORY;
  if (userProfile.beneficiaryType) max += RECOMMENDATION_WEIGHTS.BENEFICIARY;
  max += RECOMMENDATION_WEIGHTS.STATE; // state check always applies

  const userTags = Array.isArray(userProfile.tags) ? userProfile.tags : [];
  max += userTags.length * RECOMMENDATION_WEIGHTS.TAG;

  return max;
};


export const calculateScore = (
  userProfile,
  scheme
) => {
  const maxScore = calculateMaxScore(userProfile);
  let score = 0;

  const matched = [];
  const failedCriteria = [];

  // Category
  if (userProfile.category) {
    if (scheme.categories?.includes(userProfile.category)) {
      score += RECOMMENDATION_WEIGHTS.CATEGORY;
      matched.push(`Category: ${userProfile.category}`);
    } else {
      failedCriteria.push({
        field: "category",
        expected: userProfile.category,
        actual: scheme.categories || []
      });
    }
  }

  // Sub Category
  if (userProfile.subCategory) {
    if (scheme.sub_categories?.includes(userProfile.subCategory)) {
      score += RECOMMENDATION_WEIGHTS.SUB_CATEGORY;
      matched.push(`Sub Category: ${userProfile.subCategory}`);
    } else {
      failedCriteria.push({
        field: "subCategory",
        expected: userProfile.subCategory,
        actual: scheme.sub_categories || []
      });
    }
  }

  // Tags
  const userTags = Array.isArray(userProfile.tags) ? userProfile.tags : [];

  const matchingTags = userTags.filter((tag) =>
    scheme.tags?.includes(tag)
  );

  score += matchingTags.length * RECOMMENDATION_WEIGHTS.TAG;

  matchingTags.forEach((tag) => matched.push(`Tag: ${tag}`));

  // Restrictive Tag Checking (defines what they fail)
  const RESTRICTIVE_GROUPS = [
    {
      name: "Gender",
      tags: ["Women", "Girl", "Female", "Transgender", "Third Gender", "Male"],
      describeMismatch: (schemeTags) => {
        const allowed = schemeTags.filter(t => ["Women", "Girl", "Female", "Transgender", "Third Gender", "Male"].includes(t));
        return `Requires Gender: ${allowed.join(" or ")}`;
      }
    },
    {
      name: "Caste",
      tags: ["SC", "Scheduled Caste", "Scheduled Castes", "ST", "Scheduled Tribe", "Scheduled Tribes", "OBC", "Other Backward Class", "Other Backward Classes", "EWS", "Economically Weaker Section", "General"],
      describeMismatch: (schemeTags) => {
        const allowed = schemeTags.filter(t => ["SC", "ST", "OBC", "EWS", "General", "Scheduled Caste", "Scheduled Tribe", "Other Backward Class", "Economically Weaker Section"].includes(t));
        const normalized = allowed.map(t => {
          if (t.includes("Scheduled Caste")) return "SC";
          if (t.includes("Scheduled Tribe")) return "ST";
          if (t.includes("Other Backward")) return "OBC";
          if (t.includes("Economically Weaker")) return "EWS";
          return t;
        });
        const unique = [...new Set(normalized)];
        return `Requires Category: ${unique.join(" or ")}`;
      }
    },
    {
      name: "Occupation",
      tags: ["Farmer", "Agriculture", "Student", "Scholarship", "Education", "Self Employed", "Entrepreneur", "Business", "Unemployed", "Job Seeker", "Salaried", "Employee", "Homemaker", "Senior Citizen"],
      describeMismatch: (schemeTags) => {
        const allowed = schemeTags.filter(t => ["Farmer", "Agriculture", "Student", "Scholarship", "Education", "Self Employed", "Entrepreneur", "Business", "Unemployed", "Job Seeker", "Salaried", "Employee", "Homemaker", "Senior Citizen"].includes(t));
        const normalized = allowed.map(t => {
          if (t === "Agriculture") return "Farmer";
          if (t === "Scholarship" || t === "Education") return "Student";
          if (t === "Entrepreneur" || t === "Business") return "Business Owner";
          if (t === "Job Seeker") return "Unemployed";
          if (t === "Employee") return "Salaried";
          return t;
        });
        const unique = [...new Set(normalized)];
        return `Requires Occupation: ${unique.join(" or ")}`;
      }
    }
  ];

  RESTRICTIVE_GROUPS.forEach(group => {
    const schemeHasGroup = (scheme.tags || []).some(t => group.tags.includes(t));
    if (schemeHasGroup) {
      const userHasGroupMatch = (scheme.tags || []).some(t => group.tags.includes(t) && userTags.includes(t));
      if (!userHasGroupMatch) {
        failedCriteria.push({
          field: "tag",
          expected: group.describeMismatch(scheme.tags || []),
          actual: scheme.tags || []
        });
      }
    }
  });

  // Disability Support check
  const schemeRequiresDisability = (scheme.tags || []).some(t => ["Person With Disabilities", "Person With Disability", "Persons With Disability", "PwD"].includes(t));
  const userHasDisability = userTags.some(t => ["Person With Disabilities", "Person With Disability", "Persons With Disability", "PwD"].includes(t));
  if (schemeRequiresDisability && !userHasDisability) {
    failedCriteria.push({
      field: "tag",
      expected: "Requires: Disability Support",
      actual: scheme.tags || []
    });
  }

  // Senior Citizens check
  const schemeRequiresSenior = (scheme.tags || []).some(t => ["Senior Citizens", "Old Age Pension", "Pension", "Family Pension"].includes(t));
  const userHasSenior = userTags.some(t => ["Senior Citizens", "Old Age Pension", "Pension", "Family Pension"].includes(t));
  if (schemeRequiresSenior && !userHasSenior) {
    failedCriteria.push({
      field: "tag",
      expected: "Requires: Senior Citizen status",
      actual: scheme.tags || []
    });
  }

  // Beneficiary
  if (userProfile.beneficiaryType) {
    if (scheme.beneficiary_type?.toLowerCase() === userProfile.beneficiaryType.toLowerCase()) {
      score += RECOMMENDATION_WEIGHTS.BENEFICIARY;
      matched.push(`Beneficiary: ${userProfile.beneficiaryType}`);
    } else {
      failedCriteria.push({
        field: "beneficiaryType",
        expected: userProfile.beneficiaryType,
        actual: scheme.beneficiary_type
      });
    }
  }

  // State
  if (
    !scheme.state ||
    scheme.state === userProfile.state
  ) {
    score += RECOMMENDATION_WEIGHTS.STATE;
    matched.push("State Eligible");
  }
  else {
    failedCriteria.push({
      field: "state",
      expected: userProfile.state,
      actual: scheme.state
    });
  }

  const matchPercentage = Math.min(
    Math.round((score / (maxScore > 0 ? maxScore : 1)) * 100),
    100
  );

  return {
    score,
    matchPercentage,
    matched,
    failedCriteria
  };
};

export const rankSchemes = (userProfile, schemes) => {
  return schemes
    .map((scheme) => {
      const result = calculateScore(userProfile, scheme);
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
          scheme_open_date: scheme.scheme_open_date,
        },
        matching_data: {
          score: result.score,
          matchPercentage: result.matchPercentage,
          matched: result.matched,
          failedCriteria: result.failedCriteria,
        }
      };
    })
    .filter((scheme) => scheme.matching_data.matchPercentage >= 60)
    .sort((a, b) => b.matching_data.score - a.matching_data.score);
};

export const attachAlternatives = (results, allSchemes) => {
  return results.map((r) => {
    if (r.matching_data.matchPercentage < 70) {
      r.matching_data.alternatives = findAlternatives(r.matching_data.failedCriteria, allSchemes, r.scheme_data._id);
    }
    return r;
  });
};