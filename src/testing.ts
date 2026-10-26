export const mockFetchScript = (responses: Record<string, { status?: number; body?: string; networkError?: boolean | number }>) => `
  <script>
    // Build a mock fetch that matches URLs by suffix (or suffix + query string).
    // This avoids false positives like /orders matching /reorders.
    // Keys should be specific: "/v1/orders" not "orders".
    //
    // networkError: true rejects EVERY call to the URL (permanent network
    // failure). networkError: N rejects the first N calls, then resolves —
    // so retry/backoff tests can fail a few attempts and then succeed.
    window.__mockResponses = ${JSON.stringify(responses)};
    window.__fetchCalls = [];
    window.fetch = function(url, opts) {
      window.__fetchCalls.push({ url: String(url), opts: opts });
      var body = "{}";
      var status = 200;
      var urlStr = String(url);
      var responseConfig;
      for (var key in window.__mockResponses) {
        if (urlStr.endsWith(key) || urlStr.includes(key + "?")) {
          responseConfig = window.__mockResponses[key];
          break;
        }
      }

      if (responseConfig) {
        var rejectCount = responseConfig.networkError === true ? Infinity : responseConfig.networkError;
        if (rejectCount) {
          var callsToUrl = window.__fetchCalls.filter(function(c) { return c.url === urlStr; }).length;
          if (callsToUrl <= rejectCount) {
            return new Promise(function(_, reject) { reject(new TypeError("Failed to fetch")); });
          }
        }
        body = responseConfig.body;
        status = responseConfig.status || 200;
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
