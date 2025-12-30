import { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import LocationPicker from "./components/LocationPicker";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreatePlace({ onSuccess, onCancel }: Props) {
  // --- ESTADOS ---
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState(null);
  const [costRange, setCostRange] = useState(null); // <--- NUEVO ESTADO
  const [menu, setMenu] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const categories = [
    { name: "Mexicana", code: "MX" },
    { name: "Italiana", code: "IT" },
    { name: "Japonesa", code: "JP" },
    { name: "Comida Rápida", code: "FF" },
    { name: "Postres", code: "DE" },
  ];

  // Opciones de Costo
  const costOptions = [
    { label: "Económico ($)", value: "$" },
    { label: "Moderado ($$)", value: "$$" },
    { label: "Costoso ($$$)", value: "$$$" },
  ];

  useEffect(() => {
    // Limpiar formulario al abrir
    setName("");
    setAddress("");
    setCategory(null);
    setCostRange(null);
    setMenu("");
    setLocation(null);
    setMsg(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setMsg({ type: "error", text: "Debes iniciar sesión." });
      return;
    }

    if (!location) {
      setMsg({
        type: "error",
        text: "Por favor selecciona la ubicación en el mapa.",
      });
      return;
    }

    try {
      setLoading(true);
      const decoded: any = jwtDecode(token);

      await axios.post("http://192.168.68.61:3000/api/places", {
        name,
        address,
        category,
        costRange, // <--- ENVIAMOS EL COSTO
        menu,
        latitude: location.lat,
        longitude: location.lng,
        userId: decoded.userId,
      });

      setMsg({ type: "success", text: "¡Lugar registrado correctamente!" });

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error(error);
      setMsg({ type: "error", text: "Error al guardar el lugar." });
      setLoading(false);
    }
  };

  return (
    <div className="p-fluid">
      {msg && (
        <Message severity={msg.type} text={msg.text} className="w-full mb-3" />
      )}

      <form onSubmit={handleSubmit} className="flex flex-column gap-3">
        <div className="flex flex-column gap-2">
          <label htmlFor="name" className="font-bold">
            Nombre del Lugar *
          </label>
          <InputText
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ej. Tacos El Pastor"
          />
        </div>

        <LocationPicker
          onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
        />

        <div className="flex flex-column gap-2">
          <label htmlFor="address" className="font-bold">
            Dirección *
          </label>
          <InputTextarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            required
            autoResize
          />
        </div>

        {/* FILA: CATEGORÍA Y COSTO JUNTOS */}
        <div className="flex gap-3">
          <div className="flex-1 flex flex-column gap-2">
            <label className="font-bold">Categoría *</label>
            <Dropdown
              value={category}
              onChange={(e) => setCategory(e.value)}
              options={categories}
              optionLabel="name"
              optionValue="name"
              placeholder="Selecciona"
              required
            />
          </div>
          <div className="flex-1 flex flex-column gap-2">
            <label className="font-bold">Costo</label>
            <Dropdown
              value={costRange}
              onChange={(e) => setCostRange(e.value)}
              options={costOptions}
              optionLabel="label"
              placeholder="Rango"
            />
          </div>
        </div>

        <div className="flex flex-column gap-2">
          <label htmlFor="menu" className="font-bold">
            Menú (Lista rápida de precios)
          </label>
          <InputTextarea
            id="menu"
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
            rows={5}
            placeholder={"- Platillo 1: $100\n- Platillo 2: $150"}
            autoResize
          />
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            onClick={onCancel}
            type="button"
            className="w-6"
          />
          <Button
            label="Registrar Lugar"
            icon="pi pi-check"
            loading={loading}
            className="w-6"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
