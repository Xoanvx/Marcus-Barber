FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

WORKDIR /usr/share/nginx/html

COPY . .

EXPOSE 80
