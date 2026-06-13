// src/controllers/scheme.controller.js

import { Scheme } from "../models/Scheme.js";

const getAllSchemes = async (req, res) => {
  try {
    const { page: pageQuery, limit: limitQuery, state, level } = req.query;
    const page = parseInt(pageQuery) || 1;
    const limit = parseInt(limitQuery) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (state && state !== "All") query.state = state;
    if (level && level !== "All") query.level = level;

    const [schemes, total] = await Promise.all([
      Scheme.find(query)
        .select(
            "scheme_name short_title level categories benefit_type state brief_description description detailed_description"
        )
        .sort({ scheme_name: 1 })
        .skip(skip)
        .limit(limit),
      Scheme.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: schemes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const searchSchemes = async (req, res) => {
  const { q = "", state, level } = req.query;

  const query = {
    $or: [
      { scheme_name: { $regex: q, $options: "i" } },
      { categories: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } }
    ]
  };

  if (state && state !== "All") query.state = state;
  if (level && level !== "All") query.level = level;

  const schemes = await Scheme.find(query);

  res.json({
    success: true,
    data: schemes
  });
};

export {getAllSchemes, getSchemeById, searchSchemes}