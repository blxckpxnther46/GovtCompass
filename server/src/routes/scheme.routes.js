// src/routes/scheme.routes.js

import express from "express";
import {
  getAllSchemes,
  getSchemeById,
  searchSchemes
} from "../controllers/scheme.controller.js";

const router = express.Router();

router.get("/", getAllSchemes);
router.get("/search", searchSchemes)
router.get("/:id", getSchemeById);

export default router;