const { getConnectionFF, executeQuery } = require("./dbconfig")

const obtenerDatosEnviosFF = async (idempresa, dids) => {
    try {
        let enviosMap = {}

        let connection = await getConnectionFF(idempresa)

        const queryEmpresa = `
                   SELECT 
                        *
                    FROM sistema_empresa 
                    WHERE superado = 0 AND elim = 0;
                `

        const resultEmpresa = await executeQuery(connection, queryEmpresa, idempresa)
        const empresa = resultEmpresa[0] || {}
        const logo = empresa.imagen ? `https://ff.lightdata.app/assets-app/img/logos-empresas/general/${empresa.imagen}` : ""

        const consultas = [
            {
                key: "pedidos",
                query: `
                   SELECT 
                        p.*,
                        d.localidad,
                        d.address_line,
                        d.cp,
                        d.destination_coments,
                        NULLIF(c.nombre_fantasia, '') AS nombre_fantasia
                    FROM pedidos p
                    LEFT JOIN pedidos_ordenes_direcciones_destino d ON p.did = d.did_pedido AND d.superado = 0 AND d.elim = 0
                    LEFT JOIN clientes c ON p.did_cliente = c.did AND c.superado = 0
                    WHERE p.did IN (?) AND p.superado = 0 AND p.elim = 0;
                `,
            },
            {
                key: "pedidos_productos",
                query: `
                    SELECT
                    p.did_pedido,
                    p.seller_sku AS sku,
                    pvv.ean,
                    p.descripcion,
                    p.cantidad
                    FROM pedidos_productos p
                    LEFT JOIN productos_variantes_valores pvv ON p.did_producto_variante_valor = pvv.did AND pvv.superado = 0 AND pvv.elim = 0
                    WHERE p.did_pedido IN (?) AND p.superado = 0 AND p.elim = 0
                `,
            },
        ]

        const resultados = await Promise.all(consultas.map(({ query }) => new Promise((resolve, reject) => connection.query(query, [dids], (error, results) => (error ? reject(error) : resolve(results))))))

        const datos = Object.fromEntries(consultas.map((c, i) => [c.key, resultados[i]]))

        datos.pedidos.forEach((pedido) => {
            enviosMap[pedido.did] = {
                did: pedido.did,
                localidad: pedido.localidad || null,
                fecha_venta: pedido.fecha_venta !== "0000-00-00 00:00:00" ? pedido.fecha_venta : null,
                deadline: pedido.deadline !== "0000-00-00 00:00:00" ? pedido.deadline : null,
                ml_venta_id: pedido.number || null,
                ml_shipment_id: pedido.number || null,
                destination_receiver_name: pedido.buyer_name || null,
                destination_receiver_phone: pedido.buyer_phone || null,
                ciudad: null,
                address_line: pedido.address_line || null,
                piso: null,
                cp: pedido.cp || null,
                ref: pedido.destination_coments || null,
                obs: pedido.observaciones || null,
                metodo_name: null,
                didCliente: pedido.did_cliente || null,
                monto_total_a_cobrar: pedido.total_amount || null,
                peso: null,
                remitente: pedido.nombre_fantasia || null,
                qr: "",
                bultos: 1,
                municipio: null,
                camposEspeciales: [],
                camposCobranzas: [],
                camposLogi: [],
                fulfillment: [],
            }
        })

        if (datos.pedidos_productos) {
            datos.pedidos_productos.forEach((producto) => {
                if (enviosMap[producto.did_pedido]) {
                    enviosMap[producto.did_pedido].fulfillment.push({
                        sku: producto.sku || null,
                        ean: producto.ean || null,
                        descripcion: producto.descripcion || null,
                        cantidad: producto.cantidad || 1,
                    })
                }
            })
        }

        connection.end()

        return {
            nombreFantasia: empresa.nombre || null,
            logo,
            envios: Object.values(enviosMap),
        }
    } catch (error) {
        console.error("Error al obtener datos de las tablas:", error.message)
    }
}

module.exports = {
    getConnectionFF,
    obtenerDatosEnviosFF,
}
