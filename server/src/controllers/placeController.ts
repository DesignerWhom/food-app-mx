import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPlace = async (req: Request, res: Response) => {
  try {
    // Extraemos los nuevos campos del body
    const {
      name,
      category,
      address,
      latitude,
      longitude,
      userId,
      menu,
      phone,
      costRange,
      openingHours,
      hasDelivery,
      deliveryApps,
      coverImage,
    } = req.body;

    if (!name || !category || !address || !latitude || !longitude || !userId) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const newPlace = await prisma.place.create({
      data: {
        name,
        category,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        userId: parseInt(userId),
        menu: menu || null,
        // Nuevos campos
        phone,
        costRange,
        openingHours,
        hasDelivery: hasDelivery || false,
        deliveryApps,
        coverImage,
        verified: false, // Por defecto false
        visitCount: 0,
      },
    });

    res.status(201).json(newPlace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno al registrar el lugar" });
  }
};

export const getAllPlaces = async (req: Request, res: Response) => {
  try {
    const places = await prisma.place.findMany({
      orderBy: {
        createdAt: "desc", // Los más recientes primero
      },
      // Opcional: incluir datos del usuario que lo creó
      include: {
        reviews: {
          include: {
            likes: true, // Traemos los likes para saber quién dio like
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });
    res.json(places);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los lugares" });
  }
};
