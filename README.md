# Baleia compositora

![Docker Image CI](https://github.com/marcosvpj/baleia-compositora/workflows/Docker%20Image%20CI/badge.svg)


## Explicar o problema

Temos 3 aplicações em nossas mãos, e queremos que todas elas rodem e possam interagir como esperado.

Para isso, poderíamos [rodar todas elas diretamente](https://pt.wikipedia.org/wiki/Luzia_(f%C3%B3ssil) "assim como fazia nossa cara Luzia"), mas não é o que faremos hoje.

Gostaríamos na verdade de conteinerizar as aplicaçoes nas pastas `server`, `uploader` e `downloader`, e usar os mecanismos de rede e volumes do docker para conectá-las.

Mas antes, precisamos saber o que elas fazem!

* [server](/server): um servidor HTTP feito com Node.js e JavaScript. Este funcionará como a nossa 'database', pois ele se comporta como um dicionário, e provê as seguintes funcionalidades:
  * <abbr title="num pedido do tipo PUT é esperado que se envie algum dado no corpo da mensagem">PUT</abbr> `http://<host>:3000/<chave>`: salva o conteúdo do corpo da mensagem, se for um json válido, sob o nome chave, para depois poder ser lido usando...
  * GET `http://<host>:3000/<chave>`: nos retorna um json válido que está salvo nessa chave

## Resolver sem utilizar docker compose (exercicio)

## Docker compose



### Diferentes versões

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

Dentro de um serviço podemos definir os volumes que o serviço vai tulizar.
Temos duas opções de como definir os volumes, um modo resumido e um mais verboso.

Modo resumido segue o formatto `[SOURCE:]TARGET[:MODE]`

`SOURCE` pode ser um local na maquina host ou um volume pré definido. Caso não seja informado sera criado um volume.
`TARGET` é o cominho no container
`MODE` é o modo de acesso, podendo ser `ro` para somente leitura ou `rw` leitura e escrita

```yml
version: '3'
services:
  redis:
    image: "redis:alpine"
    volumes:
        - arquivos:/files
  web:
    build: servico-p/.
    depends_on:
        - 'redis'
    ports:
      - "5000:5000"
    environment:
        - REDIS_HOST=redis
        - REDIS_PORT=6379
    volumes:
        - ./servico-p:/p
        - arquivos:/files
volumes:
    arquivos:
```

Nesse exemplo é feito o compartilhamento entre arquivos da maquina host da pasta `servico-p` com a pasta no container `/p`.

E tambem foi criado um volume chamado `arquivos` para compartilhar arquivos entre os dois containers na pasta `/files`

Podemos confirmar entrando nos containers e criando arquivos lá

```bash
docker-compose ps

docker-compose exec web sh
echo 'Helow' > /files/oie.txt
cat /files/oie.txt
exit

docker-compose exec redis sh
ls /files/
cat /files/oie.txt
exit
```

https://docs.docker.com/compose/compose-file/#volumes

### container com container (exercicio)
### host com container (exercicio)
