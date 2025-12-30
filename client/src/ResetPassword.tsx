import { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import axios from "axios";

export default function ResetPassword() {
  // Obtenemos el token de la URL (ej: ?token=xyz)
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) setToken(tokenParam);
    else setError("Token no encontrado en la URL");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://192.168.68.61:3000/api/auth/reset-password", {
        token,
        newPassword: password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al restablecer");
    }
  };

  if (success) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen surface-ground">
        <Card className="w-full md:w-30rem text-center">
          <i className="pi pi-check-circle text-green-500 text-5xl mb-3"></i>
          <h2>¡Contraseña Actualizada!</h2>
          <p>
            Ya puedes cerrar esta ventana e iniciar sesión con tu nueva
            contraseña.
          </p>
          <a href="/" className="p-button font-bold no-underline">
            Ir al Login
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-content-center align-items-center min-h-screen surface-ground">
      <Card title="Nueva Contraseña" className="w-full md:w-30rem shadow-4">
        {error && (
          <Message severity="error" text={error} className="w-full mb-3" />
        )}

        <form onSubmit={handleSubmit} className="flex flex-column gap-3">
          <div className="flex flex-column gap-2">
            <label>Ingresa tu nueva contraseña</label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              feedback={true}
              required
            />
          </div>
          <Button
            label="Cambiar Contraseña"
            icon="pi pi-check"
            className="w-full"
            disabled={!token}
          />
        </form>
      </Card>
    </div>
  );
}
