const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")

const { iconCalendarChico, iconNombre, iconTelefono, iconUbicacion } = require("../../utils/icons.js")
const { esDatoValido, cortarTexto } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro } = require("../../utils/colores.js")

//ETIQUETA 10x10 CON FULLFILLMENT PREMIUM

const e10x10FF = async (doc, objData) => {
    let { nombreFantasia, logo, camposEspeciales, localidad, fecha, nroVenta, nroEnvio, nombre, nroTelefono, direccion, cp, observacion, total, peso, remitente, qr, bultos, fullfillment } = objData

    for (let i = 0; i < bultos; i++) {
        distanciaAncho1 = 80
        anchoContainer1 = 110
        anchoCaracteres1 = 18
        anchoCaracteres2 = 15

        if (esDatoValido(qr)) {
            // qr = JSON.stringify(qr)
            let codigoQR = await new Promise((resolve, reject) => {
                QRCode.toBuffer(qr, { type: "png" }, (err, buffer) => {
                    if (err) reject(err)
                    resolve(buffer)
                })
            })
            doc.image(codigoQR, 0, 5, { height: 80 })
        } else {
            distanciaAncho1 = 5
            anchoContainer1 = 180
            anchoCaracteres1 = 30
            anchoCaracteres2 = 25
        }

        // ! SECCION SUPERIOR
        tamañoFuente1 = 8
        altoContainer1 = 13
        margin1 = 6
        padding1 = 7
        borderRadius1 = 2
        distanciaAlto1 = 10
        posicionAnchoTexto1 = distanciaAncho1 + padding1
        const containerSiguiente1 = (num) => distanciaAlto1 + altoContainer1 * num + margin1 * num
        const posicionAltoTexto1 = (num) => {
            if (num == 0) {
                return distanciaAlto1 + altoContainer1 / 2
            } else {
                return containerSiguiente1(num) + altoContainer1 / 2
            }
        }

        if (esDatoValido(logo)) {
            const response = await fetch(logo)
            const imageBuffer = await response.arrayBuffer()
            doc.image(Buffer.from(imageBuffer), distanciaAncho1 + anchoContainer1 + margin1, 20, { fit: [87, 45], align: "center", valign: "center" })
        }

        doc.roundedRect(distanciaAncho1, distanciaAlto1, anchoContainer1, altoContainer1, borderRadius1) // x, y, ancho, alto, radio de la esquina
            .fillAndStroke("black", "black")

        doc.roundedRect(distanciaAncho1, containerSiguiente1(1), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(2), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(3), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)

        doc.fillAndStroke("white", "white")
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(localidad) ? cortarTexto(localidad.toUpperCase(), anchoCaracteres1) : "Sin información", distanciaAncho1, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false, width: anchoContainer1, align: "center" })

        doc.fillAndStroke("black", "black")

        SVGtoPDF(doc, iconCalendarChico, posicionAnchoTexto1, posicionAltoTexto1(0) + 13)

        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(fecha) ? cortarTexto(fecha, anchoCaracteres2) : "Sin información", posicionAnchoTexto1 + 20, posicionAltoTexto1(1), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente1).font("Helvetica").text("Venta:", posicionAnchoTexto1, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroVenta) ? cortarTexto(nroVenta, anchoCaracteres2) : "Sin información", posicionAnchoTexto1 + 25, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente1).font("Helvetica").text("Envio:", posicionAnchoTexto1, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroEnvio) ? cortarTexto(nroEnvio, anchoCaracteres2) : "Sin información", posicionAnchoTexto1 + 25, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombreFantasia) ? cortarTexto(nombreFantasia.toUpperCase(), 25) : "LOGISTICA", distanciaAncho1 + anchoContainer1 + margin1, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false, width: 87, align: "center" })

        // ! /SECCION SUPERIOR

        // ! SECCION DESTINATARIO
        tamañoFuente2 = 8
        anchoContainer2 = 273
        altoContainer2 = 13
        margin2 = 6
        padding2 = 7
        borderRadius2 = 2
        distanciaAncho2 = 5
        distanciaAlto2 = distanciaAlto1 + 90
        posicionAnchoTexto2 = distanciaAncho2 + padding2
        const containerSiguiente2 = (num) => distanciaAlto2 + altoContainer2 * num + margin2 * num
        const posicionAltoTexto2 = (num) => {
            if (num == 0) {
                return distanciaAlto2 + altoContainer2 / 2
            } else {
                return containerSiguiente2(num) + altoContainer2 / 2
            }
        }

        doc.circle(posicionAnchoTexto2, distanciaAlto2 - 11, 2.5).fillAndStroke(colorGrisOscuro, colorGrisOscuro)
        doc.fontSize(tamañoFuente2)
            .font("Helvetica")
            .text("Destinatario", posicionAnchoTexto2 + 6, distanciaAlto2 - 10, { baseline: "middle", lineBreak: false })
        doc.moveTo(65, distanciaAlto2 - 10)
            .lineTo(275, distanciaAlto2 - 10)
            .fill(colorGrisOscuro)

        doc.roundedRect(distanciaAncho2, distanciaAlto2, 134, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(134 + 11, distanciaAlto2, 134, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho2, containerSiguiente2(1), anchoContainer2, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho2, containerSiguiente2(2), anchoContainer2, altoContainer2 * 2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)

        doc.fillAndStroke("black", "black")

        SVGtoPDF(doc, iconNombre, posicionAnchoTexto2, posicionAltoTexto2(0) - 5)

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombre) ? cortarTexto(nombre, 19) : "Sin información", posicionAnchoTexto2 + 12, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconTelefono, 145 + padding2, posicionAltoTexto2(0) - 5)

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroTelefono) ? cortarTexto(nroTelefono, 19) : "Sin información", 155 + padding2, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconUbicacion, posicionAnchoTexto2, posicionAltoTexto2(1) - 5)

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(`${esDatoValido(direccion) ? cortarTexto(direccion, 35) : "Sin información"} ${esDatoValido(cp) ? "CP: " + cortarTexto(cp, 5) : ""}`, posicionAnchoTexto2 + 12, posicionAltoTexto2(1), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica-Bold")
            .text("Observación:", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica")
            .text(esDatoValido(observacion) ? cortarTexto(observacion, 170) : "Sin información", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", indent: 40, width: anchoContainer2 - 10 })
        // ! /SECCION DESTINATARIO

        // ! SECCION FULLFILLMENT
        tamañoFuente4 = 6
        anchoContainer4 = 273
        altoContainer4 = 13
        margin4 = 3
        padding4 = 5
        borderRadius4 = 2
        distanciaAncho4 = 5
        distanciaAlto4 = distanciaAlto1 + 185
        posicionAnchoTexto4 = distanciaAncho4 + padding4
        const containerSiguiente4 = (num) => distanciaAlto4 + altoContainer4 * num + margin4 * num
        const posicionAltoTexto4 = (num) => {
            if (num == 0) {
                return distanciaAlto4 + altoContainer4 / 2
            } else {
                return containerSiguiente4(num) + altoContainer4 / 2
            }
        }

        indexFF = 0
        if (fullfillment.length > 0) {
            doc.circle(12, distanciaAlto4 - 21, 2.5).fillAndStroke(colorGrisOscuro, colorGrisOscuro)
            doc.fontSize(tamañoFuente2)
                .font("Helvetica")
                .text("Fullfillment", 12 + 6, distanciaAlto4 - 20, { baseline: "middle", lineBreak: false })
            doc.moveTo(60, distanciaAlto4 - 20)
                .lineTo(275, distanciaAlto4 - 20)
                .fill(colorGrisOscuro)

            doc.fillAndStroke("black", "black")
            doc.fontSize(8)
                .font("Helvetica")
                .text("SKU", posicionAnchoTexto4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(8)
                .font("Helvetica")
                .text("EAN", distanciaAncho4 + 52 + margin4 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(8)
                .font("Helvetica")
                .text("Descripción", distanciaAncho4 + 104 + margin4 * 2 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(8)
                .font("Helvetica")
                .text("Cantidad", distanciaAncho4 + 211 + margin4 * 3 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })

            await fullfillment.map((elemento) => {
                indexFF += 1

                if (indexFF > 21) {
                    return
                }

                let mensajePagina1 = `Etiqueta 1`
                let mensajePagina2 = `Etiqueta 2`

                if (bultos > 1 && i < bultos) {
                    mensajePagina1 = `Bulto ${i + 1} / ${bultos} | Etiqueta 1`
                    mensajePagina2 = `Bulto ${i + 1} / ${bultos} | Etiqueta 2`
                }

                if (indexFF == 6) {
                    doc.fontSize(5).font("Helvetica").text(mensajePagina1, 100, 10, {
                        width: 170,
                        align: "right",
                    })
                    doc.addPage()
                    doc.fontSize(5).font("Helvetica").text(mensajePagina2, 100, 10, {
                        width: 170,
                        align: "right",
                    })
                    distanciaAlto4 = 20
                }

                doc.roundedRect(distanciaAncho4, distanciaAlto4, 51, altoContainer4, borderRadius4).fillAndStroke(colorGrisClaro, colorGrisClaro)
                doc.roundedRect(distanciaAncho4 + 52 + margin4, distanciaAlto4, 51, altoContainer4, borderRadius4).fillAndStroke(colorGrisClaro, colorGrisClaro)
                doc.roundedRect(distanciaAncho4 + 104 + margin4 * 2, distanciaAlto4, 106, altoContainer4, borderRadius4).fillAndStroke(colorGrisClaro, colorGrisClaro)
                doc.roundedRect(distanciaAncho4 + 211 + margin4 * 3, distanciaAlto4, 51, altoContainer4, borderRadius4).fillAndStroke(colorGrisClaro, colorGrisClaro)

                doc.fillAndStroke("black", "black")
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["sku"]) ? cortarTexto(elemento["sku"], 11) : "Sin información", posicionAnchoTexto4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["ean"]) ? cortarTexto(elemento["ean"], 11) : "Sin información", distanciaAncho4 + 52 + margin4 + padding4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["descripcion"]) ? cortarTexto(elemento["descripcion"], 24) : "Sin información", distanciaAncho4 + 104 + margin4 * 2 + padding4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["cantidad"]) ? cortarTexto(elemento["cantidad"], 11) : "Sin información", distanciaAncho4 + 211 + margin4 * 3 + padding4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })

                if (indexFF != 5) {
                    distanciaAlto4 += 16
                }
            })
        }

        // ! /SECCION FULLFILLMENT

        if (bultos > 1 && i < bultos && fullfillment.length < 6) {
            doc.fontSize(5)
                .font("Helvetica")
                .text(`Bulto ${i + 1} / ${bultos}`, 100, 10, {
                    width: 170,
                    align: "right",
                })
        }

        if (bultos > 1 && i < bultos - 1) {
            doc.addPage()
        }
    }
}

module.exports = e10x10FF
