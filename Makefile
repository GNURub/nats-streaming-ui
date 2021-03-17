NAME := nats-streaming-ui
TAG ?= $(shell git describe --tags --abbrev=0 --always 2>/dev/null)

default:
	docker build -t gnurub/$(NAME):$(TAG) .
	docker tag gnurub/$(NAME):$(TAG) gnurub/$(NAME):latest
	docker push gnurub/$(NAME):$(TAG)
	docker push gnurub/$(NAME):latest
