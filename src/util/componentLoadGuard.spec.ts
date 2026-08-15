import { decideFallback, extractChunkId, extractChunkUrl, isChunkLoadFailure } from "./componentLoadGuard";

// ---------------------------------------------------------------------------
// isChunkLoadFailure
// ---------------------------------------------------------------------------
describe("isChunkLoadFailure", () => {
  it("matches s.isProxied TypeError", () => {
    expect(isChunkLoadFailure("TypeError: undefined is not an object (evaluating 's.isProxied')")).toBe(true);
  });

  it("matches Failed to fetch dynamically imported module", () => {
    expect(isChunkLoadFailure("Failed to fetch dynamically imported module: https://polls.pizza/build/p-188cd4da.entry.js")).toBe(true);
  });

  it("matches dynamically imported message with chunk URL", () => {
    expect(isChunkLoadFailure("error loading dynamically imported module: https://polls.pizza/build/p-abc123.js")).toBe(true);
  });

  it("does not match unrelated errors", () => {
    expect(isChunkLoadFailure("Something else broke")).toBe(false);
    expect(isChunkLoadFailure("Uncaught ReferenceError: foo is not defined")).toBe(false);
    expect(isChunkLoadFailure("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// extractChunkId
// ---------------------------------------------------------------------------
describe("extractChunkId", () => {
  it("extracts chunk id from full URL", () => {
    expect(extractChunkId("https://polls.pizza/build/p-188cd4da.entry.js")).toBe("p-188cd4da.entry.js");
  });

  it("extracts chunk id from filename only", () => {
    expect(extractChunkId("p-188cd4da.entry.js")).toBe("p-188cd4da.entry.js");
  });

  it("extracts chunk id without .entry suffix", () => {
    expect(extractChunkId("https://polls.pizza/build/p-188cd4da.js")).toBe("p-188cd4da.js");
  });

  it("extracts app-* chunk id", () => {
    expect(extractChunkId("https://polls.pizza/build/app-abcdef.js")).toBe("app-abcdef.js");
  });

  it("extracts index-* chunk id", () => {
    expect(extractChunkId("https://polls.pizza/build/index-123abc.js")).toBe("index-123abc.js");
  });

  it("returns null for non-chunk strings", () => {
    expect(extractChunkId("https://polls.pizza/build/app.esm.js")).toBeNull();
    expect(extractChunkId("something random")).toBeNull();
    expect(extractChunkId("")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// extractChunkUrl
// ---------------------------------------------------------------------------
describe("extractChunkUrl", () => {
  it("extracts full chunk URL from error message", () => {
    expect(extractChunkUrl("Failed to fetch dynamically imported module: https://polls.pizza/build/p-188cd4da.entry.js")).toBe("https://polls.pizza/build/p-188cd4da.entry.js");
  });

  it("returns null when no chunk URL is present", () => {
    expect(extractChunkUrl("TypeError: undefined is not an object")).toBeNull();
    expect(extractChunkUrl("")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// decideFallback
// ---------------------------------------------------------------------------
describe("decideFallback", () => {
  it("returns reload within the initial 10 s window", () => {
    expect(decideFallback(5_000)).toBe("reload");
    expect(decideFallback(0)).toBe("reload");
    expect(decideFallback(9_999)).toBe("reload");
  });

  it("returns banner after the initial 10 s window", () => {
    expect(decideFallback(10_000)).toBe("banner");
    expect(decideFallback(60_000)).toBe("banner");
  });
});
