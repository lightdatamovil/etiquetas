const PDFDocument = require("pdfkit")
const { convertirFecha } = require("../utils/funciones")
const { medidaA4 } = require("../utils/medidasEtiquetas")
const ga4 = require("./guiaA4/g_a4_controller")
const ga4P = require("./guiaA4/g_a4P_controller")
const { colorGrisOscuro } = require("../utils/colores")

const crearGuias = async (calidadGuia, logistica, envios, res) => {
    const doc = new PDFDocument({ size: medidaA4, margin: 0 })
    doc.pipe(res)

    index = 1

    distanciaAlto = 10

    for (const paquete of envios) {
        var objData = {
            nombreFantasia: logistica.nombreFantasia,
            logo: logistica.logo,
            qr: paquete.qr,
            numeroRem: paquete.numeroRem,
            fecha: paquete.fecha,
            facturaTipo: paquete.facturaTipo,
            codigo: paquete.codigo,
            desde: paquete.desde,
            hacia: paquete.hacia,
            remitente: paquete.remitente,
            destinatario: paquete.destinatario,
            condicionVenta: paquete.condicionVenta,
            operador: paquete.operador,
            bultos: paquete.bultos,
            descripcion: paquete.descripcion,
            peso: paquete.peso,
            codPrecio: paquete.codPrecio,
            valor: paquete.valor,
            obsevacion: paquete.obsevacion,
            ultimosDatos: paquete.ultimosDatos,
            listado: paquete.listado,
            total: paquete.total,
        }

        if (index == 1 || index % 2 != 0) {
            if (calidadGuia == 0) {
                await ga4(doc, objData, distanciaAlto)
            } else {
                await ga4P(doc, objData, distanciaAlto)
            }

            doc.fillAndStroke(colorGrisOscuro, colorGrisOscuro)

            doc.dash(5, { space: 2 })
            doc.moveTo(0, 421).lineTo(596, 421).stroke().fill(colorGrisOscuro)
            doc.undash()

            distanciaAlto += 421
        } else {
            if (calidadGuia == 0) {
                await ga4(doc, objData, distanciaAlto)
            } else {
                await ga4P(doc, objData, distanciaAlto)
            }

            doc.addPage()
            distanciaAlto = 10
        }

        index++
    }

    doc.end()
}

module.exports = crearGuias
