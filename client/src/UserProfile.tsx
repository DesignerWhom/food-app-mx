import { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Password } from "primereact/password";
import { Message } from "primereact/message";
import { Avatar } from "primereact/avatar";
import { Divider } from "primereact/divider";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface Props {
  onBack: () => void;
  onProfileUpdate: () => void; // <--- NUEVA PROP: Para avisar que cambiamos datos
}

export default function UserProfile({ onBack, onProfileUpdate }: Props) {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Campos
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");

  // Imagen
  const [profileImage, setProfileImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const interestsOptions = [
    { label: "Mexicana", value: "Mexicana" },
    { label: "Italiana", value: "Italiana" },
    { label: "Japonesa", value: "Japonesa" },
    { label: "Comida Rápida", value: "Comida Rápida" },
    { label: "Vegana", value: "Vegana" },
    { label: "Postres", value: "Postres" },
    { label: "Mariscos", value: "Mariscos" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setUserId(decoded.userId);
      loadProfile(decoded.userId);
    }
  }, []);

  const loadProfile = async (id: number) => {
    try {
      const res = await axios.get(`http://192.168.68.61:3000/api/users/${id}`);
      const u = res.data;
      setName(u.name || "");
      setEmail(u.email || "");
      setPhone(u.phone || "");
      setCity(u.city || "");
      setCountry(u.country || "");
      if (u.birthDate) setBirthDate(new Date(u.birthDate));
      if (u.foodInterests) setSelectedInterests(u.foodInterests.split(","));
      if (u.profileImage)
        setProfileImage(`http://192.168.68.61:3000${u.profileImage}`);
    } catch (error) {
      console.error("Error cargando perfil");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!userId) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("city", city);
      formData.append("country", country);
      if (birthDate) formData.append("birthDate", birthDate.toISOString());
      formData.append("foodInterests", selectedInterests.join(","));
      if (newPassword) formData.append("newPassword", newPassword);
      if (selectedFile) formData.append("image", selectedFile);

      const res = await axios.put(
        `http://192.168.68.61:3000/api/users/${userId}`,
        formData
      );

      setMsg({ type: "success", text: "Perfil actualizado correctamente" });
      setNewPassword("");
      setSelectedFile(null);

      if (res.data.profileImage) {
        setProfileImage(`http://192.168.68.61:3000${res.data.profileImage}`);
      }

      // AVISAR AL COMPONENTE PADRE (APP) QUE ACTUALICE EL HEADER
      onProfileUpdate();
    } catch (error) {
      setMsg({ type: "error", text: "Error al actualizar" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-content-center p-4 h-full overflow-y-auto">
      <Card
        className="w-full md:w-8 lg:w-6 shadow-4"
        title={
          <div className="flex align-items-center gap-3">
            <Button icon="pi pi-arrow-left" rounded text onClick={onBack} />
            <span>Mi Perfil</span>
          </div>
        }
      >
        {msg && (
          <Message
            severity={msg.type}
            text={msg.text}
            className="w-full mb-3"
          />
        )}
        <form onSubmit={handleSave} className="flex flex-column gap-4">
          <div className="flex flex-column align-items-center gap-3">
            <Avatar
              image={
                profileImage ||
                "https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
              }
              size="xlarge"
              shape="circle"
              className="w-8rem h-8rem shadow-2 surface-100"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />
            <Button
              label="Cambiar Foto"
              icon="pi pi-camera"
              type="button"
              outlined
              onClick={() => fileInputRef.current?.click()}
            />
          </div>
          <Divider />
          <div className="grid">
            <div className="col-12 md:col-6">
              <label className="block mb-2 font-bold">Nombre</label>
              <InputText
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block mb-2 font-bold">Email</label>
              <InputText
                value={email}
                disabled
                className="w-full surface-200"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block mb-2 font-bold">Teléfono</label>
              <InputText
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block mb-2 font-bold">
                Fecha de Nacimiento
              </label>
              <Calendar
                value={birthDate}
                onChange={(e) => setBirthDate(e.value as Date)}
                showIcon
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block mb-2 font-bold">Ciudad</label>
              <InputText
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label className="block mb-2 font-bold">País</label>
              <InputText
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="field">
            <label className="block mb-2 font-bold">Intereses de Comida</label>
            <MultiSelect
              value={selectedInterests}
              options={interestsOptions}
              onChange={(e) => setSelectedInterests(e.value)}
              optionLabel="label"
              placeholder="Selecciona tus favoritos"
              display="chip"
              className="w-full"
            />
          </div>
          <Divider align="left">
            <span className="p-tag p-tag-warning">Seguridad</span>
          </Divider>
          <div className="field">
            <label className="block mb-2 font-bold">Cambiar Contraseña</label>
            <Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              toggleMask
              feedback={true}
              inputClassName="w-full"
              className="w-full"
            />
          </div>
          <div className="flex justify-content-end gap-2 mt-4">
            <Button
              label="Guardar Cambios"
              icon="pi pi-save"
              loading={loading}
            />
          </div>
        </form>
      </Card>
    </div>
  );
}
