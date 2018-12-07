#!/bin/bash
docker-compose run \
  --rm \
  --no-deps \
  --workdir /lm \
  --entrypoint node \
  commands \
  ./node_modules/.bin/lerna $@
