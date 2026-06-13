import { newE2EPage } from "@stencil/core/testing";

import { mockFetchScript } from "../../../testing";

describe("page-session", () => {
  it("renders the sign-in form", async () => {
    const page = await newE2EPage();
    await page.setContent("<page-session></page-session>");
    await page.waitForChanges();

    const form = await page.find("#sign-in-form");
    expect(form).not.toBeNull();
    expect(await form.isVisible()).toBe(true);
  });

  it("submits an email and calls the session API", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/session": {
          body: JSON.stringify({ success: true }),
        },
      }) + "<page-session></page-session>",
    );
    await page.waitForChanges();

    const emailInput = await page.find('input[name="email"]');
    await emailInput.type("test@example.com");

    await emailInput.press("Tab");
    await page.waitForChanges();

    const submitBtn = await page.find("#sign-in-form button");
    await submitBtn.click();
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls);
    const sessionCalls = calls.filter((c: any) => c.url.includes("/session"));
    expect(sessionCalls.length).toBe(1);
    const body = JSON.parse(sessionCalls[0].opts.body);
    expect(body.email).toBe("test@example.com");
  });

  it("calls putSession when a token is present", async () => {
    const page = await newE2EPage();
    await page.setContent(
      mockFetchScript({
        "/session": {
          body: JSON.stringify({ redirect: "/crustclub" }),
        },
      }) + "<page-session></page-session>",
    );
    await page.waitForChanges();

    await page.evaluate(() => {
      const el = document.querySelector("page-session") as any;
      if (el) {
        el.token = "abc123";
        el.signIn();
      }
    });
    await page.waitForChanges();

    const calls = await page.evaluate(() => (window as any).__fetchCalls);
    const sessionCalls = calls.filter((c: any) => c.url.includes("/session"));
    expect(sessionCalls.length).toBeGreaterThan(0);
    expect(sessionCalls[0].opts.method).toBe("PUT");
  });
});
