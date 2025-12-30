import nodemailer from "nodemailer";

export const sendResetEmail = async (email: string, token: string) => {
  // 1. Crear una cuenta de prueba (Solo para desarrollo local)
  // Esto genera un inbox falso automático.
  const testAccount = await nodemailer.createTestAccount();

  // 2. Configurar el "transporte" (el cartero)
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // 3. El link que el usuario recibirá (apunta a nuestro Frontend)
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  // 4. Enviar el correo
  const info = await transporter.sendMail({
    from: '"Soporte Exquisitos" <no-reply@exquisitos.app>',
    to: email,
    subject: "Recuperación de contraseña",
    html: `
            <h3>Has solicitado restablecer tu contraseña</h3>
            <p>Usa el siguiente código o haz clic en el enlace:</p>
            <p><b>Código: ${token}</b></p>
            <a href="${resetLink}">Restablecer contraseña aquí</a>
            <p>Este enlace expira en 1 hora.</p>
        `,
  });

  console.log("Correo enviado: %s", info.messageId);
  // IMPORTANTE: Esto imprimirá un URL en la consola para que veas el correo
  console.log("Vista previa URL: %s", nodemailer.getTestMessageUrl(info));
};
