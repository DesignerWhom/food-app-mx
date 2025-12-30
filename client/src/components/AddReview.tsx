import { useState } from "react";
import { Rating } from "primereact/rating";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import axios from "axios";

interface Props {
  placeId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddReview({ placeId, onSuccess, onCancel }: Props) {
  const [service, setService] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [taste, setTaste] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!service || !time || !taste) {
      alert("Por favor califica los 3 aspectos.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://192.168.68.61:3000/api/reviews", {
        placeId,
        ratingService: service,
        ratingTime: time,
        ratingTaste: taste,
        comment,
      });
      onSuccess(); // Avisar que terminamos
    } catch (error) {
      alert("Error al enviar reseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-column gap-3 p-2">
      <p className="m-0 text-600">
        Ayuda a otros usuarios compartiendo tu experiencia.
      </p>

      <div className="grid">
        <div className="col-12 md:col-4 text-center">
          <label className="block mb-2 font-bold">Atención</label>
          <Rating
            value={service || 0}
            onChange={(e) => setService(e.value)}
            cancel={false}
            stars={5}
          />
        </div>
        <div className="col-12 md:col-4 text-center">
          <label className="block mb-2 font-bold">Tiempo</label>
          <Rating
            value={time || 0}
            onChange={(e) => setTime(e.value)}
            cancel={false}
            stars={5}
          />
        </div>
        <div className="col-12 md:col-4 text-center">
          <label className="block mb-2 font-bold">Sabor</label>
          <Rating
            value={taste || 0}
            onChange={(e) => setTaste(e.value)}
            cancel={false}
            stars={5}
          />
        </div>
      </div>

      <div className="mt-2">
        <label className="font-bold block mb-2">Comentario (Opcional)</label>
        <InputTextarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full"
          placeholder="¿Qué te gustó más? ¿Qué podrían mejorar?"
        />
      </div>

      <div className="flex justify-content-end gap-2 mt-3">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          onClick={onCancel}
          text
        />
        <Button
          label="Publicar Reseña"
          icon="pi pi-send"
          onClick={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
