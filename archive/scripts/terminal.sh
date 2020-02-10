#!/bin/bash
docker-compose run \
  --rm \
  --no-deps \
  --entrypoint bash \
  --workdir /lm \
  commands
