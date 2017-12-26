FROM nginx:1.13
ARG GIT_COMMIT=unspecified
LABEL git_commit=$GIT_COMMIT
COPY ./dist/ /usr/share/nginx/html
COPY ./nginx/lims-frontend.conf /etc/nginx/conf.d/default.conf
