import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, 
    { duration: '30s', target: 20 }, 
    { duration: '10s', target: 0 },  
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], 
  },
};

export default function () {

  const category = ['electronics', 'clothing', 'home', 'grocery'][Math.floor(Math.random() * 4)];
  const res = http.get(`http://localhost:3000/products?category=${category}&limit=20`);
  
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
