const e = require("express")
const mysql = require("mysql")
const redis = require("redis")
require("dotenv").config()
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env

const redisClient = redis.createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
    password: REDIS_PASSWORD,
})

redisClient.on("error", (err) => {
    console.error("Error al conectar con Redis:", err)
})
;(async () => {
    await redisClient.connect()
    console.log("Redis conectado")
})()

async function getConnection(idempresa) {
    try {
        if (typeof idempresa !== "string" && typeof idempresa !== "number") {
            throw new Error(`idempresa debe ser un string o un número, pero es: ${typeof idempresa}`)
        }

        const redisKey = "empresasData"
        const empresasData = await getFromRedis(redisKey)
        if (!empresasData) {
            throw new Error(`No se encontraron datos de empresas en Redis.`)
        }

        const empresa = empresasData[String(idempresa)]
        if (!empresa) {
            throw new Error(`No se encontró la configuración de la empresa con ID: ${idempresa}`)
        }

        const config = {
            host: "bhsmysql1.lightdata.com.ar",
            database: empresa.dbname,
            user: empresa.dbuser,
            password: empresa.dbpass,
        }

        return { connection: mysql.createConnection(config), empresasData }
    } catch (error) {
        console.error(`Error al obtener la conexión:`, error.message)
        throw {
            status: 500,
            response: {
                estado: false,
                error: -1,
            },
        }
    }
}

async function getFromRedis(key) {
    try {
        const value = await redisClient.get(key)
        return value ? JSON.parse(value) : null
    } catch (error) {
        console.error(`Error obteniendo clave ${key} de Redis:`, error)
        throw {
            status: 500,
            response: {
                estado: false,
                error: -1,
            },
        }
    }
}

//FUNCION PARA OBTEBNER LOS DATOS DE LAS ETIQUETAS
const obtenerDatosEnvios = async (idempresa, dids) => {
    try {
        let cacheLogos = {}
        let arrEnvios = []
        let camposEspeciales = []

        let logo

        let { connection, empresasData } = await getConnection(idempresa)

        const nombreFantasia = empresasData[String(idempresa)]?.empresa || null
        const tieneFullfillment = empresasData[String(idempresa)]?.fullfilment || null

        // Verificar si el logo ya está en la caché
        if (cacheLogos[nombreFantasia]) {
            logo = cacheLogos[nombreFantasia]
        } else {
            // Si no está en caché, lo generamos y guardamos
            logo = `${empresasData[String(idempresa)]?.url}/app-assets/images/logo/logo.png` || null
            cacheLogos[nombreFantasia] = logo
        }

        // Query para los envios
        let query = `
                    SELECT e.*, edd.localidad, edd.ciudad, edd.address_line, edd.cp, eo.observacion, c.nombre_fantasia
                    FROM envios e
                    LEFT JOIN envios_direcciones_destino edd ON e.did = edd.didEnvio AND edd.superado = 0 AND edd.elim = 0
                    LEFT JOIN envios_observaciones eo ON e.did = eo.didEnvio AND eo.superado = 0 AND eo.elim = 0
                    LEFT JOIN clientes c ON e.didCliente = c.did AND c.superado = 0
                    WHERE e.did IN (?) AND e.superado = 0 AND e.elim = 0
                `

        let envios = await new Promise((resolve, reject) => {
            connection.query(query, [dids], (error, results) => {
                if (error) return reject(error)
                resolve(results)
            })
        })

        let queryCamposEspeciales = `
            SELECT e.did AS didEnvio, ec.valor AS campo_valor, sdp.nombre AS campo_nombre
            FROM envios e
            LEFT JOIN envios_campos_extras ec ON e.did = ec.didEnvio AND ec.superado = 0 AND ec.elim = 0
            LEFT JOIN sistema_datospaqueteria sdp ON ec.didCampo = sdp.did AND sdp.superado = 0 AND sdp.elim = 0
            WHERE e.did IN (?) AND e.superado = 0 AND e.elim = 0
            AND (ec.valor IS NOT NULL OR sdp.nombre IS NOT NULL)
        `

        camposEspeciales = await new Promise((resolve, reject) => {
            connection.query(queryCamposEspeciales, [dids], (error, results) => {
                if (error) return reject(error)
                resolve(results)
            })
        })

        // console.log("camposEspecialesssss------------", camposEspeciales)

        let camposCobranzas = []

        let queryCamposCobranzas = `
            SELECT e.did AS didEnvio, eco.valor AS campo_valor, sdpc.nombre AS campo_nombre
            FROM envios e
            LEFT JOIN envios_cobranzas eco ON e.did = eco.didEnvio AND eco.superado = 0 AND eco.elim = 0
            LEFT JOIN sistema_datosPaqueteria_cobranzas sdpc ON eco.didCampoCobranza = sdpc.did AND sdpc.superado = 0 AND sdpc.elim = 0
            WHERE e.did IN (?) AND e.superado = 0 AND e.elim = 0
            AND (eco.valor IS NOT NULL OR sdpc.nombre IS NOT NULL)
        `

        // Ejecuta la consulta y mapea los resultados
        camposCobranzas = await new Promise((resolve, reject) => {
            connection.query(queryCamposCobranzas, [dids], (error, results) => {
                if (error) return reject(error)
                resolve(results)
            })
        })
        // console.log("camposCobranzasssss------------", camposCobranzas)

        let camposLogi = []

        let queryCamposLogi = `
                SELECT e.did AS didEnvio, eli.valor AS campo_valor, sdpli.nombre AS campo_nombre
                FROM envios e
                LEFT JOIN envios_logisticainversa eli ON e.did = eli.didEnvio AND eli.superado = 0 AND eli.elim = 0
                LEFT JOIN sistema_datosPaqueteria_logisticainversa sdpli ON eli.didCampoLogistica = sdpli.did AND sdpli.superado = 0 AND sdpli.elim = 0
                WHERE e.did IN (?) AND e.superado = 0 AND e.elim = 0
                AND (eli.valor IS NOT NULL OR sdpli.nombre IS NOT NULL)
            `

        camposLogi = await new Promise((resolve, reject) => {
            connection.query(queryCamposLogi, [dids], (error, results) => {
                if (error) return reject(error)
                resolve(results)
            })
        })

        // console.log("camposLogissss------------", camposLogi)

        let ordenes = []
        if (tieneFullfillment != "0") {
            // Query para fullfillment
            let queryOrdenes = `
                            SELECT o.did AS didOrden, oi.seller_sku, oi.cantidad, fp.sku, fp.ean, fp.descripcion
                            FROM ordenes o
                            LEFT JOIN ordenes_items oi ON o.did = oi.didOrden AND oi.superado = 0 AND oi.elim = 0
                            LEFT JOIN fulfillment_productos fp ON oi.seller_sku = fp.sku AND fp.superado = 0 AND fp.elim = 0
                            WHERE o.didEnvio IN (?) AND o.superado = 0 AND o.elim = 0
                        `

            ordenes = await new Promise((resolve, reject) => {
                connection.query(queryOrdenes, [dids], (error, results) => {
                    if (error) return reject(error)
                    resolve(results)
                })
            })
        }

        // Mapeamos los resultados
        let enviosMap = {}
        envios.forEach((envio) => {
            if (!enviosMap[envio.did]) {
                enviosMap[envio.did] = {
                    localidad: envio.localidad || null,
                    fecha_inicio: envio.fecha_inicio || null,
                    ml_venta_id: envio.ml_venta_id || null,
                    ml_shipment_id: envio.ml_shipment_id || null,
                    destination_receiver_name: envio.destination_receiver_name || null,
                    destination_receiver_phone: envio.destination_receiver_phone || null,
                    ciudad: envio.ciudad || null,
                    address_line: envio.address_line || null,
                    cp: envio.cp || null,
                    obs: envio.observacion || null,
                    monto_total_a_cobrar: envio.monto_total_a_cobrar || null,
                    peso: envio.peso || null,
                    remitente: envio.nombre_fantasia || null,
                    qr: envio.ml_qr_seguridad || `{local: 1, did: ${envio.did}, cliente: ${envio.didCliente}, empresa: ${idempresa}}` || null,
                    bultos: envio.bultos || null,
                    camposEspeciales: [],
                    camposCobranzas: [],
                    camposLogi: [],
                    fullfillment: [],
                }
            }
        })

        if (camposEspeciales.length > 0) {
            camposEspeciales.forEach((campo) => {
                if (enviosMap[campo.didEnvio] && campo.campo_valor) {
                    enviosMap[campo.didEnvio].camposEspeciales.push({
                        nombre: campo.campo_nombre || null,
                        valor: campo.campo_valor, // Solo pushea si campo.campo_valor es truthy
                    })
                }
            })
        }

        if (camposCobranzas.length > 0) {
            camposCobranzas.forEach((campo) => {
                if (enviosMap[campo.didEnvio] && campo.campo_valor) {
                    enviosMap[campo.didEnvio].camposCobranzas.push({
                        nombre: campo.campo_nombre || null,
                        valor: campo.campo_valor || null,
                    })
                }
            })
        }

        if (camposLogi.length > 0) {
            camposLogi.forEach((campo) => {
                if (enviosMap[campo.didEnvio] && campo.campo_valor) {
                    enviosMap[campo.didEnvio].camposLogi.push({
                        nombre: campo.campo_nombre || null,
                        valor: campo.campo_valor || null,
                    })
                }
            })
        }

        // Agregamos los datos de fulfillment
        if (ordenes.length > 0) {
            ordenes.forEach((orden) => {
                if (enviosMap[orden.didEnvio]) {
                    enviosMap[orden.didEnvio].fullfillment.push({
                        sku: orden.sku || null,
                        ean: orden.ean || null,
                        descripcion: orden.descripcion || null,
                        cantidad: orden.cantidad || 1,
                    })
                }
            })
        }

        // Convertimos el objeto a array
        arrEnvios = Object.values(enviosMap)

        connection.end()

        const jsonResponse = {
            nombreFantasia: nombreFantasia,
            logo: logo,
            envios: arrEnvios,
        }

        return jsonResponse
    } catch (error) {
        console.error("Error al obtener datos de las tablas:", error.message)
    }
}

//FUNCION PARA INSERTAR LOS ENVIOS YA IMPRESOS EN LA TABLA REIMPRESION HISTORIAL
const registrarReimpresion = async (idempresa, dids, modulo, quien) => {
    let { connection } = await getConnection(idempresa)

    if (!Array.isArray(dids) || dids.length === 0) {
        throw new Error("El parámetro dids debe ser un array con al menos un elemento.")
    }

    try {
        let values = dids.map(() => "(?, ?, ?)").join(", ")
        let query = `INSERT INTO reimpresion_historial (didEnvio, modulo, quien) VALUES ${values}`
        let params = dids.flatMap((did) => [did, modulo, quien])

        let result = await new Promise((resolve, reject) => {
            connection.query(query, params, (error, results) => {
                if (error) return reject(error)
                resolve(results)
            })
        })

        return result
    } catch (error) {
        console.error("Error al insertar en reimpresion_historial:", error.message)
        throw error
    }
}

module.exports = { getConnection, getFromRedis, redisClient, obtenerDatosEnvios, registrarReimpresion }
