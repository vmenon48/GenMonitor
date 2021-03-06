#!/usr/bin/bash

DOCKER_NAME=gen-db
VERSION=1.1

if [ -e back-end ]; then
  rm -rf default.sql
fi
cp -r ../../db/default.sql .

docker stop $DOCKER_NAME
docker rm $DOCKER_NAME

docker build -t $DOCKER_NAME:$VERSION .
docker create --name $DOCKER_NAME -P -t $DOCKER_NAME:$VERSION
docker start $DOCKER_NAME
