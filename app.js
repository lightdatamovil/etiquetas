const express = require("express")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const routes = require("./routes/routes.js")

//require("./db.js")

const server = express()

server.name = "API"

server.all("/proxy/*", (req, res) => {
    const url = req.url.replace("/proxy/", "")
    req.pipe(request(url)).pipe(res)
})

server.use(bodyParser.urlencoded())
server.use(bodyParser.json())
server.use(cookieParser())
server.use(morgan("dev"))
server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
    next()
})

server.use("/", routes)

server.use((err, req, res, next) => {
    const status = err.status || 500
    const message = err.message || err
    console.error(err)
    res.status(status).send(message)
})

module.exports = server
