const crearGuias = require("../controllers/crearGuias")
const response = require("../utils/guia.json")

const {getConnection, getFromRedis, redisClient} = require("../dbconfig.js")

const postGuia = async (req, res) => {
    const { didEmpresa, didEnvios, calidad } = await req.body

    try {
        // const response = await fetch("../utils/guia.json")
        // let datos = await response.json()
        let datos = await response

        const { nombreFantasia, logo, envios } = datos
        let logistica = { nombreFantasia, logo }

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", 'attachment; filename="guia.pdf"')

        if (envios.length > 0) {
            return await crearGuias(calidad, logistica, envios, res)
        } else {
            return res.status(200).json({ message: "No existen envios por imprimir" })
        }
    } catch (error) {
        console.error("Error en postGuia:", error)
        return res.status(500).json({ error: error.message })
    }
}


module.exports = postGuia
