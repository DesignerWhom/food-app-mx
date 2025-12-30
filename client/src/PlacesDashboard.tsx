import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Slider } from "primereact/slider";
import { InputText } from "primereact/inputtext";
import { Rating } from "primereact/rating";
import PlacesMap from "./components/PlacesMap";
import CreatePlace from "./CreatePlace";
import PlaceDetail from "./components/PlaceDetail";
import AddReview from "./components/AddReview";
import { calculateDistance } from "./utils/geometry";
import { API_URL } from "./config";

interface Place {
  id: number;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  menu?: string;
  distance?: number;
  phone?: string;
  costRange?: string;
  openingHours?: string;
  hasDelivery?: boolean;
  deliveryApps?: string;
  coverImage?: string;
  verified?: boolean;
  visitCount?: number;
  reviews?: any[];
}

export default function PlacesDashboard() {
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Filtros
  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCost, setSelectedCost] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(10);

  const categories = [
    { label: "Mexicana", value: "Mexicana" },
    { label: "Italiana", value: "Italiana" },
    { label: "Japonesa", value: "Japonesa" },
    { label: "Comida Rápida", value: "Comida Rápida" },
    { label: "Postres", value: "Postres" },
    { label: "Vegana", value: "Vegana" },
    { label: "Mariscos", value: "Mariscos" },
  ];

  const costOptions = ["$", "$$", "$$$"];

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/places`);
      setAllPlaces(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  const filteredPlaces = useMemo(() => {
    let processed = allPlaces.map((p) => {
      if (userLocation) {
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          p.latitude,
          p.longitude
        );
        return { ...p, distance: dist };
      }
      return p;
    });

    if (searchText) {
      processed = processed.filter(
        (p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          p.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      processed = processed.filter((p) =>
        selectedCategories.includes(p.category)
      );
    }

    if (selectedCost) {
      processed = processed.filter((p) => p.costRange === selectedCost);
    }

    if (userLocation) {
      processed = processed.filter((p) => (p.distance || 0) <= maxDistance);
      processed.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    return processed;
  }, [
    allPlaces,
    searchText,
    selectedCategories,
    selectedCost,
    userLocation,
    maxDistance,
  ]);

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    fetchPlaces();
    setSelectedPlace(null);
  };

  const openExternalMap = (lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedCategories([]);
    setSelectedCost(null);
  };

  const toggleCategory = (catValue: string) => {
    if (selectedCategories.includes(catValue)) {
      setSelectedCategories((prev) => prev.filter((c) => c !== catValue));
    } else {
      setSelectedCategories((prev) => [...prev, catValue]);
    }
  };

  const toggleCost = (cost: string) => {
    selectedCost === cost ? setSelectedCost(null) : setSelectedCost(cost);
  };

  return (
    <div className="grid grid-nogutter h-full w-full relative overflow-hidden">
      {/* --- COLUMNA LISTA --- */}
      <div
        className={`col-12 md:col-4 p-3 h-full flex-column surface-50 ${
          mobileView === "map" ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="surface-card shadow-2 border-round h-full flex flex-column overflow-hidden">
          {/* Header Filtros */}
          <div className="p-3 border-bottom-1 surface-border">
            <div className="flex justify-content-between align-items-center mb-3">
              <h2 className="text-xl font-bold m-0 text-900">Explorar</h2>
              <Button
                icon="pi pi-times"
                rounded
                text
                className="md:hidden"
                onClick={() => setMobileView("map")}
              />
            </div>

            <div className="flex flex-column gap-3">
              {/* --- BUSCADOR PERSONALIZADO --- */}
              <div className="relative w-full">
                {/* Icono posicionado manualmente para que no se encime */}
                <i
                  className="pi pi-search absolute text-500 z-2"
                  style={{
                    left: "1.2rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "1.1rem",
                  }}
                />
                <InputText
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="¿Qué se te antoja hoy?"
                  className="w-full border-round-3xl shadow-1 border-none text-900"
                  // Padding left grande para librar el icono
                  style={{
                    paddingLeft: "3rem",
                    paddingTop: "0.8rem",
                    paddingBottom: "0.8rem",
                    backgroundColor: "#FFFFFF",
                  }}
                />
              </div>

              {/* CINTA DE CATEGORÍAS */}
              <div>
                <label className="font-bold block mb-2 text-700 text-xs">
                  Categorías
                </label>
                <div
                  className="flex gap-2 overflow-x-auto pb-2 p-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <Button
                    label="Todas"
                    rounded
                    size="small"
                    className={`white-space-nowrap flex-shrink-0 shadow-1 ${
                      selectedCategories.length === 0
                        ? ""
                        : "category-btn-unselected"
                    }`}
                    severity={
                      selectedCategories.length === 0 ? "success" : undefined
                    }
                    onClick={() => setSelectedCategories([])}
                  />
                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.value);
                    return (
                      <Button
                        key={cat.value}
                        label={cat.label}
                        rounded
                        size="small"
                        className={`white-space-nowrap flex-shrink-0 shadow-1 ${
                          isSelected ? "" : "category-btn-unselected"
                        }`}
                        severity={isSelected ? "success" : undefined}
                        onClick={() => toggleCategory(cat.value)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* FILTRO DE COSTO */}
              <div className="flex flex-column gap-2">
                <span className="font-bold text-700 text-xs">Costo:</span>
                <div className="flex gap-2">
                  {costOptions.map((cost) => {
                    const isSelected = selectedCost === cost;
                    return (
                      <Button
                        key={cost}
                        label={cost}
                        rounded
                        size="small"
                        className={`flex-1 shadow-1 ${
                          isSelected ? "" : "category-btn-unselected"
                        }`}
                        severity={isSelected ? "success" : undefined}
                        onClick={() => toggleCost(cost)}
                      />
                    );
                  })}
                </div>
              </div>

              <div
                className={`transition-all duration-500 ${
                  !userLocation ? "opacity-50" : ""
                }`}
              >
                <div className="flex justify-content-between mb-1">
                  <label className="font-bold text-700 text-xs">
                    Distancia
                  </label>
                  <span className="font-bold text-primary text-xs">
                    {userLocation ? `${maxDistance} km` : "No GPS"}
                  </span>
                </div>
                <Slider
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.value as number)}
                  min={1}
                  max={50}
                  disabled={!userLocation}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Lista Items */}
          <div
            className="flex-grow-1 overflow-y-auto p-3"
            style={{ backgroundColor: "var(--surface-ground)" }}
          >
            {loading ? (
              <p>Cargando...</p>
            ) : filteredPlaces.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-600">No hay resultados.</p>
                <Button label="Limpiar filtros" link onClick={clearFilters} />
              </div>
            ) : (
              <div className="flex flex-column gap-3">
                {filteredPlaces.map((place) => {
                  const reviews = place.reviews || [];
                  let avgRating = 0;
                  if (reviews.length > 0)
                    avgRating =
                      reviews.reduce(
                        (acc, r) =>
                          acc +
                          (r.ratingService + r.ratingTime + r.ratingTaste) / 3,
                        0
                      ) / reviews.length;

                  return (
                    <Card
                      key={place.id}
                      className="cursor-pointer p-0"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "none",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                        marginBottom: "1rem",
                      }}
                      onClick={() => setSelectedPlace(place)}
                    >
                      <div className="flex justify-content-between align-items-start mb-1">
                        <h3 className="text-base m-0 text-900 font-bold flex-1 mr-2">
                          {place.name}
                        </h3>
                        <div className="flex align-items-center gap-1 bg-gray-50 px-2 py-1 border-round">
                          <span className="font-bold text-900">
                            {avgRating > 0 ? avgRating.toFixed(1) : "-"}
                          </span>
                          <i
                            className="pi pi-star-fill"
                            style={{ color: "#F59E0B", fontSize: "0.9rem" }}
                          ></i>
                          <span className="text-500 text-xs">
                            ({reviews.length})
                          </span>
                        </div>
                      </div>

                      <div className="flex align-items-center flex-wrap gap-2 mb-3">
                        <span className="text-sm font-bold text-primary">
                          {place.category}
                        </span>
                        <i
                          className="pi pi-circle-fill text-300"
                          style={{ fontSize: "4px" }}
                        ></i>
                        {place.costRange && (
                          <span
                            className="font-bold text-xs px-2 py-1 border-round"
                            style={{
                              color: "var(--green-500)",
                              backgroundColor: "var(--green-50)",
                            }}
                          >
                            {place.costRange}
                          </span>
                        )}
                        {place.distance !== undefined && (
                          <Tag
                            severity="success"
                            value={`${place.distance.toFixed(1)} km`}
                            className="text-xs"
                          ></Tag>
                        )}
                      </div>

                      <div className="flex justify-content-between align-items-end mt-2">
                        <span className="text-xs text-600 white-space-nowrap overflow-hidden text-overflow-ellipsis flex-1 mr-3">
                          <i className="pi pi-map-marker mr-1 text-primary"></i>
                          {place.address}
                        </span>
                        <Button
                          icon="pi pi-directions"
                          rounded
                          className="map-btn-custom shadow-1 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            openExternalMap(place.latitude, place.longitude);
                          }}
                          tooltip="Cómo llegar"
                          tooltipOptions={{ position: "left" }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- COLUMNA MAPA --- */}
      <div
        className={`col-12 md:col-8 h-full relative ${
          mobileView === "list" ? "hidden md:block" : "block"
        }`}
      >
        <PlacesMap
          places={filteredPlaces}
          userLocation={userLocation}
          onPlaceSelect={(place) => setSelectedPlace(place)}
        />
        <Button
          icon="pi pi-plus"
          rounded
          raised
          size="large"
          className="absolute shadow-4 border-none"
          style={{
            bottom: "130px",
            right: "20px",
            width: "60px",
            height: "60px",
            zIndex: 1100,
          }}
          onClick={() => setShowCreateModal(true)}
          tooltip="Registrar lugar"
        />
        <div
          className="absolute w-full flex justify-content-center md:hidden"
          style={{ bottom: "60px", zIndex: 1100, pointerEvents: "none" }}
        >
          <Button
            label={mobileView === "map" ? "Ver Lista" : "Ver Mapa"}
            icon={`pi ${mobileView === "map" ? "pi-list" : "pi-map"}`}
            rounded
            raised
            className="bg-white text-primary shadow-4 font-bold px-4 py-3 border-none"
            style={{ pointerEvents: "auto" }}
            onClick={() => setMobileView(mobileView === "map" ? "list" : "map")}
          />
        </div>
      </div>

      {/* MODALES */}
      <Dialog
        header="Registrar Nuevo Lugar"
        visible={showCreateModal}
        style={{ width: "95vw", maxWidth: "600px" }}
        onHide={() => setShowCreateModal(false)}
        maximizable
        modal
      >
        <CreatePlace
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPlaces();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Dialog>
      <Dialog
        header="Calificar"
        visible={showReviewModal}
        style={{ width: "90vw", maxWidth: "500px" }}
        onHide={() => setShowReviewModal(false)}
        modal
      >
        {selectedPlace && (
          <AddReview
            placeId={selectedPlace.id}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowReviewModal(false)}
          />
        )}
      </Dialog>
      <PlaceDetail
        place={selectedPlace}
        visible={!!selectedPlace}
        onHide={() => setSelectedPlace(null)}
        onRateClick={() => setShowReviewModal(true)}
      />
    </div>
  );
}
