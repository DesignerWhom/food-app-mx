import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";

// --- Iconos ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;
// --------------

interface Props {
  onLocationSelect: (lat: number, lng: number) => void;
}

// 1. COMPONENTE AUXILIAR: Mueve el mapa cuando cambian las coordenadas
function MapController({
  center,
}: {
  center: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      // Animación suave hacia la ubicación del usuario
      map.flyTo([center.lat, center.lng], 16, {
        duration: 1.5,
      });
    }
  }, [center, map]);

  return null;
}

export default function LocationPicker({ onLocationSelect }: Props) {
  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userCenter, setUserCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "denied"
  >("loading");

  // Ubicación por defecto (CDMX) si falla el GPS
  const defaultCenter: [number, number] = [19.4326, -99.1332];

  const getLocation = () => {
    setStatus("loading");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserCenter(userPos);

          // Seleccionar automáticamente la ubicación del usuario al inicio
          if (!selectedPosition) {
            setSelectedPosition(userPos);
            onLocationSelect(userPos.lat, userPos.lng);
          }
          setStatus("success");
        },
        (error) => {
          console.error("Error GPS:", error);
          // Código 1 = Permiso denegado
          setStatus(error.code === 1 ? "denied" : "error");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setStatus("error");
    }
  };

  // Intentar obtener ubicación al cargar
  useEffect(() => {
    getLocation();
  }, []);

  // Componente para manejar clics
  function ClickHandler() {
    useMapEvents({
      click(e) {
        setSelectedPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div className="flex flex-column gap-2">
      <div className="flex justify-content-between align-items-center flex-wrap gap-2">
        <label className="font-bold">Ubicación en mapa *</label>

        {/* Feedback visual del estado del GPS */}
        {status === "loading" && (
          <small className="flex align-items-center text-600">
            <ProgressSpinner
              style={{ width: "16px", height: "16px" }}
              strokeWidth="4"
              className="mr-2"
            />{" "}
            Buscando GPS...
          </small>
        )}
        {status === "error" && (
          <small className="text-red-500">No se pudo obtener ubicación.</small>
        )}
        {status === "denied" && (
          <div className="flex align-items-center gap-2">
            <small className="text-orange-500">Permiso denegado.</small>
            <Button
              label="Reintentar"
              link
              className="p-0 h-auto text-sm"
              onClick={getLocation}
            />
          </div>
        )}
      </div>

      <div className="border-round overflow-hidden surface-border border-1 relative h-30rem w-full">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Controladores Lógicos */}
          <MapController center={userCenter} />
          <ClickHandler />

          {/* Marcadores Visuales */}
          {userCenter && (
            <CircleMarker
              center={[userCenter.lat, userCenter.lng]}
              radius={8}
              pathOptions={{
                color: "white",
                fillColor: "#2196F3",
                fillOpacity: 1,
                weight: 2,
              }}
            />
          )}

          {selectedPosition && <Marker position={selectedPosition} />}
        </MapContainer>

        {/* Botón Flotante (Solo aparece si tenemos ubicación) */}
        {userCenter && (
          <Button
            type="button" // Importante para que no envíe el form
            icon="pi pi-compass"
            rounded
            text
            raised
            className="absolute bg-white text-700 shadow-2 w-3rem h-3rem hover:surface-100"
            style={{ top: "10px", right: "10px", zIndex: 400 }}
            // Al hacer clic, forzamos al mapa a volar al centro del usuario de nuevo
            // Truco: React Leaflet necesita un cambio de estado para reaccionar.
            // Como userCenter ya es el mismo, forzamos un re-render del MapController pasando una copia
            onClick={() => {
              const map = document.querySelector(".leaflet-container");
              // Ojo: En este diseño simplificado, el MapController reaccionará si userCenter cambia
              // pero si ya estamos ahí, no hará nada.
              // Para forzar recentrar, la forma más limpia es actualizar userCenter
              // con una copia nueva para disparar el useEffect
              setUserCenter({ ...userCenter });
            }}
            tooltip="Ir a mi ubicación"
            tooltipOptions={{ position: "left" }}
          />
        )}
      </div>

      {/* Mensaje de ayuda */}
      {selectedPosition ? (
        <div className="flex align-items-center text-green-700 bg-green-50 p-2 border-round">
          <i className="pi pi-check-circle mr-2"></i>
          <span>
            Coordenadas listas: {selectedPosition.lat.toFixed(5)},{" "}
            {selectedPosition.lng.toFixed(5)}
          </span>
        </div>
      ) : (
        <Message
          severity="info"
          text="Si el GPS falla, haz clic manualmente en el mapa."
          className="w-full"
        />
      )}
    </div>
  );
}
