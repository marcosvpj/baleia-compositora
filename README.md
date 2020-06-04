# Baleia compositora


## Explicar o problema
## Resolver sem utilizar docker compose (exercicio)

## Introdução dos pontos fortes do compose
### Versões dos arquivos

Arquivos do docker-compose possuem 3 diferentes versões, que não compativeis entre si.

Se não for especificado a versão, utilizando o `version: 'x.x'` o compose considera que é a versão 1.
Na mesma linha, se for informado apenas o primeiro digito, o decimal sera considerado 0. Assim `version: '2'` e `version: '2.1'` são equivalentes.


## Criar arquivo configuração do docker-compose.yml

```yml
version: '2.0'
services:
  web:
    build: .
    ports:
    - "5000:5000"
    volumes:
    - .:/code
    - logvolume01:/var/log
    links:
    - redis
  redis:
    image: redis
volumes:
  logvolume01: {}
```

Nesse link tem a lista de todas as configurações disponiveis separadas por versão:
https://docs.docker.com/compose/compose-file/


### Build de tudo de uma só vez (Exercicio)

Podemos fazer de dois modos.

Utilizando uma imagem já existente com a opção `image` ou fazendo o build de um Dockerfile com a opção `build`.

```yml
version: '3'
services:
  web:
    build: servico-p/.
  redis:
    image: "redis:alpine"
```

```sh
docker-compose up
```

Alguns outros comandos:

#### docker-compose ps

```
           Name                         Command               State           Ports         
--------------------------------------------------------------------------------------------
baleia-compositora_redis_1   docker-entrypoint.sh redis ...   Up      6379/tcp              
baleia-compositora_web_1     flask run                        Up      0.0.0.0:5000->5000/tcp
```


#### docker-compose stop

Para o funcionamento dos containers, mas mantem o estado

#### docker-compose down

Interrompe os containers, e remove os volumes e as redes.

#### docker-compose log

```bash
docker-compose log <nome-do-container>
```



## Rede (exercicio)

Por padrão compose cria uma rede entre todos os container.

O nome dessa rede é definido pelo nome da pasta seguido de `_default`, no nosso caso fica `baleia-compositora_default`.

Nessa rede cada container pode acessar os outros pelo nome definido do serviço, assim teremos os hosts `web` e `redis`

Para export as portas, podemos fazer utilizando a configuração `ports`, seguindo o padrão `HOST:CONTAINER`.

Na documentação é possivel encontrar outros formatos de mapeamento aceitos: https://docs.docker.com/compose/compose-file/#ports


```yml
version: '3'
services:
  web:
    image: servico-p:latest
    ports:
      - "5050:5000"
  redis:
    image: "redis:alpine"
```


### Variáveis de ambiente (exercicio)

Chave de configuração `environment`.
Esse é apenas um dos modos de se fazer. Tambem é possivel utilizar as variaveis ja existentes na maquina host.
Ou tambem definir elas em um arquivo.


```yml
version: '3'
services:
  redis:
    image: "redis:alpine"
  web:
    build: servico-p/.
    ports:
      - "5000:5000"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
```

https://docs.docker.com/compose/environment-variables/


### Ordem de execução (exercicio)

Em alguns casos com varios container vamos precisar que eles iniciem em uma determinada ordem.
Para garatir isso temos a keyword `depends_on`

```yml
version: '3'
services:
  redis:
    image: "redis:alpine"
  web:
    build: servico-p/.
    depends_on:
        - 'redis'
    ports:
      - "5000:5000"
    environment:
        - REDIS_HOST=redis
        - REDIS_PORT=6379
```

Um porém, só é garantido a ordem que os containers sobem, mas não que o serviço dentro dele esteja efetivemente rodando.

Mais informações em: https://docs.docker.com/compose/startup-order/

## Compartilhamento de volume
### container com container (exercicio)
### host com container (exercicio)
