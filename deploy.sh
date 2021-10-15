#!/bin/bash
set -e

if [[ ! $1 ]]; then
    echo 'Usage : ./deploy.sh $tag';
    exit -1;
fi

git fetch --all
git checkout "$1"
docker build -t "slormplanner-image:$1" .
docker rm -f slormplanner
docker run -d -p 4200:8080  --name=slormplanner "slormplanner-image:$1"
docker system prune --all -f