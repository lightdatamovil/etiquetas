const PDFDocument = require("pdfkit")
const { convertirFecha } = require("../utils/funciones")
const exportsEtiquetas = require("../utils/exportsEtiquetas")
const { medida10x10, medida10x15, medidaA4 } = require("../utils/medidasEtiquetas")

const crearEtiquetas = async (tipoEtiqueta, calidad, logistica, envios, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let tamañoHoja = tipoEtiqueta == 0 ? medida10x10 : tipoEtiqueta == 1 ? medida10x15 : medidaA4
            let medidaEtiqueta = tipoEtiqueta == 0 ? "e10x10" : tipoEtiqueta == 1 ? "e10x15" : "ea4"
            let calidadEtiqueta = calidad == 1 ? "P" : ""

            const doc = new PDFDocument({ size: tamañoHoja, margin: 0 })
            doc.pipe(res)

            let index = 0
            let index_a4 = 1
            let distanciaAlto_a4 = 15
            let cantFullfilmentPag_a4 = 0
            let altoContenedor_a4 = 130
            let mayorPorPag_a4 = 6

            for (const paquete of envios) {
                var objData = {
                    nombreFantasia: logistica.nombreFantasia,
                    logo: logistica.logo,
                    localidad: paquete.localidad,
                    fecha: convertirFecha(paquete.fecha_inicio),
                    nroVenta: paquete.ml_venta_id,
                    nroEnvio: paquete.ml_shipment_id,
                    nombre: paquete.destination_receiver_name,
                    nroTelefono: paquete.destination_receiver_phone,
                    direccion: paquete.address_line,
                    cp: paquete.cp,
                    observacion: paquete.obs,
                    total: paquete.monto_total_a_cobrar,
                    peso: paquete.peso,
                    remitente: paquete.remitente,
                    qr: paquete.qr,
                    bultos: paquete.bultos < 2 ? 1 : paquete.bultos,
                    camposEspeciales: paquete.camposEspeciales || [],
                    fullfillment: paquete.fullfillment || [],
                }

                let cualEtiqueta = objData.camposEspeciales.length > 0 ? (objData.fullfillment.length == 0 ? "CE" : "A") : objData.fullfillment.length == 0 ? "S" : "FF"
                let funcionName = medidaEtiqueta + cualEtiqueta + calidadEtiqueta
                let funcionNameA4 = medidaEtiqueta + calidadEtiqueta

                if (tipoEtiqueta == 0 || tipoEtiqueta == 1) {
                    await exportsEtiquetas[funcionName](doc, objData)

                    if (envios.length > 1 && index < envios.length - 1) {
                        doc.addPage()
                    }
                } else {
                    if ((index_a4 == 2 && cantFullfilmentPag_a4 > 28) || (index_a4 == 3 && cantFullfilmentPag_a4 > 16) || (index_a4 == 4 && cantFullfilmentPag_a4 > 10) || (index_a4 == 5 && cantFullfilmentPag_a4 > 4) || (index_a4 == 6 && cantFullfilmentPag_a4 > 0) || index_a4 > mayorPorPag_a4) {
                        doc.addPage()
                        cantFullfilmentPag_a4 = 0
                        index_a4 = 1
                        distanciaAlto_a4 = 15
                    }

                    const result = await exportsEtiquetas[funcionNameA4](doc, objData, index_a4, distanciaAlto_a4, cantFullfilmentPag_a4, altoContenedor_a4, mayorPorPag_a4)

                    index_a4 = result.index
                    cantFullfilmentPag_a4 = result.cantFullfilmentPag
                    distanciaAlto_a4 = result.distanciaAlto1
                    altoContenedor_a4 = result.altoContenedor
                }

                index++
            }

            doc.end()

            res.on("finish", () => {
                resolve(true)
            })

            res.on("error", (error) => {
                console.error("Error al generar el pdf:", error)
                reject(error)
            })
        } catch (error) {
            console.error("Error en crearEtiquetas:", error)
            reject(error)
        }
    })
}

module.exports = crearEtiquetas
