# Future Roadmap & Operations Strategy

## 1. DevOps & CI/CD Pipeline
We utilize GitHub Actions to ensure code quality and seamless deployments.

### Workflow Stages
1. **Lint & Format**: Prettier, ESLint (Frontend), Ruff/Black (Backend).
2. **Security Audit**: `npm audit`, Bandit (Python), and TruffleHog (Secrets scanning).
3. **Testing**:
   - Backend: `pytest` with PostgreSQL service container.
   - Frontend: `vitest` unit tests.
4. **Build**: Build Docker images and push to a container registry (e.g., GHCR or Docker Hub).
5. **Deploy**:
   - Staging is deployed on merge to `main`.
   - Production requires manual approval of a GitHub Release.

## 2. Monitoring & Logging
- **Application Performance Monitoring (APM)**: Sentry is deployed on both React and Django to capture unhandled exceptions, performance bottlenecks, and slow database queries.
- **Structured Logging**: Django outputs logs in JSON format. This allows easy ingestion into log aggregators (e.g., Datadog, ELK stack).

## 3. Backup & Disaster Recovery
- **Database**: 
  - Daily automated pg_dump (Full Backup).
  - Continuous WAL archiving to Cloudflare R2 / AWS S3 using tools like `WAL-G` or `pgBackRest`.
  - Point-in-Time Recovery (PITR) capability within a 30-day window.
- **Storage**: Object storage buckets are configured with versioning to protect against accidental deletion of uploaded documents.

## 4. Future Product Roadmap
While the current platform serves as a robust internal request management system, future expansions are planned:

### Phase 2 (Months 6-12)
- **Mobile Application**: React Native app for Customers and Agencies for push notifications and mobile document scanning.
- **Payment Gateway Integration**: Stripe / Razorpay integration to allow customers and agencies to pay for requested services directly on the platform.

### Phase 3 (Months 12-18)
- **API Automation**: Direct integration with airline APIs (Amadeus/Sabre) to issue tickets automatically upon Admin approval.
- **Government Visa Portals**: RPA (Robotic Process Automation) or API integration with Saudi visa portals to reduce manual admin data entry.
- **Multi-language Support**: Full RTL and Arabic language support for the entire dashboard UI.
