COMPOSE_FILE := infraestructura/docker/docker-compose.yml
DC           := docker compose -f $(COMPOSE_FILE)

.PHONY: dev infra stop clean logs ps build pull migrate psql help

dev:
	$(DC) up -d --build

infra:
	$(DC) up -d postgres redis minio minio-init

stop:
	$(DC) down

clean:
	$(DC) down -v

logs:
	$(DC) logs -f $(s)

ps:
	$(DC) ps

migrate:
	$(DC) run --rm migrations

psql:
	docker exec -it aerobot-postgres psql -U postgres -d aeroagent

build:
	$(DC) build --no-cache botBackEnd botWorker

pull:
	$(DC) pull postgres redis minio

help:
	@printf "\n  \033[1mAero Agent — Comandos de desarrollo\033[0m\n\n"
	@printf "  make dev       Levanta todo (construye imágenes)\n"
	@printf "  make infra     Solo infraestructura (postgres, redis, minio)\n"
	@printf "  make stop      Detiene todos los servicios\n"
	@printf "  make clean     Detiene + elimina volúmenes  ⚠ borra datos\n"
	@printf "  make logs      Tail de todos los logs\n"
	@printf "  make logs s=X  Tail de un servicio específico\n"
	@printf "  make ps        Estado de los servicios\n"
	@printf "  make migrate   Corre las migraciones TypeORM\n"
	@printf "  make psql      Abre psql en el contenedor\n"
	@printf "  make build     Reconstruye imágenes sin cache\n"
	@printf "  make pull      Descarga últimas imágenes de infra\n\n"

.DEFAULT_GOAL := help
