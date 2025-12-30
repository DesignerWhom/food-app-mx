import { useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { API_URL } from "./config"; // Asegúrate de mantener la config de IP

// Agregamos la prop para recibir la función de navegación
interface Props {
  onSwitchToLogin: () => void;
}

export default function Register({ onSwitchToLogin }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      // Usamos la API_URL configurada (IP o localhost)
      await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name,
      });
      setSuccess(true);
      // Opcional: Podrías redirigir automáticamente al login después de unos segundos
    } catch (error: any) {
      setError(error.response?.data?.error || "Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen bg-gray-50 px-3">
        <Card className="w-full md:w-30rem shadow-4 text-center">
          <i className="pi pi-check-circle text-5xl text-green-500 mb-3"></i>
          <h2 className="text-900 font-bold mb-2">¡Cuenta Creada!</h2>
          <p className="text-600 mb-4">
            Tu registro fue exitoso. Ahora puedes iniciar sesión.
          </p>
          <Button label="Ir a Iniciar Sesión" onClick={onSwitchToLogin} />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-content-center align-items-center min-h-screen bg-gray-50 px-3">
      <Card title="Crear Cuenta" className="w-full md:w-30rem shadow-4">
        {error && (
          <Message severity="error" text={error} className="w-full mb-3" />
        )}

        <form onSubmit={handleSubmit} className="flex flex-column gap-3">
          <div>
            <label className="block text-900 font-medium mb-2">
              Nombre Completo
            </label>
            <InputText
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-900 font-medium mb-2">Email</label>
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              type="email"
              required
            />
          </div>

          <div>
            <label className="block text-900 font-medium mb-2">
              Contraseña
            </label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              className="w-full"
              inputClassName="w-full"
              feedback={false} // Ocultamos la barra de fortaleza para simplificar visualmente
              required
            />
          </div>

          <Button
            label="Registrarse"
            icon="pi pi-user-plus"
            loading={loading}
            className="w-full mt-2"
          />
        </form>

        <Divider align="center">
          <span className="text-600 font-normal text-sm">O</span>
        </Divider>

        {/* BOTÓN PARA REGRESAR AL LOGIN */}
        <div className="text-center">
          <span className="text-600 mr-2">¿Ya tienes cuenta?</span>
          <Button
            label="Inicia sesión aquí"
            link
            onClick={onSwitchToLogin}
            className="p-0 font-bold"
          />
        </div>
      </Card>
    </div>
  );
}
