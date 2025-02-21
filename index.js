const server = require("./app.js")
const port = 3000

server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
})
