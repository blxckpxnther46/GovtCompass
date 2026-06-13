// services/alternatives.service.js

const FIELD_TO_SCHEME_KEY = {
  category: "categories",
  subCategory: "sub_categories",
  tag: "tags",
};

const REASON_LABELS = {
  category: "Category",
  subCategory: "Sub Category",
  tag: "Tag",
};

export const findAlternatives = (
  failedCriteria,
  allSchemes,
  currentSchemeId,
  maxAlternatives = 3
) => {
  const alternativesMap = new Map();

  failedCriteria.forEach((criterion) => {
    const schemeKey = FIELD_TO_SCHEME_KEY[criterion.field];
    if (!schemeKey || !criterion.expected) return;

    allSchemes.forEach((scheme) => {
      if (String(scheme._id) === String(currentSchemeId)) return;

      const values = scheme[schemeKey];
      if (!Array.isArray(values) || !values.includes(criterion.expected)) {
        return;
      }

      const key = String(scheme._id);
      const reason = `Matches ${REASON_LABELS[criterion.field]}: ${criterion.expected}`;

      if (alternativesMap.has(key)) {
        alternativesMap.get(key).reasons.add(reason);
      } else {
        alternativesMap.set(key, {
          _id: scheme._id,
          scheme_name: scheme.scheme_name,
          reasons: new Set([reason]),
        });
      }
    });
  });

  return Array.from(alternativesMap.values())
    .map(({ _id, scheme_name, reasons }) => ({
      _id,
      scheme_name,
      reason: Array.from(reasons).join("; "),
    }))
    .slice(0, maxAlternatives);
};