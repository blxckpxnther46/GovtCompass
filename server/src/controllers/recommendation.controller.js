// src/controllers/recommendation.controller.js

import { Scheme } from "../models/Scheme.js";
import {
  generateRecommendations,
} from "../services/recommendation.service.js";

export const recommendSchemes = async (
  req,
  res
) => {
  try {
    const userProfile = req.body;
    
    const schemes = await Scheme.find();

    const recommendations =
      generateRecommendations(
        userProfile,
        schemes
      );

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations.slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};