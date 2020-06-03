const express = require('express')
const app = express()
const port = 3000

var datum = {on: true}

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
    console.log(`Current datum: ${JSON.stringify(datum, null, 2)}`)
    res.sendStatus(201)
})

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))