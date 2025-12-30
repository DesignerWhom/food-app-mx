import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createReview = async (req: Request, res: Response) => {
  try {
    const { placeId, ratingService, ratingTime, ratingTaste, comment } =
      req.body;

    // Validaciones simples
    if (!placeId || !ratingService || !ratingTime || !ratingTaste) {
      return res
        .status(400)
        .json({ error: "Faltan calificaciones obligatorias" });
    }

    const review = await prisma.review.create({
      data: {
        placeId: parseInt(placeId),
        ratingService: parseInt(ratingService),
        ratingTime: parseInt(ratingTime),
        ratingTaste: parseInt(ratingTaste),
        comment: comment || null,
      },
    });

    // Opcional: Podríamos actualizar el contador de visitas o promedio aquí,
    // pero por ahora lo calcularemos en vivo en el frontend.

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar la reseña" });
  }
};

// --- NUEVA FUNCIÓN: DAR/QUITAR LIKE ---
export const toggleReviewLike = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body; // Enviaremos el ID del usuario logueado

    if (!userId)
      return res.status(401).json({ error: "Usuario no identificado" });

    const rId = parseInt(reviewId);
    const uId = parseInt(userId);

    // 1. Verificar si ya existe el like
    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: { userId: uId, reviewId: rId },
      },
    });

    if (existingLike) {
      // SI EXISTE -> LO BORRAMOS (DISLIKE)
      await prisma.reviewLike.delete({
        where: { id: existingLike.id },
      });
    } else {
      // NO EXISTE -> LO CREAMOS (LIKE)
      await prisma.reviewLike.create({
        data: { userId: uId, reviewId: rId },
      });
    }

    // 2. Contar cuántos likes tiene ahora esa reseña para actualizar el frontend
    const count = await prisma.reviewLike.count({
      where: { reviewId: rId },
    });

    // Retornamos si el usuario actual dio like (liked) y el total
    res.json({
      liked: !existingLike, // Si existía, ahora es false. Si no, true.
      count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar el like" });
  }
};
