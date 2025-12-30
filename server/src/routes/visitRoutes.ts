import { Router } from "express";
import { registerVisit } from "../controllers/visitController";

const router = Router();

// POST /api/visits
router.post("/", registerVisit);

export default router;
