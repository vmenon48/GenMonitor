FROM postgres:latest
ENV POSTGRES_PASSWORD gendb
ENV POSTGRES_USER gendb
ENV POSTGRES_DB gendb
ENV POSTGRES_PORT=32784


WORKDIR /home/gendb
COPY default.sql /docker-entrypoint-initdb.d
