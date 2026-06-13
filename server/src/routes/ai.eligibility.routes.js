import express from "express";
import { aiEligibilityController } from "../controllers/ai.eligibility.controller.js";

const router = express.Router();

router.post("/eligibility-gap", aiEligibilityController);

export default router;
