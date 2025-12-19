const server = require("./app.js")
const port = 13000

server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
})
