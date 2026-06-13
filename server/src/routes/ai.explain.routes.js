import express from "express";
import { aiExplainController } from "../controllers/ai.explain.controller.js";

const router = express.Router();

router.post("/explain", aiExplainController);

export default router;
