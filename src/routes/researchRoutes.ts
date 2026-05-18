import { Router } from "express";
import {
  createResearch,
  getResearch,
  streamResearchProgress,
  getResearchHistory,
  getMetrics,
} from "../controllers/researchController";

const router = Router();

router.post("/", createResearch);
router.get("/history", getResearchHistory);
router.get("/metrics", getMetrics);
router.get("/:id", getResearch);
router.get("/:id/stream", streamResearchProgress);

export default router;
