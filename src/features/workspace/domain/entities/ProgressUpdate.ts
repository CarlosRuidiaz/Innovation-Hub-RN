// Una entrada de la bitacora de avances del proyecto: el `ProgressUpdate` de
// `progress_update.dart`.
//
// No mueve el porcentaje por si sola: si `milestoneId` viene, es el hito que
// este avance cumple, y es eso lo que sube la barra.
export type ProgressUpdate = {
  id: string | null;
  projectId: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  createdAt: Date;
  // Foto del porcentaje (0 a 100) al publicar. El real se sigue calculando con
  // los hitos: esto es solo lo que decia la barra cuando se escribio el avance.
  completionPercentage: number;
  // La galeria y el video todavia no van: solo se guarda el enlace.
  videoUrl: string | null;
  // El hito que este avance cumple, si el autor marco alguno.
  milestoneId: string | null;
};

export function newProgressUpdate(
  fields: Omit<ProgressUpdate, "id" | "videoUrl" | "milestoneId"> &
    Partial<Pick<ProgressUpdate, "id" | "videoUrl" | "milestoneId">>,
): ProgressUpdate {
  return { id: null, videoUrl: null, milestoneId: null, ...fields };
}
