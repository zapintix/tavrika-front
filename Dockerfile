FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# зависимости отдельно (кешируются)
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# копируем исходники
COPY . .

ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV PNPM_CONFIG_MINIMUM_RELEASE_AGE=0

RUN pnpm build

EXPOSE 8000
CMD ["pnpm","run","serve"]
