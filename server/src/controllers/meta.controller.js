// src/controllers/meta.controller.js

import { Scheme } from "../models/Scheme.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Scheme.distinct("categories");

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories.sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTags = async (req, res) => {
  try {
    const tags = await Scheme.distinct("tags");

    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags.sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};