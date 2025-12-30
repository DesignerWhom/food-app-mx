import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { Button } from "primereact/button";
import { useEffect } from "react";

// Corrección para iconos de Leaflet en React (a veces no cargan por defecto)
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

// Definir el icono por defecto
const defaultIcon = new Icon({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Icono especial para la ubicación del usuario (Azul/Diferente)
// Usamos un filtro CSS en el render para diferenciarlo o podrías cargar otra imagen
const userIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Componente auxiliar para mover el centro del mapa cuando cambie la ubicación
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
}

interface Props {
  places: Place[];
  userLocation: { lat: number; lng: number } | null;
  onPlaceSelect: (place: Place) => void;
}

export default function PlacesMap({
  places,
  userLocation,
  onPlaceSelect,
}: Props) {
  // Coordenadas por defecto (Puebla Centro)
  const defaultPosition: [number, number] = [19.0414, -98.2063];

  // Centro actual: o el usuario o el default
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultPosition;

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%", zIndex: 0 }} // zIndex 0 para que no tape los modales
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Actualizador de vista */}
      <ChangeView center={center} />

      {/* Marcador del Usuario */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Estás aquí</Popup>
        </Marker>
      )}

      {/* Marcadores de Lugares */}
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={defaultIcon}
        >
          <Popup>
            <div
              className="flex flex-column gap-2"
              style={{ minWidth: "150px" }}
            >
              <h3
                className="m-0 text-base font-bold text-primary cursor-pointer hover:underline"
                onClick={() => onPlaceSelect(place)}
              >
                {place.name}
              </h3>
              <span className="text-sm text-700 font-bold">
                {place.category}
              </span>
              <Button
                label="Ver detalles"
                size="small"
                link
                className="p-0 text-left"
                onClick={() => onPlaceSelect(place)}
              />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
