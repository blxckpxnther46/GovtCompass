// src/routes/recommendation.routes.js

import express from "express";
import {
  recommendSchemes,
  scoreSingleScheme,
} from "../controllers/recommendation.controller.js";

const router = express.Router();

router.post("/", recommendSchemes);
router.post("/score-single", scoreSingleScheme);

export default router;