.DEFAULT_GOAL := help

COMPOSE := docker compose -f docker-compose.yml

.PHONY: help dev up down logs restart rebuild prod prod-down prod-logs clean shell-backend shell-db shell-frontend backend backend-logs backend-restart frontend frontend-logs frontend-restart

help: ## Affiche les commandes disponibles
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "%-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev up: ## Démarre l'environnement de développement avec reload automatique
	$(COMPOSE) up -d --build

down: ## Arrête les services Docker
	$(COMPOSE) down

logs: ## Affiche les logs en direct
	$(COMPOSE) logs -f

restart: ## Redémarre les services
	$(COMPOSE) restart

backend: ## Démarre uniquement le backend
	$(COMPOSE) up -d ssl-monitor

logs-backend: ## Affiche les logs du backend
	$(COMPOSE) logs -f ssl-monitor

restart-backend: ## Redémarre uniquement le backend
	$(COMPOSE) restart ssl-monitor

frontend: ## Démarre uniquement le frontend
	$(COMPOSE) up -d ssl-frontend

logs-frontend: ## Affiche les logs du frontend
	$(COMPOSE) logs -f ssl-frontend

restart-frontend: ## Redémarre uniquement le frontend
	$(COMPOSE) restart ssl-frontend

rebuild: ## Recrée complètement l'environnement de développement
	$(COMPOSE) down
	$(COMPOSE) up -d --build

prod: ## Démarre l'environnement de production
	$(COMPOSE) --profile prod up -d --build

prod-down: ## Arrête l'environnement de production
	$(COMPOSE) --profile prod down

prod-logs: ## Affiche les logs du mode production
	$(COMPOSE) --profile prod logs -f

clean: ## Arrête et supprime les volumes
	$(COMPOSE) down -v --remove-orphans

shell-backend: ## Ouvre un shell dans le backend
	$(COMPOSE) exec ssl-monitor sh

shell-db: ## Ouvre un shell dans MySQL
	$(COMPOSE) exec db sh

shell-frontend: ## Ouvre un shell dans le frontend
	$(COMPOSE) exec ssl-frontend sh