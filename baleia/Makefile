baleia-net:
ifeq ($(shell docker network ls | grep baleia-net),)
	docker network create baleia-net
endif

build-server:
	docker build -t baleia-server ./server

baleia-server: build-server baleia-net
ifeq ($(shell docker ps | grep baleia-server),)
	docker run --rm -d \
		-p 3000:3000 \
		--network baleia-net \
		--name baleia-server \
		baleia-server
endif

build-uploader:
	docker build -t baleia-uploader ./uploader

baleia-uploader: build-uploader
ifeq ($(shell docker ps | grep baleia-uploader),)
	docker run --rm -d \
		-v $(PWD)/data:/out \
		--network baleia-net \
		--name baleia-uploader \
		baleia-uploader \
		'http://baleia-server:3000' /out nome chave
endif

build-downloader:
	docker build -t baleia-downloader ./downloader

baleia-downloader: build-downloader
ifeq ($(shell docker ps | grep baleia-downloader),)
	docker run --rm -d \
		-v $(PWD)/data:/out \
		-e SERVIDOR='http://baleia-server:3000' \
      	-e NOME_BASE=nome \
		--network baleia-net \
		--name baleia-downloader \
		baleia-downloader
endif

start: baleia-net baleia-server baleia-uploader baleia-downloader
	watch -d -n 0.2 'ls data | xargs -I % cat data/%'

kill:
ifneq ($(shell docker ps | grep baleia-downloader),)
	-docker kill baleia-downloader
endif
ifneq ($(shell docker ps | grep baleia-uploader),)
	-docker kill baleia-uploader
endif
ifneq ($(shell docker ps | grep baleia-server),)
	-docker kill baleia-server
endif
ifneq ($(shell docker network ls | grep baleia-net),)
	-docker network rm baleia-net
endif
	-rm -f data/nome*
