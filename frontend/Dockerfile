FROM node:lts AS build

WORKDIR /react-app-tmp
COPY . /react-app-tmp
RUN npm install
RUN npx tailwindcss -i /react-app-tmp/public/index.css -o /react-app-tmp/public/main.css
RUN export BUILD_PATH="/react-app" && npm run build

FROM nginx:alpine
COPY --from=build /react-app /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
LABEL org.opencontainers.image.source=https://github.com/M4RC02U1F4A4/hakw