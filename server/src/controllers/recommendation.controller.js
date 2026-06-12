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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const schemes = await Scheme.find();

    const recommendations =
      generateRecommendations(
        userProfile,
        schemes
      );
    const paginatedRecommendations = recommendations.slice(startIndex, endIndex);
      

    res.status(200).json({
        success: true,
        page,
        limit,
        total: recommendations.length,
        totalPages: Math.ceil(
            recommendations.length / limit
        ),
        count: paginatedRecommendations.length,
        data: paginatedRecommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};