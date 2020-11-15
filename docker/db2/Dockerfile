FROM postgres:latest
ENV POSTGRES_PASSWORD gendb
ENV POSTGRES_USER gendb
ENV POSTGRES_DB gendb


WORKDIR /home/gendb
COPY default.sql /docker-entrypoint-initdb.d
