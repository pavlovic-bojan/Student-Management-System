/**
 * API Request Module for k6 - Student Management System (SMS)
 * Contains reusable API request functions for SMS endpoints
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { getConfig } from './config.js';
import { getRequestParams } from './auth.js';

/**
 * GET /api/health - no auth required
 * @returns {Object} Response object
 */
export function getHealth() {
  const config = getConfig();
  const url = `${config.baseUrl}${config.endpoints.health}`;

  const response = http.get(url, {
    headers: config.headers,
    tags: { endpoint: 'health', method: 'GET' },
  });

  check(response, {
    'health - status is 200': (r) => r.status === 200,
    'health - response time < 2s': (r) => r.timings.duration < 2000,
    'health - has status ok': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data && data.status === 'ok';
      } catch {
        return false;
      }
    },
  });

  return response;
}

/**
 * GET /api/auth/me - requires JWT
 * @returns {Object} Response object or null if no token
 */
export function getMe() {
  const config = getConfig();
  if (!config.authToken) return null;

  const url = `${config.baseUrl}${config.endpoints.me}`;
  const params = getRequestParams();

  const response = http.get(url, {
    ...params,
    tags: { ...params.tags, endpoint: 'auth/me', method: 'GET' },
  });

  check(response, {
    'auth/me - status is 200': (r) => r.status === 200,
    'auth/me - response time < 3s': (r) => r.timings.duration < 3000,
    'auth/me - has user id': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data && typeof data.id === 'string';
      } catch {
        return false;
      }
    },
  });

  return response;
}

/**
 * GET /api/tenants - requires Platform Admin JWT
 * @returns {Object} Response object or null if no token
 */
export function getTenants() {
  const config = getConfig();
  if (!config.authToken) return null;

  const url = `${config.baseUrl}${config.endpoints.tenants}`;
  const params = getRequestParams();

  const response = http.get(url, {
    ...params,
    tags: { ...params.tags, endpoint: 'tenants', method: 'GET' },
  });

  // 200 or 403 (if not Platform Admin) - we accept both for load test
  check(response, {
    'tenants - status 200 or 403': (r) => r.status === 200 || r.status === 403,
    'tenants - response time < 3s': (r) => r.timings.duration < 3000,
  });

  return response;
}

/**
 * Simulate user think time
 */
export function thinkTime(min = 0.5, max = 1.5) {
  sleep(Math.random() * (max - min) + min);
}
