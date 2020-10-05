const TOTALS_URL = "https://spreadsheets.google.com/feeds/list/1mxmW0YljLEcNP1BUJoUlAEtzzE0FXwbaDBPN26dlloo/2/public/basic?alt=json";

export const getTotals = async () => {
  const resp = await fetch(TOTALS_URL);
  const { feed } = await resp.json();
  const entry: Array<{ content: { $t: string } }> = (feed || {}).entry;

  const [pizzas, locations, states, raised] = entry.map(el => el?.content.$t?.split(": ")[1]);

  return { pizzas, locations, states, raised };
};
