import { trackEvent } from "./analytics";

describe("trackEvent", () => {
  let gtag: jest.Mock;

  beforeEach(() => {
    gtag = jest.fn();
    (window as any).gtag = gtag;
  });

  afterEach(() => {
    delete (window as any).gtag;
  });

  it("forwards the event name and params to gtag", () => {
    trackEvent("test_event", { step: "two", duplicate: false });

    expect(gtag).toHaveBeenCalledWith("event", "test_event", { step: "two", duplicate: false });
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it("defaults params to an empty object when omitted", () => {
    trackEvent("bare_event");

    expect(gtag).toHaveBeenCalledWith("event", "bare_event", {});
  });

  it("is a safe no-op when gtag is absent (adblock / prerender)", () => {
    delete (window as any).gtag;

    expect(() => trackEvent("test_event", { fields: "waitTime" })).not.toThrow();
    expect(gtag).not.toHaveBeenCalled();
  });

  it("is a safe no-op when params are not JSON-friendly gtag values", () => {
    // Allowing numbers and booleans is part of the contract.
    trackEvent("numeric_event", { count: 3, ok: true });

    expect(gtag).toHaveBeenCalledWith("event", "numeric_event", { count: 3, ok: true });
  });
});
