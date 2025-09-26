const e = require("express")
const mysql = require("mysql")
const redis = require("redis")
require("dotenv").config()
const { empresasConLogoGrande, empresasConItemsEnEnvios, empresasConEidEnQr } = require("./utils/empresasConEspecificaciones.json")
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
const obtenerDatosEnvios = async (idempresa, dids, esFulfillment = 0) => {
    try {
        let cacheLogos = {}
        let enviosMap = {}

        let { connection, empresasData } = await getConnection(idempresa)

        let empresa = empresasData[String(idempresa)] || {}

        let logo = cacheLogos[empresa.empresa] || `${empresa.url}/app-assets/images/logo/logo.png` || null

        if (empresasConLogoGrande.includes(idempresa)) {
            logo = `${empresa.url}/app-assets/images/logo/logov1.png`
        }

        if (esFulfillment == 1) {
            queryff = `SELECT didEnvio FROM ordenes WHERE did IN (?) AND superado = 0 AND elim = 0`
            const didEnviosFromOrdenes = await new Promise((resolve, reject) => {
                connection.query(queryff, [dids], (error, results) => {
                    if (error) return reject(error)
                    resolve(results.map((r) => r.didEnvio))
                })
            })

            dids = didEnviosFromOrdenes.length ? didEnviosFromOrdenes : [-1]
        }

        const consultas = [
            {
                key: "envios",
                query: `
                   SELECT 
                        e.*, 
                        COALESCE(NULLIF(TRIM(edd.localidad), ''), NULLIF(TRIM(e.destination_city_name), '')) AS localidad,
                        COALESCE(NULLIF(TRIM(edd.address_line), ''), NULLIF(TRIM(e.destination_shipping_address_line), '')) AS address_line,
                        COALESCE(NULLIF(TRIM(edd.cp), ''), NULLIF(TRIM(e.destination_shipping_zip_code), '')) AS cp,
                        COALESCE(NULLIF(TRIM(edd.destination_comments), ''), NULLIF(TRIM(e.destination_comments), '')) AS ref,
                        edd.ciudad,
                        COALESCE(NULLIF(TRIM(eo.observacion), ''), NULLIF(TRIM(e.obs), '')) AS observacion,
                        e.destination_municipality_name,
                        c.nombre_fantasia
                    FROM envios e
                    LEFT JOIN envios_direcciones_destino edd ON e.did = edd.didEnvio AND edd.superado = 0 AND edd.elim = 0
                    LEFT JOIN envios_observaciones eo ON e.did = eo.didEnvio AND eo.superado = 0 AND eo.elim = 0
                    LEFT JOIN clientes c ON e.didCliente = c.did AND c.superado = 0
                    WHERE e.did IN (?) AND e.superado = 0 AND (e.elim = 0 OR e.elim = 52);
                `,
            },
            {
                key: "camposEspeciales",
                query: `
                    SELECT e.did AS didEnvio, ec.valor AS campo_valor, sdp.nombre AS campo_nombre
                    FROM envios e
                    LEFT JOIN envios_campos_extras ec ON e.did = ec.didEnvio AND ec.superado = 0 AND ec.elim = 0
                    LEFT JOIN sistema_datospaqueteria sdp ON ec.didCampo = sdp.did AND sdp.superado = 0 AND sdp.elim = 0
                    WHERE e.did IN (?) AND e.superado = 0 AND (e.elim = 0 OR e.elim = 52)
                    AND (ec.valor IS NOT NULL OR sdp.nombre IS NOT NULL)
                `,
            },
            {
                key: "camposCobranzas",
                query: `
                    SELECT e.did AS didEnvio, eco.valor AS campo_valor, sdpc.nombre AS campo_nombre
                    FROM envios e
                    LEFT JOIN envios_cobranzas eco ON e.did = eco.didEnvio AND eco.superado = 0 AND eco.elim = 0
                    LEFT JOIN sistema_datosPaqueteria_cobranzas sdpc ON eco.didCampoCobranza = sdpc.did AND sdpc.superado = 0 AND sdpc.elim = 0
                    WHERE e.did IN (?) AND e.superado = 0 AND (e.elim = 0 OR e.elim = 52)
                    AND (eco.valor IS NOT NULL OR sdpc.nombre IS NOT NULL)
                `,
            },
            {
                key: "camposLogi",
                query: `
                    SELECT e.did AS didEnvio, eli.valor AS campo_valor, sdpli.nombre AS campo_nombre
                    FROM envios e
                    LEFT JOIN envios_logisticainversa eli ON e.did = eli.didEnvio AND eli.superado = 0 AND eli.elim = 0
                    LEFT JOIN sistema_datosPaqueteria_logisticainversa sdpli ON eli.didCampoLogistica = sdpli.did AND sdpli.superado = 0 AND sdpli.elim = 0
                    WHERE e.did IN (?) AND e.superado = 0 AND (e.elim = 0 OR e.elim = 52)
                    AND (eli.valor IS NOT NULL OR sdpli.nombre IS NOT NULL)
                `,
            },
        ]

        if (empresa.fullfilment !== "0") {
            consultas.push({
                key: "ordenes",
                query: `
                    SELECT o.didEnvio,
                    COALESCE(NULLIF(oi.seller_sku, ''), NULLIF(fp.sku, '')) AS sku,
                    fp.ean,
                    COALESCE(NULLIF(fp.descripcion, ''), NULLIF(oi.descripcion, '')) AS descripcion,
                    oi.cantidad
                    FROM ordenes o
                    LEFT JOIN ordenes_items oi ON o.did = oi.didOrden AND oi.superado = 0 AND oi.elim = 0
                    LEFT JOIN fulfillment_productos fp ON oi.seller_sku = fp.sku AND fp.superado = 0 AND fp.elim = 0 AND o.didCliente = fp.didCliente
                    WHERE o.didEnvio IN (?) AND o.superado = 0 AND o.elim = 0
                `,
            })
        }

        if (empresasConItemsEnEnvios[String(idempresa)]) {
            consultas.push({
                key: "items",
                query: `
                    SELECT i.didEnvio, i.codigo AS sku, i.descripcion, i.cantidad
                    FROM envios_items i
                    WHERE didEnvio IN (?) AND superado = 0 AND elim = 0    
                
                `,
            })
        }

        const resultados = await Promise.all(consultas.map(({ query }) => new Promise((resolve, reject) => connection.query(query, [dids], (error, results) => (error ? reject(error) : resolve(results))))))

        const datos = Object.fromEntries(consultas.map((c, i) => [c.key, resultados[i]]))

        datos.envios.forEach((envio) => {
            qrData = envio.flex == 1 ? envio.ml_qr_seguridad : `{"local": 1, "did": "${envio.did}", "cliente": ${envio.didCliente}, "empresa": ${idempresa}}`

            if (empresasConEidEnQr.includes(idempresa)) {
                qrData = `{"local": 1, "did": "${envio.did}", "cliente": ${envio.didCliente}, "empresa": ${idempresa}, "eid": "${envio.ml_shipment_id}"}`
            }

            enviosMap[envio.did] = {
                did: envio.did,
                localidad: envio.localidad || null,
                fecha_venta: envio.fecha_venta !== "0000-00-00 00:00:00" ? envio.fecha_venta : envio.fecha_inicio !== "0000-00-00 00:00:00" ? envio.fecha_inicio : null,
                ml_venta_id: envio.ml_venta_id || null,
                ml_shipment_id: envio.ml_shipment_id || null,
                destination_receiver_name: envio.destination_receiver_name || null,
                destination_receiver_phone: envio.destination_receiver_phone || null,
                ciudad: envio.ciudad || null,
                address_line: envio.address_line || null,
                cp: envio.cp || null,
                ref: envio.ref || null,
                obs: envio.observacion || null,
                metodo_name: envio.lead_time_shipping_method_name || null,
                didCliente: envio.didCliente || null,
                monto_total_a_cobrar: envio.monto_total_a_cobrar || null,
                peso: envio.peso || null,
                remitente: envio.nombre_fantasia || null,
                qr: qrData,
                bultos: envio.bultos || null,
                municipio: envio.destination_municipality_name || null,
                camposEspeciales: [],
                camposCobranzas: [],
                camposLogi: [],
                fulfillment: [],
            }
        })
        ;["camposEspeciales", "camposCobranzas", "camposLogi"].forEach((key) => {
            datos[key].forEach((campo) => {
                if (enviosMap[campo.didEnvio] && campo.campo_nombre && campo.campo_valor) {
                    enviosMap[campo.didEnvio][key].push({
                        nombre: campo.campo_nombre,
                        valor: campo.campo_valor,
                    })
                }
            })
        })

        if (datos.ordenes) {
            datos.ordenes.forEach((orden) => {
                if (enviosMap[orden.didEnvio]) {
                    enviosMap[orden.didEnvio].fulfillment.push({
                        sku: orden.sku || null,
                        ean: orden.ean || null,
                        descripcion: orden.descripcion || null,
                        cantidad: orden.cantidad || 1,
                    })
                }
            })
        }

        if (empresasConItemsEnEnvios[String(idempresa)] && datos.items) {
            datos.items.forEach((item) => {
                enviosMap[item.didEnvio]["didCliente"]
                if (enviosMap[item.didEnvio] && empresasConItemsEnEnvios[String(idempresa)]?.includes(enviosMap[item.didEnvio]["didCliente"])) {
                    enviosMap[item.didEnvio].fulfillment.push({
                        sku: item.sku || null,
                        ean: item.ean || null,
                        descripcion: item.descripcion || null,
                        cantidad: item.cantidad || 1,
                    })
                }
            })
        }

        connection.end()

        return {
            nombreFantasia: empresa.empresa || null,
            logo,
            envios: Object.values(enviosMap),
        }
    } catch (error) {
        console.error("Error al obtener datos de las tablas:", error.message)
    }
}

//FUNCION PARA INSERTAR LOS ENVIOS YA IMPRESOS EN LA TABLA REIMPRESION HISTORIAL
const registrarReimpresion = async (idempresa, dids, modulo, quien, esFulfillment = 0) => {
    const { connection } = await getConnection(idempresa)

    if (!Array.isArray(dids) || dids.length === 0) {
        throw new Error("El parámetro dids debe ser un array con al menos un elemento.")
    }

    try {
        await connection.beginTransaction()

        if (esFulfillment == 1) {
            const ordenesData = await new Promise((resolve, reject) => {
                const qSelect = `SELECT id, didEnvio, descargado FROM ordenes WHERE id IN (?) AND superado = 0 AND elim = 0`
                connection.query(qSelect, [dids], (err, rows) => {
                    if (err) return reject(err)
                    resolve(rows)
                })
            })

            if (ordenesData.length) {
                await new Promise((resolve, reject) => {
                    const qUpdate = `UPDATE ordenes SET descargado = descargado + 1 WHERE id IN (?) AND superado = 0 AND elim = 0`
                    connection.query(qUpdate, [dids], (err, res) => {
                        if (err) return reject(err)
                        resolve(res)
                    })
                })
            }

            const didEnvios = [...new Set(ordenesData.map((o) => o.didEnvio))]
            dids = didEnvios.length ? didEnvios : [-1]
        }

        const placeholders = dids.map(() => "(?, ?, ?)").join(", ")
        const queryInsert = `INSERT INTO reimpresion_historial (didEnvio, modulo, quien) VALUES ${placeholders}`
        const paramsInsert = dids.flatMap((did) => [did, modulo, quien])

        await new Promise((resolve, reject) => {
            connection.query(queryInsert, paramsInsert, (error, results) => {
                if (error) return reject(error)
                resolve(results)
            })
        })

        const queryUpdateEnvios = `UPDATE envios SET impreso = 1 WHERE did IN (${dids.map(() => "?").join(", ")}) AND superado = 0 AND (elim = 0 OR elim = 52)`

        await new Promise((resolve, reject) => {
            connection.query(queryUpdateEnvios, dids, (error, results) => {
                if (error) return reject(error)
                resolve(results)
            })
        })

        await connection.commit()

        return {
            success: true,
            message: "Reimpresión registrada y estado actualizado correctamente.",
        }
    } catch (error) {
        await connection.rollback()
        console.error("Error en registrarReimpresion:", error.message)
        throw error
    } finally {
        connection.end()
    }
}

module.exports = {
    getConnection,
    getFromRedis,
    redisClient,
    obtenerDatosEnvios,
    registrarReimpresion,
}
