const PDFDocument = require("pdfkit")
const { convertirFecha, cambiarACaba, combinarArrays, esDatoValido } = require("../utils/funciones")
const exportsEtiquetas = require("../utils/exportsEtiquetas")
const { medida10x10, medida10x15, medidaA4 } = require("../utils/medidasEtiquetas")
const {
    empresasConObservacionesConMetodo,
    empresasConCodigoDebajoDelQr,
    empresasConTotalAPagarGrande,
    empresasConObservacionA4Grande,
    empresasConCodigoBarras,
    empresasSinEan,
    empresasConCamposExtraGrande,
    empresasSinColumnaObservacion,
    empresasConDeadline,
    empresasConLoteEnItems,
    empresasSinFranjaNegraEnLocalidad,
} = require("../utils/empresasConEspecificaciones.json")

const crearEtiquetas = async (didEmpresa, tipoEtiqueta, calidad, logistica, envios, res) => {
    // Ordena los envíos por ml_shipment_id de manera natural (alfanumérica)

    return new Promise(async (resolve, reject) => {
        try {
            envios = Object.values(envios).sort((a, b) =>
                (a.ml_shipment_id || "").localeCompare(b.ml_shipment_id || "", undefined, {
                    numeric: true,
                    sensitivity: "base",
                })
            )

            let tamañoHoja = tipoEtiqueta == 0 ? medida10x10 : tipoEtiqueta == 1 ? medida10x15 : medidaA4
            let medidaEtiqueta = tipoEtiqueta == 0 ? "e10x10" : tipoEtiqueta == 1 || tipoEtiqueta == 3 ? "e10x15" : "ea4"
            let calidadEtiqueta = calidad == 1 ? "P" : ""

            const doc = new PDFDocument({ size: tamañoHoja, margin: 0 })
            doc.pipe(res)

            let index = 0
            let index_a4 = 1
            let distanciaAlto_a4 = 15
            let cantFulfillmentPag_a4 = 0
            let altoContenedor_a4 = 130
            let mayorPorPag_a4 = 6

            for (const paquete of envios) {
                let camposExtras = combinarArrays(paquete.camposEspeciales, paquete.camposCobranzas, paquete.camposLogi)

                var objData = {
                    nombreFantasia: logistica.nombreFantasia,
                    logo: logistica.logo,
                    did: paquete.did,
                    didCliente: paquete.didCliente,
                    localidad: cambiarACaba(!esDatoValido(paquete.ciudad) && !esDatoValido(paquete.localidad) && esDatoValido(paquete.municipio) ? paquete.municipio : esDatoValido(paquete.ciudad) ? paquete.ciudad : paquete.localidad),
                    fecha: `${convertirFecha(paquete.fecha_venta)} ${empresasConDeadline.includes(didEmpresa) && esDatoValido(paquete.deadline) ? "| " + convertirFecha(paquete.deadline) : ""}`,
                    nroVenta: esDatoValido(paquete.ml_venta_id) ? paquete.ml_venta_id : paquete.ml_shipment_id,
                    nroEnvio: paquete.ml_shipment_id,
                    nombre: paquete.destination_receiver_name,
                    nroTelefono: paquete.destination_receiver_phone,
                    direccion: esDatoValido(paquete.ciudad) && esDatoValido(paquete.localidad) ? `${paquete.address_line}${esDatoValido(paquete.piso) ? ", Piso " + paquete.piso : ""}, ${paquete.localidad}` : paquete.address_line,
                    cp: paquete.cp,
                    observacion: paquete.obs,
                    total: paquete.monto_total_a_cobrar,
                    peso: paquete.peso,
                    remitente: paquete.remitente,
                    qr: paquete.qr,
                    bultos: paquete.bultos >= 2 && paquete.bultos <= 100 ? paquete.bultos : 1,
                    camposEspeciales: camposExtras || [],
                    fulfillment: paquete.fulfillment || [],
                }

                for (let key in objData) {
                    if (typeof objData[key] === "string") {
                        objData[key] = objData[key].replace(/\s+/g, " ").trim()
                    }
                }

                const clienteId = paquete.didCliente

                const obsCompleta = []
                if (esDatoValido(paquete.ref)) obsCompleta.push(`Ref: ${paquete.ref}`)
                if (!empresasSinColumnaObservacion[String(didEmpresa)]?.includes(clienteId)) {
                    if (esDatoValido(paquete.obs)) obsCompleta.push(paquete.obs)
                }
                if (empresasConObservacionesConMetodo[String(didEmpresa)]?.includes(clienteId)) {
                    if (esDatoValido(paquete.metodo_name)) obsCompleta.push(paquete.metodo_name)
                }
                objData.observacion = obsCompleta.join(" / ")

                const llevaCodigo = empresasConCodigoDebajoDelQr.includes(didEmpresa)
                const totalGrande = empresasConTotalAPagarGrande.includes(didEmpresa)
                const observacionA4Grande = empresasConObservacionA4Grande.includes(didEmpresa)
                const llevaCodigoBarras = empresasConCodigoBarras[String(didEmpresa)]?.includes(clienteId) || false
                const sinEan = empresasSinEan.includes(didEmpresa)
                const camposExtraGrande = empresasConCamposExtraGrande.includes(didEmpresa)
                const loteEnItems = empresasConLoteEnItems.includes(didEmpresa)
                const localidadSinFranja = empresasSinFranjaNegraEnLocalidad.includes(didEmpresa)

                let cualEtiqueta = objData.camposEspeciales.length > 0 ? (objData.fulfillment.length == 0 ? "CE" : "A") : objData.fulfillment.length == 0 ? "S" : "FF"
                let funcionName = medidaEtiqueta + cualEtiqueta + calidadEtiqueta
                let funcionNameA4 = medidaEtiqueta + calidadEtiqueta

                if (tipoEtiqueta == 0 || tipoEtiqueta == 1 || tipoEtiqueta == 3) {
                    await exportsEtiquetas[funcionName]({ doc, objData, llevaCodigo, llevaCodigoBarras, sinEan, camposExtraGrande, loteEnItems, localidadSinFranja })
                    if (tipoEtiqueta == 3) {
                        doc.roundedRect(0, 0, 283.5, 425.25) // x, y, ancho, alto
                            .stroke("black")
                    }

                    if (envios.length > 1 && index < envios.length - 1) {
                        doc.addPage()
                    }
                } else {
                    if ((index_a4 == 2 && cantFulfillmentPag_a4 > 28) || (index_a4 == 3 && cantFulfillmentPag_a4 > 16) || (index_a4 == 4 && cantFulfillmentPag_a4 > 10) || (index_a4 == 5 && cantFulfillmentPag_a4 > 4) || (index_a4 == 6 && cantFulfillmentPag_a4 > 0) || index_a4 > mayorPorPag_a4) {
                        doc.addPage()
                        cantFulfillmentPag_a4 = 0
                        index_a4 = 1
                        distanciaAlto_a4 = 15
                    }

                    const result = await exportsEtiquetas[funcionNameA4](doc, objData, index_a4, distanciaAlto_a4, cantFulfillmentPag_a4, altoContenedor_a4, mayorPorPag_a4, llevaCodigo, totalGrande, observacionA4Grande, camposExtraGrande, loteEnItems)

                    index_a4 = result.index
                    cantFulfillmentPag_a4 = result.cantFulfillmentPag
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
