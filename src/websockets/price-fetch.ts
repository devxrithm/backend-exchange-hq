interface BinancePriceResponse {
  symbol: string;
  price: string;
}

export async function getLatestPrice(symbol: string): Promise<number> {
  const response = await fetch(
    `https://api2.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`,
  );
  const data = (await response.json()) as BinancePriceResponse;
  console.log(parseFloat(data.price))
  return parseFloat(data.price);
}
