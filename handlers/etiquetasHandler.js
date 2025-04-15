const crearEtiquetas = require("../controllers/crearEtiquetas")
const { obtenerDatosEnvios, registrarReimpresion } = require("../obtenerdatos")

const postEtiqueta = async (req, res) => {
    const { didEmpresa, didEnvios, tipoEtiqueta, calidad, quien } = req.body
    const modulo = "Default"

    try {
        const datos = await obtenerDatosEnvios(didEmpresa, didEnvios)

        if (!datos) {
            return res.status(400).json({ error: "No se encontraron datos para la empresa o envíos proporcionados." })
        }

        const { nombreFantasia, logo, envios } = datos
        let logistica = { nombreFantasia, logo }

        if (envios && envios.length > 0) {
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'attachment; filename="etiqueta.pdf"')

            const result = await crearEtiquetas(tipoEtiqueta, calidad, logistica, envios, res)

            if (result) {
                await registrarReimpresion(didEmpresa, didEnvios, modulo, quien)
                return res.end()
            } else {
                return res.status(500).json({ error: "No se pudo generar el PDF" })
            }
        } else {
            return res.status(200).json({ message: "No existen envíos por imprimir" })
        }
    } catch (error) {
        console.error("Error en postEtiqueta:", error)
        return res.status(500).json({ error: error.message })
    }
}

module.exports = postEtiqueta
