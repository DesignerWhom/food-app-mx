import { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import axios from "axios";

interface Props {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://192.168.68.61:3000/api/auth/request-reset", {
        email,
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen surface-ground">
      <Card title="Recuperar Contraseña" className="w-full md:w-30rem shadow-4">
        {status === "success" ? (
          <div className="text-center">
            <i className="pi pi-check-circle text-green-500 text-5xl mb-3"></i>
            <p>Si el correo existe, recibirás instrucciones en breve.</p>
            <Button
              label="Volver al inicio"
              onClick={onBack}
              className="mt-3 w-full"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-column gap-3">
            <p>Ingresa tu correo y te enviaremos un enlace de recuperación.</p>
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
            <Button
              label="Enviar enlace"
              icon="pi pi-send"
              className="w-full"
            />
            <Button
              label="Cancelar"
              link
              onClick={onBack}
              className="w-full text-center"
              type="button"
            />
          </form>
        )}
      </Card>
    </div>
  );
}
