// Set env before any module that reads process.env (e.g. config/env)
process.env.NODE_ENV = 'test';
process.env.SKIP_AUTH_FOR_TESTS = '1'; // Let integration tests use x-test-tenant-id header
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/sms_test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-jwt-secret-min-32-chars-long';
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET || 'test-session-secret-32-chars';
