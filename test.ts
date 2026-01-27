import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 100 }, // ramp up to 100 users
    { duration: "30s", target: 300 }, // ramp up to 300 users
    { duration: "30s", target: 600 }, // ramp up to 600 users
  ],
  noConnectionReuse: true,
  thresholds: {
    http_req_failed: ["rate<0.01"], // <1% failures
    http_req_duration: ["p(95)<3000"], // p95 under 3s
  },
};

export default function () {
  const url = "http://localhost:3000/api/order/buyorder";

  const payload = JSON.stringify({
    currencyPair: "BTCUSDT",
    orderSide: "BUY",
    orderType: "Market",
    entryPrice: 43000,
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
}
