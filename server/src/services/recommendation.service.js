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

  const missingTags = userTags.filter(
    (tag) => !scheme.tags?.includes(tag)
  );

  missingTags.forEach((tag) =>
    failedCriteria.push({
      field: "tag",
      expected: tag,
      actual: scheme.tags || [],
    })
  );

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
        _id: scheme._id,
        scheme_name: scheme.scheme_name,
        score: result.score,
        matchPercentage: result.matchPercentage,
        matched: result.matched,
        failedCriteria: result.failedCriteria,
      };
    })
    .filter((scheme) => scheme.score > 0)
    .sort((a, b) => b.score - a.score);
};

export const attachAlternatives = (results, allSchemes) => {
  return results.map((r) => {
    if (r.matchPercentage < 70) {
      r.alternatives = findAlternatives(r.failedCriteria, allSchemes, r._id);
    }
    return r;
  });
};