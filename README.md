# Baleia compositora

![Docker Image CI](https://github.com/marcosvpj/baleia-compositora/workflows/Docker%20Image%20CI/badge.svg)


## Explicar o problema

Temos 3 aplicações em nossas mãos, e queremos que todas elas rodem e possam interagir como esperado.

Para isso, poderíamos [rodar todas elas diretamente](https://pt.wikipedia.org/wiki/Luzia_(f%C3%B3ssil) "assim como fazia nossa cara Luzia"), mas não é o que faremos hoje.

Gostaríamos na verdade de conteinerizar as aplicaçoes nas pastas `server`, `uploader` e `downloader`, e usar os mecanismos de rede e volumes do docker para conectá-las.

Mas antes, precisamos saber o que elas fazem!

* [server](/server): um servidor HTTP feito com Node.js e JavaScript. Este funcionará como a nossa 'database', pois ele se comporta como um dicionário, e provê as seguintes funcionalidades:
  * <abbr title="num pedido do tipo PUT é esperado que se envie algum dado no corpo da mensagem">PUT</abbr> `http://<host>:3000/<chave>`: salva o conteúdo do corpo da mensagem dentro da dada chave para depois poder ser lido usando...
  * GET `http://<host>:3000/<chave>`: nos retorna um json válido que esta salvo nessa chave


* [downloader](/downloader): um script Python que ciclicamente faz pedidos GET no servidor, para pegar o conteudo nas chaves e baixar como arquivos json numa pasta. deve ser invocado simplesmente com `python main.py`, porém você deve ter as seguintes variáveis de ambiente definidas:
  * `SERVIDOR`: endereço do servidor que vai se consultar
  * `NOME_BASE`: base do nome dos arquivos para baixar do servidor

* [uploader](/uploader): um binário, que varre os conteudos de certa pasta, lendo arquivos json com certo nome, incrementa o valor numa certa chave desses objetos, e realiza pedidos PUT no servidor, atualizando o dado que esta lá. deve ser invocado da seguinte maneira:
```
./dapp <servidor para se enviar> \
       <pasta para verificar> \
       <base do nome do arquivo> \
       <chave para incrementar>
```

Então precisamos que o [server](/server) esteja disponível para pedidos de ambos [uploader](/uploader) e [downloader](/downloader), e que estes dois possam ler e escrever arquivos em uma pasta comum. Você pode usar o script [populate.sh](/populate.sh) para popular esta pasta com um estado inicial válido.

Este pequeno sistema pode ser considerado em funcionamento se:
* a pasta [data](/data "se ela não existir, basta criá-la") contendo os arquivos `nome$i.json`, com `i` de 0 a 9
* o conteúdo de cada arquivo for no formato `{"chave": N}`, com N crescendo o tempo todo!

## Resolver sem utilizar docker compose (exercicio)

Consegue dockerizar as aplicações e coordená-las para rodar corretamente sem usar `docker-compose`?

Acredite, é um exercício válido, e vai fazer você valorizar mais o que o compose tem a oferecer...

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
