// src/routes/meta.routes.js

import express from "express";
import {
  getCategories,
  getTags,
} from "../controllers/meta.controller.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/tags", getTags);

export default router;