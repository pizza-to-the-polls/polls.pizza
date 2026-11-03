/**
 * Extensions the pizzabase upload validator allows (its UPLOAD_CONTENT_TYPES
 * allowlist). The server derives `fileExt` from the last dot of the name the
 * client sends to POST /upload, so anything outside this set is a guaranteed
 * 422 — even when the bytes are a perfectly valid image (BUG-040: Windows
 * hands users real JPEGs named .jfif, which `accept="image/*"` happily
 * permits but the extension allowlist rejects).
 */
const ALLOWED_EXTENSIONS = new Set(["gif", "png", "jpg", "jpeg", "heic", "heif", "webp", "mp4", "mov", "webm"]);

/** MIME type → allowed extension, covering every type the photo input accepts. */
const EXT_BY_TYPE: Record<string, string> = {
  "image/gif": "gif",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

/**
 * Given a picked File, return the file name to send to POST /upload.
 *
 * If the name's extension is already allowed, pass through unchanged.
 * Otherwise, if `file.type` maps to an allowed extension, synthesize a name
 * with that extension (base stem preserved, sanitized to word characters,
 * hyphens, and dots — the server only reads the LAST extension, so interior
 * dots like "IMG.1234" are safe to keep; "photo" as a last-resort stem).
 * If the type maps to nothing allowed, pass the original name through —
 * the server remains the gatekeeper and will still reject genuinely unknown
 * types.
 */
const uploadFileName = (file: File): string => {
  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : "";

  if (ALLOWED_EXTENSIONS.has(ext)) return file.name;

  const typeExt = EXT_BY_TYPE[file.type];
  if (typeExt) {
    const base = (dot >= 0 ? file.name.slice(0, dot) : file.name).replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
    return `${base || "photo"}.${typeExt}`;
  }

  return file.name;
};

export default uploadFileName;
