import { Router } from "express";
import { createPlace, getAllPlaces } from "../controllers/placeController"; // Importar getAllPlaces

const router = Router();

// POST /api/places (Crear)
router.post("/", createPlace);

// GET /api/places (Obtener todos) - NUEVA RUTA
router.get("/", getAllPlaces);

export default router;
