import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController";

const router = Router();

// --- CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Carpeta destino (debe existir)
  },
  filename: (req, file, cb) => {
    // Nombre único: fecha en milisegundos + extensión original (ej. 16788999.png)
    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filtro para aceptar solo imágenes (opcional pero recomendado)
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("No es un archivo de imagen válido"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
// ------------------------------

// GET /api/users/:userId
router.get("/:userId", getUserProfile);

// PUT /api/users/:userId
// Agregamos el middleware upload.single('image')
// 'image' es el nombre del campo que el frontend debe usar al enviar el archivo
router.put("/:userId", upload.single("image"), updateUserProfile);

export default router;
