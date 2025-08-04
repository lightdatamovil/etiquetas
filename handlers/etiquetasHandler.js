const crearEtiquetas = require("../controllers/crearEtiquetas")
const { obtenerDatosEnvios, registrarReimpresion } = require("../obtenerdatos")

const postEtiqueta = async (req, res) => {
    const { didEmpresa = 0, didEnvios = [], tipoEtiqueta = 2, calidad = 0, quien = 0, fulfillment = 0, api = 0, didCliente = 0 } = req.body
    const modulo = api == 1 ? `API_${didCliente}` : fulfillment == 1 ? "FF" : "Default"

    if (didEmpresa == 0 || didEnvios.length == 0) {
        return res.status(400).json({
            error: "Faltan campos obligatorios: didEmpresa y didEnvios",
        })
    }

    try {
        const datos = await obtenerDatosEnvios(didEmpresa, didEnvios, fulfillment)

        if (!datos) {
            return res.status(400).json({
                error: "No se encontraron datos para la empresa o envíos proporcionados.",
            })
        }

        const { nombreFantasia, logo, envios } = datos
        let logistica = { nombreFantasia, logo }

        if (envios && envios.length > 0) {
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'attachment; filename="etiqueta.pdf"')

            const result = await crearEtiquetas(didEmpresa, tipoEtiqueta, calidad, logistica, envios, res)

            if (result) {
                await registrarReimpresion(didEmpresa, didEnvios, modulo, quien, fulfillment)
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

const postEtiqueta2 = async (req, res) => {
    const { didEmpresa } = req.params
    let didEnvio = req.params.didEnvio
    didEnvio = [didEnvio]
    const modulo = "Default"
    const calidad = 0
    const tipoEtiqueta = 1
    const quien = 0

    try {
        const datos = await obtenerDatosEnvios(didEmpresa, didEnvio)

        if (!datos) {
            return res.status(400).json({
                error: "No se encontraron datos para la empresa o envíos proporcionados.",
            })
        }

        const { nombreFantasia, logo, envios } = datos
        let logistica = { nombreFantasia, logo }

        if (envios && envios.length > 0) {
            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", 'attachment; filename="etiqueta.pdf"')

            const result = await crearEtiquetas(didEmpresa, tipoEtiqueta, calidad, logistica, envios, res)

            if (result) {
                await registrarReimpresion(didEmpresa, didEnvio, modulo, quien)
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

module.exports = { postEtiqueta, postEtiqueta2 }
