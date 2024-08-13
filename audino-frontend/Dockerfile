FROM node:lts-slim AS cvat-ui

ARG WA_PAGE_VIEW_HIT
ARG UI_APP_CONFIG
ARG CLIENT_PLUGINS
ARG DISABLE_SOURCE_MAPS
ARG SOURCE_MAPS_TOKEN

ENV TERM=xterm \
    LANG='C.UTF-8'  \
    LC_ALL='C.UTF-8'

# Install dependencies
COPY . /tmp/

# Install commonc dependencies
WORKDIR /tmp
RUN npm install --legacy-peer-deps

# Build source code
RUN npm run build

FROM nginx:1.25.4-alpine3.18
# Replace default.conf configuration to remove unnecessary rules
COPY react_nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=cvat-ui /tmp/build /usr/share/nginx/html/
