FROM nginx:1.13
COPY ./dist/ /usr/share/nginx/html
COPY ./nginx/lims-frontend.conf /etc/nginx/conf.d/default.conf
