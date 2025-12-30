import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Obtener perfil
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params; // Recibimos ID por URL

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      // NO devolvemos la contraseña por seguridad
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        phone: true,
        city: true,
        country: true,
        birthDate: true,
        foodInterests: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

// Actualizar perfil
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    // Los datos de texto ahora vienen como strings dentro de req.body
    const {
      name,
      phone,
      city,
      country,
      birthDate,
      foodInterests,
      newPassword,
    } = req.body;

    let updateData: any = {
      name,
      phone,
      city,
      country,
      // foodInterests ya viene como string simple del FormData
      foodInterests: foodInterests || null,
      birthDate: birthDate ? new Date(birthDate) : null,
    };

    // --- LÓGICA DE IMAGEN ---
    // Si multer procesó un archivo, lo tendremos en req.file
    if (req.file) {
      // Guardamos la ruta relativa accesible desde el navegador
      // NOTA: Si estás en Windows, req.file.path usa backslashes (\).
      // Es mejor construir la URL manualmente para que sea estándar.
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }
    // ------------------------

    if (newPassword && newPassword.trim() !== "") {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
    });

    // Devolvemos el usuario actualizado (sin password)
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};
