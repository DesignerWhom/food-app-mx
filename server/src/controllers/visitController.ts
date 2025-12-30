import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const registerVisit = async (req: Request, res: Response) => {
  try {
    const { userId, placeId } = req.body;

    if (!userId || !placeId) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const uId = parseInt(userId);
    const pId = parseInt(placeId);

    // 1. Validar si ya hizo check-in HOY (últimas 24 horas)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const existingVisit = await prisma.visit.findFirst({
      where: {
        userId: uId,
        placeId: pId,
        createdAt: { gte: yesterday }, // Mayor o igual a hace 24h
      },
    });

    if (existingVisit) {
      return res
        .status(400)
        .json({ error: "Ya registraste tu visita hoy. Vuelve mañana." });
    }

    // 2. Registrar la visita y aumentar contador (Transacción)
    const [visit, updatedPlace] = await prisma.$transaction([
      prisma.visit.create({
        data: { userId: uId, placeId: pId },
      }),
      prisma.place.update({
        where: { id: pId },
        data: { visitCount: { increment: 1 } },
      }),
    ]);

    res.status(201).json({ visit, newCount: updatedPlace.visitCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar visita" });
  }
};
