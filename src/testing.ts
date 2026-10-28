type MockResponse = { status?: number; body?: string; networkError?: boolean | number };

export const mockFetchScript = (responses: Record<string, MockResponse | MockResponse[]>) => `
  <script>
    // Build a mock fetch that matches URLs by suffix (or suffix + query string).
    // This avoids false positives like /orders matching /reorders.
    // Keys should be specific: "/v1/orders" not "orders".
    //
    // Each key maps to ONE response (static) or an ARRAY served in order
    // (last entry is sticky) — sequences let a test answer the same URL
    // differently per call (e.g. a fresh /upload, then the duplicate
    // response a verification retry would receive).
    //
    // networkError: true rejects EVERY call to the entry (permanent network
    // failure). networkError: N rejects the entry's first N calls, then
    // resolves — so retry/backoff tests can fail a few attempts and then
    // succeed. Counting is per ENTRY, not per URL.
    window.__mockResponses = ${JSON.stringify(responses)};
    window.__fetchCalls = [];
    window.__mockEntryCounts = {};
    window.fetch = function(url, opts) {
      window.__fetchCalls.push({ url: String(url), opts: opts });
      var body = "{}";
      var status = 200;
      var urlStr = String(url);
      var responseConfig;
      var entryIndex = 0;
      for (var key in window.__mockResponses) {
        if (urlStr.endsWith(key) || urlStr.includes(key + "?")) {
          var mapped = window.__mockResponses[key];
          if (Array.isArray(mapped)) {
            var seqIdx = window.__mockResponses[key + ":idx"] || 0;
            entryIndex = Math.min(seqIdx, mapped.length - 1);
            window.__mockResponses[key + ":idx"] = entryIndex + 1;
            responseConfig = mapped[entryIndex];
          } else {
            responseConfig = mapped;
          }
          break;
        }
      }

      if (responseConfig) {
        var rejectCount = responseConfig.networkError === true ? Infinity : responseConfig.networkError;
        if (rejectCount) {
          var entryKey = urlStr + ":" + entryIndex;
          window.__mockEntryCounts[entryKey] = (window.__mockEntryCounts[entryKey] || 0) + 1;
          if (window.__mockEntryCounts[entryKey] <= rejectCount) {
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
