FROM alpine as denv

RUN apk update && apk upgrade && apk add build-base && \
    apk --no-cache add -X http://dl-cdn.alpinelinux.org/alpine/edge/testing \
    dub ldc

FROM denv as deps

WORKDIR /app

COPY dub.sdl .

RUN mkdir source && echo "void main(){}" > source/app.d && dub build --compiler=ldc2

FROM deps as build

COPY source/ source/

RUN dub build --compiler=ldc2 -b=release-nobounds

FROM scratch

WORKDIR /app

COPY --from=build /app/dapp .

ENTRYPOINT [ "./dapp" ]