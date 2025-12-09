const crearEtiquetas = require("../controllers/crearEtiquetas")
const { executeQuery, getConnection } = require("../dbconfig")
const { obtenerDatosEnvios, registrarReimpresion } = require("../obtenerdatos")
const { obtenerDatosEnviosFF } = require("../obtenerdatosFF")

const postEtiqueta = async (req, res) => {
    const { didEmpresa = 0, didEnvios = [], tipoEtiqueta = 2, calidad = 0, quien = 0, fulfillment = 0, api = 0, didCliente = 0, sistema = 0 } = req.body
    const modulo = api == 1 ? `API_${didCliente}` : fulfillment == 1 ? "FF" : "Default"

    if (didEmpresa == 0 || didEnvios.length == 0) {
        return res.status(400).json({
            error: "Faltan campos obligatorios: didEmpresa y didEnvios",
        })
    }

    try {
        let datos = []
        if (sistema == 0) {
            datos = await obtenerDatosEnvios(didEmpresa, didEnvios, fulfillment)
        } else {
            datos = await obtenerDatosEnviosFF(didEmpresa, didEnvios)
        }

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

            const result = await crearEtiquetas(didEmpresa, tipoEtiqueta, calidad, logistica, envios, sistema, res)

            if (result) {
                if (sistema == 0) {
                    await registrarReimpresion(didEmpresa, didEnvios, modulo, quien, fulfillment)
                }
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

const getEtiqueta = async (req, res) => {
    const { token, didEmpresa, didEnvio, tipoEtiqueta = 2, calidad = 0, quien = 0, fulfillment = 0 } = req.query

    if (!token || !didEmpresa || !didEnvio) {
        return res.status(400).json({
            error: "Faltan campos obligatorios: token, didEmpresa y didEnvio",
        })
    }

    if (token.length !== 128) {
        return res.status(400).json({ error: "Token no válido" })
    }

    let didEnvios = [didEnvio]
    let modulo = "Default"

    const connection = await getConnection(didEmpresa)

    try {
        const queryToken = `
            SELECT did 
            FROM clientes 
            WHERE token_api_ext = ? AND superado = 0 AND elim = 0
        `
        const resulCliente = await executeQuery(connection, queryToken, [token])

        if (resulCliente.length === 0) {
            return res.status(404).json({
                error: "No se encontraron datos para el token proporcionado.",
            })
        }

        const didCliente = resulCliente[0].did

        const checkEnvio = `
            SELECT did 
            FROM envios 
            WHERE did = ? AND didCliente = ? AND superado = 0 AND elim = 0
        `
        const resultEnvios = await executeQuery(connection, checkEnvio, [didEnvio, didCliente])

        if (resultEnvios.length === 0) {
            return res.status(404).json({ error: "Este envío no pertenece a este cliente." })
        }

        const datos = await obtenerDatosEnvios(didEmpresa, didEnvios, fulfillment)

        if (!datos) {
            return res.status(400).json({
                error: "No se encontraron datos para la empresa o envíos proporcionados.",
            })
        }

        const { nombreFantasia, logo, envios } = datos
        const logistica = { nombreFantasia, logo }

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
        console.error("Error en getEtiqueta:", error)
        return res.status(500).json({ error: error.message })
    } finally {
        if (connection && connection.end) connection.end()
    }
}

module.exports = { postEtiqueta, postEtiqueta2, getEtiqueta }
