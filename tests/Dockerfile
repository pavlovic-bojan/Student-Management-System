# SMS Tests – Playwright (API + E2E) + k6
# Build from project root: docker build -f tests/Dockerfile -t sms-tests .

FROM node:20-bookworm-slim

# Install k6
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates gnupg2 curl \
    && curl -s https://dl.k6.io/key.gpg | gpg --dearmor | tee /usr/share/keyrings/k6-archive-keyring.gpg > /dev/null \
    && echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list \
    && apt-get update && apt-get install -y k6 \
    && rm -rf /var/lib/apt/lists/* \
    && k6 version

WORKDIR /app

# Copy package files (monorepo)
COPY package.json package-lock.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY tests/e2e/package*.json ./tests/e2e/
COPY tests/performance/package*.json ./tests/performance/

RUN npm ci

# Copy source
COPY backend ./backend
COPY frontend ./frontend
COPY tests ./tests

# Playwright browsers (Chromium)
RUN cd tests/e2e && npx playwright install chromium --with-deps

ENV CI=1

# Run: docker run sms-tests [api|e2e|performance]. Default: api
ENTRYPOINT ["sh", "-c", "case \"${1:-api}\" in api) npm run tests:api ;; e2e) npm run tests:e2e ;; performance) npm run tests:performance ;; *) npm run tests:api ;; esac"]
CMD ["api"]
