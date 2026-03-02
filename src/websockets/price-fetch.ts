import axios from "axios";

interface BinancePriceResponse {
  symbol: string;
  price: string;
}

export async function getLatestPrice(symbol: string): Promise<number> {
  try {
    const { data } = await axios.get<BinancePriceResponse>(
      "https://api.binance.com/api/v3/ticker/price",
      {
        params: {
          symbol: symbol.toUpperCase(),
        },
      },
    );

    console.log(parseFloat(data.price));
    return parseFloat(data.price);
  } catch (error) {
    throw new Error(`Failed to fetch latest price: ${error instanceof Error ? error.message : String(error)}`);
  }
}