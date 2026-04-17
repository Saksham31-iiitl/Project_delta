/**
 * Server base path: /api/v1
 * Auth: Bearer token + httpOnly cookie (server sets cookie on verify-otp).
 *
 * When `VITE_MOCK_API=true`, modules use `mockOr()` and `src/mocks/fixtures.js` instead of HTTP.
 */
export { api } from "./client.js";
