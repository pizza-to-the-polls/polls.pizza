import uploadFileName from "./uploadFileName";

// Minimal File stand-in: the helper only reads `name` and `type`.
const fileOf = (name: string, type: string): File =>
  ({
    name,
    type,
  }) as File;

// ---------------------------------------------------------------------------
// allowed extension → pass through unchanged
// ---------------------------------------------------------------------------
describe("uploadFileName — already-allowed extension", () => {
  it("passes through a jpg name unchanged", () => {
    expect(uploadFileName(fileOf("photo.jpg", "image/jpeg"))).toBe("photo.jpg");
  });

  it("passes through each allowed image extension unchanged", () => {
    expect(uploadFileName(fileOf("pic.gif", "image/gif"))).toBe("pic.gif");
    expect(uploadFileName(fileOf("pic.png", "image/png"))).toBe("pic.png");
    expect(uploadFileName(fileOf("pic.jpeg", "image/jpeg"))).toBe("pic.jpeg");
    expect(uploadFileName(fileOf("pic.heic", "image/heic"))).toBe("pic.heic");
    expect(uploadFileName(fileOf("pic.heif", "image/heif"))).toBe("pic.heif");
    expect(uploadFileName(fileOf("pic.webp", "image/webp"))).toBe("pic.webp");
  });

  it("passes through each allowed video extension unchanged", () => {
    expect(uploadFileName(fileOf("clip.mp4", "video/mp4"))).toBe("clip.mp4");
    expect(uploadFileName(fileOf("clip.mov", "video/quicktime"))).toBe("clip.mov");
    expect(uploadFileName(fileOf("clip.webm", "video/webm"))).toBe("clip.webm");
  });

  it("is case-insensitive on the extension (IMG_1.JPG)", () => {
    expect(uploadFileName(fileOf("IMG_1.JPG", "image/jpeg"))).toBe("IMG_1.JPG");
  });
});

// ---------------------------------------------------------------------------
// disallowed extension but known MIME type → synthesize extension
// ---------------------------------------------------------------------------
describe("uploadFileName — extension fallback from file.type", () => {
  it("renames a .jfif JPEG to .jpg (BUG-040 regression)", () => {
    expect(uploadFileName(fileOf("IMG_1234.jfif", "image/jpeg"))).toBe("IMG_1234.jpg");
  });

  it("only replaces the last extension segment", () => {
    expect(uploadFileName(fileOf("IMG.1234.jfif", "image/jpeg"))).toBe("IMG.1234.jpg");
  });

  it("appends an extension to an extensionless PNG", () => {
    expect(uploadFileName(fileOf("screenshot", "image/png"))).toBe("screenshot.png");
  });

  it("maps HEIC under a wrong extension", () => {
    expect(uploadFileName(fileOf("photo.bin", "image/heic"))).toBe("photo.heic");
  });

  it("sanitizes special characters in the base name", () => {
    expect(uploadFileName(fileOf("my cool photo!@#.jfif", "image/jpeg"))).toBe("my-cool-photo.jpg");
  });

  it("falls back to a 'photo' stem when the base is empty", () => {
    expect(uploadFileName(fileOf(".jfif", "image/jpeg"))).toBe("photo.jpg");
  });

  it("preserves word characters and hyphens in the base name", () => {
    expect(uploadFileName(fileOf("My_Photo-2024.jfif", "image/jpeg"))).toBe("My_Photo-2024.jpg");
  });
});

// ---------------------------------------------------------------------------
// unknown type → pass through unchanged (server still rejects)
// ---------------------------------------------------------------------------
describe("uploadFileName — unknown type passes through", () => {
  it("passes through a name whose type maps to no allowed extension", () => {
    expect(uploadFileName(fileOf("weird.dat", "application/octet-stream"))).toBe("weird.dat");
  });

  it("passes through an empty type", () => {
    expect(uploadFileName(fileOf("mysteryfile", ""))).toBe("mysteryfile");
  });

  it("passes through a disallowed extension even when the type is unknown", () => {
    expect(uploadFileName(fileOf("doc.jfif", ""))).toBe("doc.jfif");
  });
});
