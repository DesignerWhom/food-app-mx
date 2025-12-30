import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Avatar } from "primereact/avatar";
import Register from "./Register";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import PlacesDashboard from "./PlacesDashboard";
import UserProfile from "./UserProfile";
import { API_URL, UPLOADS_URL } from "./config"; // Importamos la config de IP

interface UserInfo {
  name: string;
  profileImage: string;
}

function App() {
  const [view, setView] = useState<
    "login" | "register" | "forgot" | "app" | "profile"
  >("login");

  // Estado para guardar la info básica del usuario en la barra superior
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  // Función para cargar los datos del usuario (Nombre y Foto)
  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Usamos la IP configurada
        const res = await axios.get(`${API_URL}/api/users/${decoded.userId}`);

        setCurrentUser({
          name: res.data.name || "Usuario",
          // Construimos la URL completa de la imagen usando la IP
          profileImage: res.data.profileImage
            ? `${UPLOADS_URL}${res.data.profileImage}`
            : "",
        });
        setView("app");
      } catch (error) {
        console.error("Error cargando usuario", error);
        // Si el token es inválido, podríamos cerrar sesión automáticamente
        // localStorage.removeItem('token');
        // setView('login');
      }
    }
  };

  // Al iniciar, intentamos cargar el usuario si hay token
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const isResetUrl = window.location.pathname.includes("/reset-password");
  if (isResetUrl) return <ResetPassword />;

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setView("login");
  };

  return (
    <div>
      {/* --- VISTAS DE AUTENTICACIÓN --- */}

      {view === "login" && (
        <Login
          onSwitchToRegister={() => setView("register")}
          onForgotPassword={() => setView("forgot")}
          onLoginSuccess={() => fetchUserInfo()}
        />
      )}

      {/* AQUÍ ESTÁ EL CAMBIO PRINCIPAL: Limpiamos la vista de registro */}
      {view === "register" && (
        <Register onSwitchToLogin={() => setView("login")} />
      )}

      {view === "forgot" && <ForgotPassword onBack={() => setView("login")} />}

      {/* --- ÁREA PRIVADA (APP) --- */}
      {(view === "app" || view === "profile") && (
        <div className="flex flex-column h-screen w-full overflow-hidden surface-ground">
          {/* BARRA SUPERIOR (HEADER) */}
          <div
            className="flex justify-content-between align-items-center px-3 py-2 bg-white shadow-2 z-2 flex-none"
            style={{ height: "60px" }}
          >
            {/* Logo */}
            <h2
              className="m-0 text-xl font-bold cursor-pointer flex align-items-center gap-2"
              style={{ color: "var(--primary-color)" }}
              onClick={() => setView("app")}
            >
              <i
                className="pi pi-map-marker"
                style={{ fontSize: "1.5rem" }}
              ></i>
              <span className="hidden md:inline">Exquisitos</span>
            </h2>

            <div className="flex align-items-center gap-3">
              {/* PERFIL DE USUARIO */}
              {currentUser && (
                <div
                  className="flex align-items-center gap-2 cursor-pointer hover:surface-100 p-1 border-round transition-duration-200"
                  onClick={() => setView("profile")}
                >
                  <div className="flex flex-column align-items-end hidden md:flex">
                    <span className="font-bold text-900 text-sm">
                      {currentUser.name}
                    </span>
                  </div>
                  <Avatar
                    image={currentUser.profileImage}
                    icon={!currentUser.profileImage ? "pi pi-user" : undefined}
                    shape="circle"
                    size="large"
                    className="surface-200 text-700"
                  />
                </div>
              )}

              {/* Separador */}
              <div className="w-1px h-2rem surface-300 mx-1"></div>

              <button
                onClick={handleLogout}
                className="p-button p-component p-button-text p-button-secondary font-bold cursor-pointer border-none bg-transparent flex align-items-center"
                title="Cerrar Sesión"
              >
                <i className="pi pi-sign-out text-xl"></i>
              </button>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="flex-grow-1 relative h-full w-full overflow-hidden">
            {view === "app" && <PlacesDashboard />}
            {view === "profile" && (
              <UserProfile
                onBack={() => setView("app")}
                onProfileUpdate={() => fetchUserInfo()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
