import { ApiError, PizzaApi } from "../api";
import shaFile from "./shaFile";

export type UploadedPhoto = { uploadId: number | null; photoUrl: string };

/**
 * Upload report media through the pizzabase media pipeline:
 *   sha256 hash → POST /upload (dedupe check) → presigned S3 POST
 *   (skipped for duplicates) → stable /uploads/:fileName permalink.
 *
 * Used by the partner form-partner-report. Deliberately NOT shared with the
 * public form-report: its upload path is hardened for anonymous traffic
 * (post-upload verification, unsaved-upload guards, dedupe analytics) and
 * is interwoven with that component's state — see form-report.tsx.
 */
export const uploadPhoto = async (file: File, address: string): Promise<UploadedPhoto> => {
  const fileHash = await shaFile(file);

  const { id, filePath, isDuplicate, presigned } = await PizzaApi.postUpload(fileHash, file.name, address);

  let uploadId: number | null = null;
  if (!isDuplicate && presigned) {
    uploadId = id;
    const formData = new FormData();
    const { url, fields } = presigned;

    formData.append("Content-Type", file.type);

    Object.entries(fields).forEach(([k, v]: [string, any]) => {
      formData.append(k, v);
    });

    formData.append("file", file);

    const awsReq = await fetch(url, {
      method: "POST",
      mode: "cors",
      body: formData,
    });
    if (awsReq.status > 299) {
      const awsError: ApiError = { isError: true, status: awsReq.status, errors: { fileName: "Whoops! That did not work - try again!" } };
      throw awsError;
    }
  }

  // Stable permalink — pizzabase resolves it to wherever the media
  // currently lives (processed output, or the public bucket for legacy).
  // filePath is the full storage key ("uploads/<name>"); the permalink
  // route is /uploads/:fileName, so pass only the basename.
  const fileName = (filePath ?? "").split("/").pop() || "";
  const photoUrl = `${process.env.PIZZA_BASE_DOMAIN}/uploads/${fileName}`;

  return { uploadId, photoUrl };
};
