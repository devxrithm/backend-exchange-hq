import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 500,
  duration: "60s",
  cloud: {
    projectID: 6480406,
    name: "Buy Order Load Test (23/01/2026)",
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
      // add auth if needed
      // Authorization: "Bearer YOUR_JWT_TOKEN",
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    "status is 200 or 201": (r) => r.status === 200 || r.status === 201,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
