import http from "k6/http";
import { check, sleep } from "k6";

// Pool of trading pairs
const PAIRS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
];

export const options = {
  vus: 500,
  duration: "60s",
  noConnectionReuse: true,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<3000"],
  },
};

function randomPair() {
  return PAIRS[Math.floor(Math.random() * PAIRS.length)];
}

function randomSide() {
  return Math.random() > 0.5 ? "BUY" : "SELL";
}

function randomPrice() {
  return 42000 + Math.floor(Math.random() * 2000);
}

export default function () {
  const url = "http://localhost:3000/api/order/buyorder";

  const payload = JSON.stringify({
    currencyPair: randomPair(), // 🔥 random partition key
    orderSide: randomSide(),
    orderType: "Market",
    entryPrice: randomPrice(),
    positionStatus: "Pending",
    orderAmount: 0.01,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    "status is 200 or 201": (r) => r.status === 200 || r.status === 201,
  });

  // small pause to simulate real user think-time
  sleep(0.1);
}
