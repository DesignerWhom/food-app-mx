import path from "path";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import placeRoutes from "./routes/placeRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import userRoutes from "./routes/userRoutes";
import visitRoutes from "./routes/visitRoutes";

const app = express();
const PORT = 3000;

// Middleware
app.use(
  cors({
    // Opción A (Más fácil): Permitir todo
    origin: "*",

    // Opción B (Más segura): Permitir tu IP específica
    // origin: ['http://localhost:5173', 'http://192.168.1.15:5173'],

    credentials: true,
  })
);
app.use(express.json()); // Permite leer JSON en las peticiones

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visits", visitRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
