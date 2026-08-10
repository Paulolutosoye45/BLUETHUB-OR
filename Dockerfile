# -----------------------------------------------
# Dependencies stage — workspace + locked deps
# -----------------------------------------------
FROM node:20-alpine AS deps
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY apps/landing/package.json apps/landing/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN pnpm install --frozen-lockfile

# -----------------------------------------------
# Web app (apps/web) — Vite build  (target: web)
# -----------------------------------------------
FROM deps AS web
ARG VITE_API_BASE_URL
ARG VITE_APP_URL
ARG VITE_DEFAULT_TENANT
ARG VITE_TENANT_ID
ARG VITE_RC
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_URL=${VITE_APP_URL}
ENV VITE_DEFAULT_TENANT=${VITE_DEFAULT_TENANT}
ENV VITE_TENANT_ID=${VITE_TENANT_ID}
ENV VITE_RC=${VITE_RC}
COPY . .
RUN pnpm turbo build --filter=@bluethub/web

FROM nginx:alpine AS web-nginx
COPY --from=web /app/apps/web/dist /usr/share/nginx/html
COPY nginx/web.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# -----------------------------------------------
# Landing page (apps/landing) — build  (target: landing)
# -----------------------------------------------
FROM deps AS landing
COPY . .
RUN pnpm turbo build --filter=@bluethub/landing --force

FROM nginx:alpine AS landing-nginx
COPY --from=landing /app/apps/landing/dist /usr/share/nginx/html
COPY nginx/landing.conf /etc/nginx/conf.d/default.conf
EXPOSE 80