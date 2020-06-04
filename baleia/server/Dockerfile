FROM node

WORKDIR /app

RUN npm install --save express

COPY main.js .

ENTRYPOINT [ "node", "/app/main.js" ]
