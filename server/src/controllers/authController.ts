import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // Nativo de Node.js, para generar tokens aleatorios
import { sendResetEmail } from "../services/emailService";

const prisma = new PrismaClient();

// Esquema de validación (Reglas de seguridad)
const registerSchema = z.object({
  email: z.string().email("Formato de correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().optional(),
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Usaremos variable de entorno

export const register = async (req: Request, res: Response) => {
  try {
    // 1. Validar datos de entrada
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.issues[0].message });
    }

    const { email, password, name } = validation.data;

    // 2. Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // 3. Encriptar contraseña (Nunca guardar texto plano)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Guardar en base de datos
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // 5. Responder (Excluyendo la contraseña por seguridad)
    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const googleRegister = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // 1. Verificar token con Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: "Token inválido" });

    const { email, name, sub: googleId } = payload;
    if (!email)
      return res.status(400).json({ error: "El correo es obligatorio" });

    // 2. Buscar o Crear Usuario
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name, googleId },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    // --- AQUÍ ES DONDE AGREGAS EL CÓDIGO DEL TOKEN ---

    // 3. Generar la "pulsera" (Token JWT) para usuarios de Google
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "8h" }
    );

    // 4. Respuesta Final (Agregamos 'token' al JSON)
    res.status(200).json({
      message: "Acceso con Google exitoso",
      token: jwtToken, // <--- ¡IMPORTANTE! Agregamos esto
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Falló la autenticación con Google" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 2. Verificar contraseña (si el usuario tiene password)
    // Nota: Si el usuario se registró con Google, 'password' es null.
    if (!user.password) {
      return res.status(400).json({
        error: "Este usuario se registró con Google. Por favor usa ese método.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 3. Generar la "pulsera" (Token JWT)
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // Datos dentro del token
      process.env.JWT_SECRET || "secret", // Llave maestra
      { expiresIn: "8h" } // Expira en 8 horas
    );

    res.json({
      message: "Bienvenido de nuevo",
      token, // Enviamos el token al frontend
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// 1. Solicitar el reseteo
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Por seguridad, no decimos si el usuario existe o no, para no dar pistas a hackers.
      return res
        .status(200)
        .json({ message: "Si el correo existe, se ha enviado un enlace." });
    }

    // Generar token seguro y fecha de expiración (1 hora)
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hora en milisegundos

    // Guardar en BD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Enviar email
    await sendResetEmail(user.email, token);

    res.json({ message: "Si el correo existe, se ha enviado un enlace." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

// 2. Ejecutar el cambio de contraseña
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Buscar usuario que tenga ese token Y que el token no haya expirado
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // gt = greater than (mayor que ahora)
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Token inválido o expirado" });
    }

    // Hashing de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar usuario y LIMPIAR el token (para que no se pueda usar dos veces)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar contraseña" });
  }
};
