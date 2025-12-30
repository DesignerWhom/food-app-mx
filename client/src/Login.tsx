import { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

// INTERFAZ ACTUALIZADA: Agregamos onLoginSuccess
interface LoginProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  onLoginSuccess: () => void; // <--- NUEVO
}

export default function Login({
  onSwitchToRegister,
  onForgotPassword,
  onLoginSuccess,
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://192.168.68.61:3000/api/auth/login",
        {
          email,
          password,
        }
      );
      localStorage.setItem("token", response.data.token);
      // Ya no mostramos alert, simplemente navegamos a la app
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await axios.post(
        "http://192.168.68.61:3000/api/auth/google",
        {
          token: credentialResponse.credential,
        }
      );
      localStorage.setItem("token", response.data.token);
      onLoginSuccess(); // Navegar a la app
    } catch (err) {
      setError("Error con Google");
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen surface-ground">
      <Card
        title="Bienvenido"
        subTitle="Inicia sesión en Exquisitos"
        className="w-full md:w-30rem shadow-4"
      >
        {error && (
          <Message severity="error" text={error} className="w-full mb-3" />
        )}

        <form onSubmit={handleLogin} className="flex flex-column gap-3">
          <div className="flex flex-column gap-2">
            <label htmlFor="email">Correo Electrónico</label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-column gap-2">
            <label htmlFor="password">Contraseña</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
            />
          </div>

          <div className="text-right">
            <Button
              label="¿Olvidaste tu contraseña?"
              link
              onClick={onForgotPassword}
              className="p-0 text-sm"
              type="button"
            />
          </div>

          <Button label="Ingresar" icon="pi pi-sign-in" className="w-full" />
        </form>

        <Divider align="center">
          <span className="p-tag">O</span>
        </Divider>

        <div className="flex justify-content-center w-full mb-3">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Falló Google")}
            theme="filled_blue"
            width="100%"
          />
        </div>

        <div className="text-center">
          <Button
            label="¿No tienes cuenta? Regístrate"
            link
            onClick={onSwitchToRegister}
          />
        </div>
      </Card>
    </div>
  );
}
