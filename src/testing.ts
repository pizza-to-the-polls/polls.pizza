export const mockFetchScript = (responses: Record<string, { status?: number; body: string }>) => `
  <script>
    // Build a mock fetch that matches URLs by suffix (or suffix + query string).
    // This avoids false positives like /orders matching /reorders.
    // Keys should be specific: "/v1/orders" not "orders".
    window.__mockResponses = ${JSON.stringify(responses)};
    window.__fetchCalls = [];
    window.fetch = function(url, opts) {
      window.__fetchCalls.push({ url: String(url), opts: opts });
      var body = "{}";
      var status = 200;
      var urlStr = String(url);
      for (var key in window.__mockResponses) {
        if (urlStr.endsWith(key) || urlStr.includes(key + "?")) {
          body = window.__mockResponses[key].body;
          status = window.__mockResponses[key].status || 200;
          break;
        }
      }
      return Promise.resolve({
        status: status,
        ok: status >= 200 && status < 300,
        statusText: status === 200 ? "OK" : "Error",
        text: function() { return Promise.resolve(body); },
        json: function() { return Promise.resolve(JSON.parse(body)); }
      });
    };
    window.Stripe = function() {
      return {
        redirectToCheckout: function() { return Promise.resolve({}); }
      };
    };
  </script>
`;
