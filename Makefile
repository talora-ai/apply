.PHONY: init up down restart ps logs backend horizon reset build \
        artisan npm redis-ping redis-check

init:
	./docker/talora init

up:
	./docker/talora up

down:
	./docker/talora down

restart:
	./docker/talora restart

ps:
	./docker/talora ps

logs:
	./docker/talora logs

backend:
	./docker/talora backend

horizon:
	./docker/talora horizon

artisan:
	./docker/talora artisan $(filter-out $@,$(MAKECMDGOALS))

npm:
	./docker/talora npm $(filter-out $@,$(MAKECMDGOALS))

redis-ping:
	./docker/talora redis-ping

redis-check:
	./docker/talora redis-check

build:
	docker compose --env-file .env.docker -f compose.yaml build

reset:
	./docker/talora reset

%:
	@: