const crearEtiquetas = require("../controllers/crearEtiquetas")
const { obtenerDatosEnvios } = require("../obtenerdatos")

const postEtiqueta = async (req, res) => {
    const { didEmpresa, didEnvios, tipoEtiqueta, calidad } = req.body

    try {
        const datos = await obtenerDatosEnvios(didEmpresa, didEnvios)

        if (!datos) {
            return res.status(400).json({ error: "No se encontraron datos para la empresa o envíos proporcionados." })
        }

        const { nombreFantasia, logo, envios } = datos
        let logistica = { nombreFantasia, logo }

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", 'attachment; filename="etiqueta.pdf"')

        if (envios && envios.length > 0) {
            return await crearEtiquetas(tipoEtiqueta, calidad, logistica, envios, res)
        } else {
            return res.status(200).json({ message: "No existen envíos por imprimir" })
        }
    } catch (error) {
        console.error("Error en postEtiqueta:", error)
        return res.status(500).json({ error: error.message })
    }
}

module.exports = postEtiqueta
