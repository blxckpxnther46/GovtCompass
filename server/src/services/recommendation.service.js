// recommendation.service.js

export const calculateScore = (
  userProfile,
  scheme
) => {
  let score = 0;

  const matched = [];
  const failed = [];

  // Category
  if (
    userProfile.category &&
    scheme.categories?.includes(userProfile.category)
  ) {
    score += 30;
    matched.push(`Category: ${userProfile.category}`);
  }

  // Sub Category
  if (
    userProfile.subCategory &&
    scheme.sub_categories?.includes(
      userProfile.subCategory
    )
  ) {
    score += 25;
    matched.push(
      `Sub Category: ${userProfile.subCategory}`
    );
  }

  // Tags
  if (
    userProfile.tags &&
    Array.isArray(userProfile.tags)
  ) {
    const matchingTags =
      userProfile.tags.filter((tag) =>
        scheme.tags?.includes(tag)
      );

    score += matchingTags.length * 10;

    matchingTags.forEach((tag) =>
      matched.push(`Tag: ${tag}`)
    );
  }

  // Beneficiary
  if (
    userProfile.beneficiaryType &&
    scheme.beneficiary_type?.toLowerCase() ===
      userProfile.beneficiaryType.toLowerCase()
  ) {
    score += 15;
    matched.push(
      `Beneficiary: ${userProfile.beneficiaryType}`
    );
  }

  // State
  if (
    !scheme.state ||
    scheme.state === userProfile.state
  ) {
    score += 10;
    matched.push("State Eligible");
  }

  if (matched.length === 0) {
    failed.push("No matching criteria");
  }

  return {
    score,
    matched,
    failed,
  };
};
export const generateRecommendations = (
  userProfile,
  schemes
) => {
  return schemes
    .map((scheme) => {
      const result = calculateScore(
        userProfile,
        scheme
      );

      return {
        _id: scheme._id,
        scheme_name: scheme.scheme_name,
        score: result.score,
        matched: result.matched,
        failed: result.failed,
      };
    })
    .filter((scheme) => scheme.score > 0)
    .sort((a, b) => b.score - a.score);
};