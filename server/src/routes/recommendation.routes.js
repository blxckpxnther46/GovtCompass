// src/routes/recommendation.routes.js

import express from "express";
import { recommendSchemes } from "../controllers/recommendation.controller.js";

const router = express.Router();

router.post("/", recommendSchemes);

export default router;