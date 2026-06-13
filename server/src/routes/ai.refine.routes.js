import express from "express";
import { aiRefineController } from "../controllers/ai.refine.controller.js";

const router = express.Router();

router.post("/refine", aiRefineController);

export default router;
