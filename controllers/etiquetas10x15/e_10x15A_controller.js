const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")

const { iconCalendar, iconNombre, iconTelefono, iconUbicacion } = require("../../utils/icons.js")
const { esDatoValido, cortarTexto } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro } = require("../../utils/colores.js")

// ! ETIQUETA 10X15 CON AMBOS SIMPLE

const e10x15A = async (doc, objData) => {
    let { nombreFantasia, logo, camposEspeciales, localidad, fecha, nroVenta, nroEnvio, nombre, nroTelefono, direccion, cp, observacion, total, peso, remitente, qr, bultos, fullfillment } = objData

    for (let i = 0; i < bultos; i++) {
        distanciaAncho1 = 129
        anchoContainer1 = 150
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
            doc.image(codigoQR, 0, 40, { height: 125 })
        } else {
            distanciaAncho1 = 5
            anchoContainer1 = 273
            anchoCaracteres1 = 35
            anchoCaracteres2 = 30
        }

        if (esDatoValido(logo)) {
            const response = await fetch(logo)
            const imageBuffer = await response.arrayBuffer()
            doc.image(Buffer.from(imageBuffer), 10, 10, { fit: [50, 35] })
        }

        doc.fontSize(25)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombreFantasia) ? cortarTexto(nombreFantasia, 14) : "Logistica", 63, 30, { lineBreak: false, baseline: "middle" })

        // ! SECCION SUPERIOR
        tamañoFuente1 = 10
        altoContainer1 = 22
        margin1 = 6
        padding1 = 7
        borderRadius1 = 5
        distanciaAlto1 = 48
        posicionAnchoTexto1 = distanciaAncho1 + padding1
        const containerSiguiente1 = (num) => distanciaAlto1 + altoContainer1 * num + margin1 * num
        const posicionAltoTexto1 = (num) => {
            if (num == 0) {
                return distanciaAlto1 + altoContainer1 / 2
            } else {
                return containerSiguiente1(num) + altoContainer1 / 2
            }
        }

        doc.roundedRect(distanciaAncho1, distanciaAlto1, anchoContainer1, altoContainer1, borderRadius1) // x, y, ancho, alto, radio de la esquina
            .fillAndStroke("black", "black")

        doc.moveTo(distanciaAncho1, containerSiguiente1(2) - 3)
            .lineTo(275, containerSiguiente1(2) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(3) - 3)
            .lineTo(275, containerSiguiente1(3) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(4) - 3)
            .lineTo(275, containerSiguiente1(4) - 3)
            .fill(colorGrisOscuro)

        doc.fillAndStroke("white", "white")
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(localidad) ? cortarTexto(localidad.toUpperCase(), anchoCaracteres1) : "Sin información", distanciaAncho1, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false, width: anchoContainer1, align: "center" })

        SVGtoPDF(doc, iconCalendar, posicionAnchoTexto1, posicionAltoTexto1(0) + 20)

        doc.fillAndStroke("black", "black")
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(fecha) ? cortarTexto(fecha, anchoCaracteres2) : "Sin información", posicionAnchoTexto1 + 20, posicionAltoTexto1(1), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente1).font("Helvetica").text("Venta:", posicionAnchoTexto1, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroVenta) ? cortarTexto(nroVenta, anchoCaracteres2) : "Sin información", posicionAnchoTexto1 + 30, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente1).font("Helvetica").text("Envio:", posicionAnchoTexto1, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroEnvio) ? cortarTexto(nroEnvio, anchoCaracteres2) : "Sin información", posicionAnchoTexto1 + 30, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })
        // ! /SECCION SUPERIOR

        // ! SECCION DESTINATARIO
        tamañoFuente2 = 8
        anchoContainer2 = 273
        altoContainer2 = 13
        margin2 = 6
        padding2 = 7
        borderRadius2 = 2
        distanciaAncho2 = 5
        distanciaAlto2 = distanciaAlto1 + 130
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

        doc.moveTo(distanciaAncho2, distanciaAlto2 - 3)
            .lineTo(275, distanciaAlto2 - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(140, distanciaAlto2 - 1)
            .lineTo(140, distanciaAlto2 + 13)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(1) - 3)
            .lineTo(275, containerSiguiente2(1) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(2) - 3)
            .lineTo(275, containerSiguiente2(2) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(3.2)).lineTo(275, containerSiguiente2(3.2)).fill(colorGrisOscuro)

        doc.fillAndStroke("black", "black")

        SVGtoPDF(doc, iconNombre, posicionAnchoTexto2, posicionAltoTexto2(0) - 5)

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombre) ? cortarTexto(nombre, 17) : "Sin información", posicionAnchoTexto2 + 12, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconTelefono, 145 + padding2, posicionAltoTexto2(0) - 5)

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroTelefono) ? cortarTexto(nroTelefono, 17) : "Sin información", 155 + padding2, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconUbicacion, posicionAnchoTexto2, posicionAltoTexto2(1) - 5)

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(`${esDatoValido(direccion) ? cortarTexto(direccion, 30) : "Sin información"} ${esDatoValido(cp) ? "CP: " + cp : ""}`, posicionAnchoTexto2 + 12, posicionAltoTexto2(1), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica-Bold")
            .text("Observación:", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica")
            .text(esDatoValido(observacion) ? cortarTexto(observacion, 180) : "Sin información", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", indent: 40, width: anchoContainer2 - 10 })
        // ! /SECCION DESTINATARIO

        // ! SECCION CAMPOS ESPECIALES
        tamañoFuente3 = 8
        anchoContainer3 = 273
        altoContainer3 = 13
        margin3 = 6
        padding3 = 7
        borderRadius3 = 2
        distanciaAncho3 = 5
        distanciaAlto3 = distanciaAlto1 + 215
        posicionAnchoTexto3 = distanciaAncho3 + padding3
        const containerSiguiente3 = (num) => distanciaAlto3 + altoContainer3 * num + margin3 * num
        const posicionAltoTexto3 = (num) => {
            if (num == 0) {
                return distanciaAlto3 + altoContainer3 / 2
            } else {
                return containerSiguiente3(num) + altoContainer3 / 2
            }
        }

        if (camposEspeciales.length > 0) {
            doc.circle(posicionAnchoTexto3, distanciaAlto3 - 11, 2.5).fillAndStroke(colorGrisOscuro, colorGrisOscuro)
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("Campos especiales", posicionAnchoTexto3 + 6, distanciaAlto3 - 10, { baseline: "middle", lineBreak: false })

            siguiente = 0
            distanciaCE = 0
            await camposEspeciales.map((campo) => {
                if (siguiente < 6) {
                    let anchoTextoEsp = doc.widthOfString(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 10) + ":" : "CampoEsp:", { font: "Helvetica-Bold", size: tamañoFuente3 })

                    if (siguiente == 0 || siguiente % 2 == 0) {
                        doc.moveTo(distanciaAncho3, containerSiguiente3(distanciaCE) - 3)
                            .lineTo(275, containerSiguiente3(distanciaCE) - 3)
                            .fill(colorGrisOscuro)
                        doc.fillAndStroke("black", "black")
                        doc.fontSize(tamañoFuente3)
                            .font("Helvetica-Bold")
                            .text(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 10) + ":" : "CampoEsp:", posicionAnchoTexto3, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })
                        doc.fontSize(tamañoFuente2)
                            .font("Helvetica")
                            .text(esDatoValido(campo["valor"]) ? cortarTexto(campo["valor"], 17) : "Sin información", posicionAnchoTexto3 + anchoTextoEsp + 4, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })
                    } else {
                        doc.moveTo(distanciaAncho3, containerSiguiente3(distanciaCE) - 3)
                            .lineTo(275, containerSiguiente3(distanciaCE) - 3)
                            .fill(colorGrisOscuro)
                        doc.moveTo(140, containerSiguiente3(distanciaCE) - 1)
                            .lineTo(140, containerSiguiente3(distanciaCE) + 13)
                            .fill(colorGrisOscuro)

                        doc.fillAndStroke("black", "black")

                        doc.fontSize(tamañoFuente3)
                            .font("Helvetica-Bold")
                            .text(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 10) + ":" : "", 134 + 11 + padding3, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })
                        doc.fontSize(tamañoFuente2)
                            .font("Helvetica")
                            .text(esDatoValido(campo["valor"]) ? cortarTexto(campo["valor"], 17) : "Sin información", 134 + 11 + padding3 + anchoTextoEsp + 4, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })
                        distanciaCE += 1
                    }
                    siguiente += 1
                }
            })
        }
        // ! /SECCION CAMPOS ESPECIALES

        // ! SECCION FULLFILLMENT
        tamañoFuente4 = 6
        anchoContainer4 = 273
        altoContainer4 = 13
        margin4 = 3
        padding4 = 5
        borderRadius4 = 2
        distanciaAncho4 = 5
        distanciCantidadCamposEspeciales = camposEspeciales.length % 2 == 0 ? 0 : 1
        distanciaAlto4 = containerSiguiente3(distanciaCE + 1 + distanciCantidadCamposEspeciales) + 7
        posicionAnchoTexto4 = distanciaAncho4 + padding4
        const containerSiguiente4 = (num) => distanciaAlto4 + altoContainer4 * num + margin4 * num
        const posicionAltoTexto4 = (num) => {
            if (num == 0) {
                return distanciaAlto4 + altoContainer4 / 2
            } else {
                return containerSiguiente4(num) + altoContainer4 / 2
            }
        }

        indexFF = Math.ceil(camposEspeciales.length / 2)
        paginasMultiples = fullfillment.length + Math.ceil(camposEspeciales.length / 2)

        if (fullfillment.length > 0) {
            doc.circle(posicionAnchoTexto3, distanciaAlto4 - 21, 2.5).fillAndStroke(colorGrisOscuro, colorGrisOscuro)
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("Fullfillment", posicionAnchoTexto3 + 6, distanciaAlto4 - 20, { baseline: "middle", lineBreak: false })

            doc.fillAndStroke("black", "black")
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("SKU", posicionAnchoTexto4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("EAN", distanciaAncho4 + 52 + margin4 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("Descripción", distanciaAncho4 + 104 + margin4 * 2 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("Cantidad", distanciaAncho4 + 211 + margin4 * 3 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })

            await fullfillment.map((elemento) => {
                indexFF += 1

                if (indexFF > 32) {
                    return
                }

                doc.moveTo(distanciaAncho4, distanciaAlto4).lineTo(275, distanciaAlto4).fill(colorGrisOscuro)

                doc.fillAndStroke("black", "black")
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["sku"]) ? cortarTexto(elemento["sku"], 11) : "Sin información", posicionAnchoTexto4, posicionAltoTexto4(0) + 1, { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["ean"]) ? cortarTexto(elemento["ean"], 11) : "Sin información", distanciaAncho4 + 52 + margin4 + padding4, posicionAltoTexto4(0) + 1, { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["descripcion"]) ? cortarTexto(elemento["descripcion"], 24) : "Sin información", distanciaAncho4 + 104 + margin4 * 2 + padding4, posicionAltoTexto4(0) + 1, { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["cantidad"]) ? cortarTexto(elemento["cantidad"], 11) : "Sin información", distanciaAncho4 + 211 + margin4 * 3 + padding4, posicionAltoTexto4(0) + 1, { baseline: "middle", lineBreak: false })

                let mensajePagina1 = `Etiqueta 1`
                let mensajePagina2 = `Etiqueta 2`

                if (bultos > 1 && i < bultos) {
                    mensajePagina1 = `Bulto ${i + 1} / ${bultos} | Etiqueta 1`
                    mensajePagina2 = `Bulto ${i + 1} / ${bultos} | Etiqueta 2`
                }

                if (indexFF == 9) {
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
                } else {
                    distanciaAlto4 += 16
                }
            })
        }

        // ! /SECCION FULLFILLMENT

        if (bultos > 1 && i < bultos && indexFF < 9) {
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

module.exports = e10x15A
