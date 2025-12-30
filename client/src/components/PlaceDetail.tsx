import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Rating } from "primereact/rating";
import { Avatar } from "primereact/avatar";
import { Divider } from "primereact/divider";
import { useState, useEffect } from "react";
import { UPLOADS_URL } from "../config";

interface UserReview {
  id: number;
  userName: string;
  userImage?: string;
  comment: string;
  ratingTaste: number;
  ratingService: number;
  ratingTime: number;
  date: string;
  likes: number;
  isLiked?: boolean;
}

interface Place {
  id: number;
  name: string;
  category: string;
  address: string;
  description?: string;
  coverImage?: string;
  costRange?: string;
  reviews?: any[];
}

interface Props {
  place: Place | null;
  visible: boolean;
  onHide: () => void;
  onRateClick: () => void;
}

export default function PlaceDetail({
  place,
  visible,
  onHide,
  onRateClick,
}: Props) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [reviews, setReviews] = useState<UserReview[]>([]);

  useEffect(() => {
    if (place && place.reviews) {
      const mappedReviews = place.reviews.map((r: any, index) => ({
        id: r.id || index,
        userName: r.user?.name || "Usuario",
        userImage: r.user?.profileImage,
        comment: r.comment || "",
        ratingTaste: r.ratingTaste || 0,
        ratingService: r.ratingService || 0,
        ratingTime: r.ratingTime || 0,
        date: r.createdAt || new Date().toISOString(),
        likes: r.likes || 0,
        isLiked: false,
      }));
      setReviews(mappedReviews);
    }
  }, [place]);

  if (!place) return null;

  const totalReviews = reviews.length;

  // Promedios
  const avgRating =
    totalReviews > 0
      ? reviews.reduce(
          (acc, r) =>
            acc + (r.ratingTaste + r.ratingService + r.ratingTime) / 3,
          0
        ) / totalReviews
      : 0;

  const avgTaste =
    totalReviews > 0
      ? reviews.reduce((acc, r) => acc + r.ratingTaste, 0) / totalReviews
      : 0;
  const avgService =
    totalReviews > 0
      ? reviews.reduce((acc, r) => acc + r.ratingService, 0) / totalReviews
      : 0;
  const avgTime =
    totalReviews > 0
      ? reviews.reduce((acc, r) => acc + r.ratingTime, 0) / totalReviews
      : 0;

  const toggleLike = (reviewId: number) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            isLiked: !r.isLiked,
            likes: r.isLiked ? r.likes - 1 : r.likes + 1,
          };
        }
        return r;
      })
    );
  };

  return (
    <Sidebar
      visible={visible}
      onHide={onHide}
      position="right"
      className="w-full md:w-30rem p-0"
    >
      {/* Imagen Header */}
      <div className="h-15rem w-full relative">
        <img
          src={
            place.coverImage
              ? `${UPLOADS_URL}${place.coverImage}`
              : "https://primefaces.org/cdn/primereact/images/usercard.png"
          }
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <Button
          icon="pi pi-times"
          className="absolute top-0 right-0 m-3 p-button-rounded p-button-text text-white bg-black-alpha-40"
          onClick={onHide}
        />
      </div>

      <div className="p-4">
        {/* Header Info */}
        <div className="flex justify-content-between align-items-start mb-2">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-900 m-0 mb-1">
              {place.name}
            </h1>
            <span className="text-sm font-bold text-primary block mb-1">
              {place.category}
            </span>
            <span className="text-sm text-600">
              <i className="pi pi-map-marker mr-1"></i>
              {place.address}
            </span>
          </div>

          <div className="flex flex-column align-items-end ml-3">
            <div className="flex align-items-center gap-1">
              <span className="text-3xl font-bold text-900">
                {avgRating.toFixed(1)}
              </span>
              <i
                className="pi pi-star-fill"
                style={{ color: "#F59E0B", fontSize: "1.5rem" }}
              ></i>
            </div>
            <span className="text-xs text-500">({totalReviews} opiniones)</span>
          </div>
        </div>

        <Divider />

        {/* Acciones */}
        <div className="flex align-items-center justify-content-between mb-4">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-money-bill text-primary text-xl"></i>
            <span className="font-bold text-900 text-lg">
              {place.costRange || "$$"}
            </span>
          </div>

          {/* BOTÓN CHECK-IN PILL */}
          <Button
            label={isCheckedIn ? "Checked-in" : "Check-in"}
            icon="pi pi-map-marker"
            rounded // PILL SHAPE
            className={`w-10rem ${isCheckedIn ? "" : "btn-checkin-inactive"}`}
            severity={isCheckedIn ? "primary" : undefined}
            onClick={() => setIsCheckedIn(!isCheckedIn)}
          />
        </div>

        {place.description && (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-900 m-0 mb-2">Descripción</h3>
            <p className="line-height-3 text-700 m-0">{place.description}</p>
          </div>
        )}

        {/* Resumen Detallado */}
        {totalReviews > 0 && (
          <div className="surface-card p-3 border-round shadow-1 mb-4 bg-gray-50">
            <h3 className="text-base font-bold text-900 m-0 mb-3">
              Calificación Detallada
            </h3>

            <div className="flex align-items-center justify-content-between mb-2">
              <span className="text-700 text-sm font-medium">Sabor</span>
              <div className="flex align-items-center gap-2">
                <Rating
                  value={Math.round(avgTaste)}
                  readOnly
                  cancel={false}
                  stars={5}
                  className="yellow-rating"
                  style={{ fontSize: "0.8rem" }}
                />
                <span className="text-xs text-900 font-bold w-1rem text-right">
                  {avgTaste.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex align-items-center justify-content-between mb-2">
              <span className="text-700 text-sm font-medium">Atención</span>
              <div className="flex align-items-center gap-2">
                <Rating
                  value={Math.round(avgService)}
                  readOnly
                  cancel={false}
                  stars={5}
                  className="yellow-rating"
                  style={{ fontSize: "0.8rem" }}
                />
                <span className="text-xs text-900 font-bold w-1rem text-right">
                  {avgService.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex align-items-center justify-content-between">
              <span className="text-700 text-sm font-medium">Tiempo</span>
              <div className="flex align-items-center gap-2">
                <Rating
                  value={Math.round(avgTime)}
                  readOnly
                  cancel={false}
                  stars={5}
                  className="yellow-rating"
                  style={{ fontSize: "0.8rem" }}
                />
                <span className="text-xs text-900 font-bold w-1rem text-right">
                  {avgTime.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        <Button
          label="Escribir una reseña"
          icon="pi pi-pencil"
          rounded
          className="w-full mb-4 border-dashed"
          style={{
            color: "#FFFFFF",
            backgroundColor: "var(--primary-color)",
            borderColor: "var(--primary-color)",
          }}
          onClick={onRateClick}
        />

        {/* Comentarios */}
        <h3 className="text-lg font-bold text-900 mb-3">Comentarios</h3>
        <div className="flex flex-column gap-3">
          {reviews.map((review) => {
            return (
              <div
                key={review.id}
                className="surface-card p-3 border-round shadow-1"
              >
                <div className="flex align-items-center gap-3 mb-2">
                  <Avatar
                    image={
                      review.userImage
                        ? `${UPLOADS_URL}${review.userImage}`
                        : undefined
                    }
                    icon={!review.userImage ? "pi pi-user" : undefined}
                    shape="circle"
                  />
                  <div className="flex flex-column">
                    <span className="font-bold text-900 text-sm">
                      {review.userName}
                    </span>
                    <span className="text-xs text-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-700 line-height-3 m-0 mb-3 text-sm">
                  {review.comment}
                </p>

                <div className="flex align-items-center gap-2">
                  <Button
                    icon={`pi ${review.isLiked ? "pi-heart-fill" : "pi-heart"}`}
                    rounded
                    className={`p-button-sm ${
                      review.isLiked ? "btn-like-active" : "btn-like-inactive"
                    }`}
                    style={{ width: "2rem", height: "2rem" }}
                    onClick={() => toggleLike(review.id)}
                  />
                  <span className="text-xs text-600 font-medium">
                    {review.likes} Me gusta
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Sidebar>
  );
}
