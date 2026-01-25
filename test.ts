import http from "k6/http";
// import { sleep } from "k6";

export const options = {
  vus: 500,
  duration: "60s",
  cloud: {
    // Project: testing-pro
    projectID: 6480406,
    // Test runs with the same name groups test runs together.
    name: "Test (23/01/2026-18:12:06)",
  },
};

export default function () {
  http.get("http://localhost:3000/api/wallet/getuserbalance/usdt");
  // sleep(1);
}
