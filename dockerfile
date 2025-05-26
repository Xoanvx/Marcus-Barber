FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

WORKDIR /usr/share/nginx/html

COPY . .

RUN cp INICIO/index.html ./index.html
RUN cp INICIO/style.css ./style.css

EXPOSE 80
