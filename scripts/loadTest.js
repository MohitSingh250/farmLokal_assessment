import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up
    { duration: '30s', target: 20 }, // Sustained load
    { duration: '10s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // P95 response time must be < 200ms
  },
};

export default function () {
  // flexible random parameters to hit cache misses too
  const category = ['electronics', 'clothing', 'home', 'grocery'][Math.floor(Math.random() * 4)];
  const res = http.get(`http://localhost:3000/products?category=${category}&limit=20`);
  
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
