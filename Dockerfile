ARG NODE_IMAGE=docker.1panel.live/library/node:24-alpine
ARG NGINX_IMAGE=docker.1panel.live/library/nginx:stable-alpine
FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json ./
# The web build only needs esbuild; skip the CLI-only ffmpeg download.
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY src ./src
COPY gallery ./gallery
COPY tools ./tools
RUN npm run build:web

FROM ${NGINX_IMAGE}
COPY deploy/site.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/gallery /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
