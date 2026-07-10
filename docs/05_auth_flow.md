# Authentication & Authorization Flow

## 1. Core Principles
- **Stateless Verification**: Uses JSON Web Tokens (JWT) for horizontal scalability.
- **Defense in Depth**: Combines Access Tokens in memory, Refresh Tokens in `HttpOnly` cookies, and CSRF protection.
- **Zero Trust**: Every API request is verified against the user's role and the requested resource's ownership.

## 2. Agency & Admin Login Flow (MFA Enforced)
Agencies and Admins handle sensitive data, requiring an extra layer of security.

1. **Credentials Submission**: The user submits `email` and `password` via HTTPS.
2. **First Factor Verification**: Backend verifies the credentials against the Argon2id hash.
3. **MFA Challenge**: Instead of returning tokens immediately, the backend returns `requires_otp: true` and an `otp_token`.
4. **OTP Dispatch**: Backend asynchronously sends an OTP via Email (or validates TOTP if configured).
5. **OTP Verification**: The client submits the `otp_token` and the `code`.
6. **Token Issuance**:
   - `access_token` returned in JSON payload (short-lived: 15 mins).
   - `refresh_token` set as an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (long-lived: 7 days).

## 3. Customer Login Flow
Customers have limited access and do not require mandatory MFA.

1. **Credentials Submission**: User submits `email` and `password`.
2. **Verification & Issuance**: If valid, backend immediately issues the `access_token` (JSON) and `refresh_token` (Cookie).

## 4. Token Refresh Flow
When the short-lived `access_token` expires, the frontend interceptor handles the refresh seamlessly.

1. **Silent Refresh Request**: Client calls `/api/v1/auth/refresh`. No tokens are sent in the body; the browser automatically includes the `refresh_token` cookie.
2. **Validation & Rotation**:
   - Backend validates the `refresh_token`.
   - If valid, a **new** `refresh_token` is generated and replaces the old one in the cookie (Refresh Token Rotation).
   - A new `access_token` is returned in the JSON response.
3. **Retry**: The client retries the failed API request with the new `access_token`.

## 5. Security Mitigations
- **Cross-Site Scripting (XSS)**: Prevented because the `refresh_token` cannot be read via `document.cookie`. The `access_token` is kept in React state, not LocalStorage.
- **Cross-Site Request Forgery (CSRF)**: Prevented by `SameSite=Strict` on the refresh cookie, and requiring a custom `X-CSRFToken` header for state-changing operations.
- **Brute Force**: Enforced via rate limiting on the `/auth/login` and `/auth/verify-otp` endpoints (e.g., max 5 attempts per 15 minutes per IP).
