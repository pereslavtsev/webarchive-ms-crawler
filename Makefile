.DEFAULT_GOAL := build
.PHONY: build

BIN := ./node_modules/.bin

JEST = $(BIN)/jest
NEST = $(BIN)/nest
TS_NODE = $(BIN)/ts-node

TYPEORM = ./node_modules/typeorm/cli.js
TYPEORM_SEEDING = ./node_modules/typeorm-seeding/dist/cli.js
ORM_CONFIG = ./src/ormconfig.ts
SEEDING_CONFIG = ./src/ormconfig.seeding.ts

build:
	$(NEST) build

test-debug:
	node \
		--inspect-brk \
		-r tsconfig-paths/register \
		-r ts-node/register \
		$(JEST) \
		--runInBand

migrations-create:
	$(TS_NODE) \
		-r tsconfig-paths/register \
		$(TYPEORM) \
		--config src/ormconfig.ts \
		migration:create -n NewTable

migrations-run:
	$(TS_NODE) \
		-r tsconfig-paths/register \
		$(TYPEORM) \
		--config $(ORM_CONFIG) \
		migration:run

seed-config:
	$(TS_NODE) \
		--project ./tsconfig.json \
		-r tsconfig-paths/register \
		$(TYPEORM_SEEDING) \
		--configName $(SEEDING_CONFIG) \
		config

seed-run:
	$(TS_NODE) \
		--project ./tsconfig.json \
		-r tsconfig-paths/register \
		$(TYPEORM_SEEDING) \
		--configName $(SEEDING_CONFIG) \
		seed
