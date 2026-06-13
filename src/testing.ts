export const mockFetchScript = (responses: Record<string, { status?: number; body: string }>) => `
  <script>
    window.__mockResponses = ${JSON.stringify(responses)};
    window.__fetchCalls = [];
    window.fetch = function(url, opts) {
      window.__fetchCalls.push({ url: String(url), opts: opts });
      var body = "{}";
      var status = 200;
      for (var key in window.__mockResponses) {
        if (String(url).indexOf(key) !== -1) {
          body = window.__mockResponses[key].body;
          status = window.__mockResponses[key].status || 200;
          break;
        }
      }
      return Promise.resolve({
        status: status,
        text: function() { return Promise.resolve(body); }
      });
    };
    window.Stripe = function() {
      return {
        redirectToCheckout: function() { return Promise.resolve({}); }
      };
    };
  </script>
`;
