interface BinancePriceResponse {
  symbol: string;
  price: string;
}

export async function getLatestPrice(symbol: string): Promise<number> {
  const response = await fetch(
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
  );
  const data = (await response.json()) as BinancePriceResponse;
  return parseFloat(data.price);
}