const express = require('express')
const app = express()
const port = 3000

var datum = {
    on: true,
    nome0: {"chave": 0},
    nome1: {"chave": 0},
    nome2: {"chave": 0},
    nome3: {"chave": 0},
    nome4: {"chave": 0},
    nome5: {"chave": 0},
    nome6: {"chave": 0},
    nome7: {"chave": 0},
    nome8: {"chave": 0},
    nome9: {"chave": 0}
}

app.use(express.json())

app.get('/:key', function(req, res) {
    const key = req.params["key"]
    if (key in datum) {
        const payload = JSON.stringify(datum[key])
        console.log(`Getting data in ${key}: ${payload}`)
        res.send(payload)
    } else {
        console.log(`No data in ${key}`)
        res.send(JSON.stringify({error:`key ${key} not found`}))
    }
})

app.put('/:key', function(req, res) {
    const key = req.params["key"]
    const payload = req.body
    console.log(`Setting data in ${key}: ${JSON.stringify(payload)}`)
    datum[key] = payload
    res.sendStatus(201)
})

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
