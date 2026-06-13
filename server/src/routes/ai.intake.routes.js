import express from "express";
import { aiIntakeController } from "../controllers/ai.intake.controller.js";

const router = express.Router();

router.post("/intake", aiIntakeController);

export default router;
