TDCFILES  := $(shell ls src/main/java/ml/peya/plugins --color=auto)

.DEFAULT_GOAL := help

all:
  make dotnet

edit: ## Edit makefile
  edit Makefile

list: ## Show source files in this repo
	@$(foreach val, $(PSACFILES), /bin/ls -dF $(val);)

clean: ## Remove built files
	@mvn clean

help: ## Self-documented Makefile
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

dotnet: ## Compile and Package to .jar file
  dotnet build
