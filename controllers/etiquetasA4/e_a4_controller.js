const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")

const { iconCalendarChico, iconNombre, iconTelefono, iconUbicacion, iconNoQr } = require("../../utils/icons.js")
const { esDatoValido, cortarTexto } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro } = require("../../utils/colores.js")

// ! ETIQUETA a4 CON AMBOS SIMPLE

const ea4 = async (doc, objData, index, distanciaAlto1, cantFullfilmentPag, altoContenedor, mayorPorPag) => {
    let { nombreFantasia, logo, camposEspeciales, localidad, fecha, nroVenta, nroEnvio, nombre, nroTelefono, direccion, cp, observacion, total, peso, remitente, qr, bultos, fullfillment } = objData

    for (let i = 0; i < bultos; i++) {
        cantFullfilmentPag += camposEspeciales.length > 5 ? fullfillment.length + 3 : fullfillment.length + Math.ceil(camposEspeciales.length / 2)

        if ((index == 2 && cantFullfilmentPag > 28) || (index == 3 && cantFullfilmentPag > 16) || (index == 4 && cantFullfilmentPag > 10) || (index == 5 && cantFullfilmentPag > 4) || (index == 6 && cantFullfilmentPag > 0) || index > mayorPorPag) {
            await doc.addPage()
            cantFullfilmentPag = camposEspeciales > 6 ? fullfillment.length + Math.ceil(6 / 2) : fullfillment.length + Math.ceil(camposEspeciales.length / 2)

            index = 1
            distanciaAlto1 = 15
        } else if (index != 1) {
            distanciaAlto1 += altoContenedor + 10
        }

        altoContenedor = 130
        distanciaAncho = 35

        if (esDatoValido(qr)) {
            // qr = JSON.stringify(qr)
            let codigoQR = await new Promise((resolve, reject) => {
                QRCode.toBuffer(qr, { type: "png" }, (err, buffer) => {
                    if (err) reject(err)
                    resolve(buffer)
                })
            })
            doc.image(codigoQR, distanciaAncho - 5, distanciaAlto1 + 20, { height: 90 })
        } else {
            SVGtoPDF(doc, iconNoQr, distanciaAncho + 8, distanciaAlto1 + 35)
        }

        if (esDatoValido(logo)) {
            const response = await fetch(logo)
            const imageBuffer = await response.arrayBuffer()
            doc.image(Buffer.from(imageBuffer), distanciaAncho + 425, distanciaAlto1 + 15, { fit: [100, 65], align: "center", valign: "center" })
        }

        // ! SECCION SUPERIOR
        tamañoFuente1 = 8
        anchoContainer1 = 110
        altoContainer1 = 21
        margin1 = 6
        padding1 = 7
        borderRadius1 = 2
        distanciaAncho1 = distanciaAncho + 310
        posicionAnchoTexto1 = distanciaAncho1 + padding1
        const containerSiguiente1 = (num) => distanciaAlto1 + altoContainer1 * num + margin1 * num
        const posicionAltoTexto1 = (num) => {
            if (num == 0) {
                return distanciaAlto1 + altoContainer1 / 2
            } else {
                return containerSiguiente1(num) + altoContainer1 / 2
            }
        }

        doc.moveTo(distanciaAncho1 - 7, distanciaAlto1 - 3)
            .lineTo(distanciaAncho1 - 7, distanciaAlto1 + 105)
            .fill(colorGrisOscuro)

        doc.moveTo(distanciaAncho1, containerSiguiente1(1) - 3)
            .lineTo(distanciaAncho1 + anchoContainer1, containerSiguiente1(1) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(2) - 3)
            .lineTo(distanciaAncho1 + anchoContainer1, containerSiguiente1(2) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(3) - 3)
            .lineTo(distanciaAncho1 + anchoContainer1, containerSiguiente1(3) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(4) - 3)
            .lineTo(distanciaAncho1 + anchoContainer1, containerSiguiente1(4) - 3)
            .fill(colorGrisOscuro)

        doc.fillAndStroke("black", "black")
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(localidad) ? cortarTexto(localidad.toUpperCase(), 13) : "Sin información", distanciaAncho, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false, width: 80, align: "center" })

        SVGtoPDF(doc, iconCalendarChico, posicionAnchoTexto1, posicionAltoTexto1(0) - 5)

        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(fecha) ? cortarTexto(fecha, 15) : "Sin información", posicionAnchoTexto1 + 15, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente1).font("Helvetica").text("Remitente:", posicionAnchoTexto1, posicionAltoTexto1(1), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(remitente) ? cortarTexto(remitente, 10) : "Sin información", posicionAnchoTexto1 + 40, posicionAltoTexto1(1), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente1).font("Helvetica").text("Venta:", posicionAnchoTexto1, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroVenta) ? cortarTexto(nroVenta, 13) : "Sin información", posicionAnchoTexto1 + 25, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente1).font("Helvetica").text("Envio:", posicionAnchoTexto1, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroEnvio) ? cortarTexto(nroEnvio, 13) : "Sin información", posicionAnchoTexto1 + 25, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente1 + 2)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombreFantasia) ? cortarTexto(nombreFantasia.toUpperCase(), 25) : "LOGISTICA", distanciaAncho + 425, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false, width: 100, align: "center" })

        // ! /SECCION SUPERIOR

        // ! SECCION DESTINATARIO
        tamañoFuente2 = 8
        anchoContainer2 = 210
        altoContainer2 = 13
        margin2 = 6
        padding2 = 7
        borderRadius2 = 2
        distanciaAncho2 = distanciaAncho + 85
        distanciaAlto2 = distanciaAlto1
        posicionAnchoTexto2 = distanciaAncho2 + padding2
        const containerSiguiente2 = (num) => distanciaAlto2 + altoContainer2 * num + margin2 * num
        const posicionAltoTexto2 = (num) => {
            if (num == 0) {
                return distanciaAlto2 + altoContainer2 / 2
            } else {
                return containerSiguiente2(num) + altoContainer2 / 2
            }
        }

        doc.moveTo(distanciaAncho2, containerSiguiente2(1) - 3)
            .lineTo(distanciaAncho2 + anchoContainer2, containerSiguiente2(1) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(2) - 3)
            .lineTo(distanciaAncho2 + anchoContainer2, containerSiguiente2(2) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(3) - 3)
            .lineTo(distanciaAncho2 + anchoContainer2, containerSiguiente2(3) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(4) - 3)
            .lineTo(distanciaAncho2 + anchoContainer2, containerSiguiente2(4) - 3)
            .fill(colorGrisOscuro)

        doc.fillAndStroke("black", "black")

        SVGtoPDF(doc, iconNombre, posicionAnchoTexto2, posicionAltoTexto2(0) - 5)

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombre) ? cortarTexto(nombre, 30) : "Sin información", posicionAnchoTexto2 + 12, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconTelefono, posicionAnchoTexto2, posicionAltoTexto2(1) - 5)

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroTelefono) ? cortarTexto(nroTelefono, 30) : "Sin información", posicionAnchoTexto2 + 12, posicionAltoTexto2(1), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconUbicacion, posicionAnchoTexto2, posicionAltoTexto2(2) - 5)

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(`${esDatoValido(direccion) ? cortarTexto(direccion, 23) : "Sin información"} ${esDatoValido(cp) ? "CP: " + cp : ""}`, posicionAnchoTexto2 + 12, posicionAltoTexto2(2), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente2).font("Helvetica-Bold").text("Peso declarado:", posicionAnchoTexto2, posicionAltoTexto2(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente2)
            .font("Helvetica")
            .text(esDatoValido(peso) ? cortarTexto(peso, 20) : "Sin información", posicionAnchoTexto2 + 65, posicionAltoTexto2(3), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica-Bold")
            .text("Observación:", posicionAnchoTexto2, posicionAltoTexto2(4), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica")
            .text(esDatoValido(observacion) ? cortarTexto(observacion, 190) : "Sin información", posicionAnchoTexto2, posicionAltoTexto2(4), { baseline: "middle", indent: 40, width: anchoContainer2 - 10 })
        // ! /SECCION DESTINATARIO

        // ! SECCION CAMPOS ESPECIALES
        tamañoFuente3 = 8
        anchoContainer3 = 273
        altoContainer3 = 13
        margin3 = 6
        padding3 = 7
        borderRadius3 = 2
        distanciaAncho3 = distanciaAncho
        distanciaAlto3 = distanciaAlto1 + 125
        posicionAnchoTexto3 = distanciaAncho3 + padding3
        const containerSiguiente3 = (num) => distanciaAlto3 + altoContainer3 * num + margin3 * num
        const posicionAltoTexto3 = (num) => {
            if (num == 0) {
                return distanciaAlto3 + altoContainer3 / 2
            } else {
                return containerSiguiente3(num) + altoContainer3 / 2
            }
        }
        altoSumaCamposEspeciales = 0

        if (camposEspeciales.length > 0) {
            altoContenedor += 5
            altoSumaCamposEspeciales += 5

            doc.circle(posicionAnchoTexto3, distanciaAlto3 - 11, 2.5).fillAndStroke(colorGrisOscuro, colorGrisOscuro)
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("Campos especiales", posicionAnchoTexto3 + 6, distanciaAlto3 - 10, { baseline: "middle", lineBreak: false })
            doc.moveTo(125, distanciaAlto3 - 10)
                .lineTo(560, distanciaAlto3 - 10)
                .fill(colorGrisOscuro)

            siguiente = 0
            distanciaCE = 0
            await camposEspeciales.map((campo) => {
                if (siguiente < 6) {
                    let anchoTextoEsp = doc.widthOfString(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 15) + ":" : "CampoEsp:", { font: "Helvetica-Bold", size: tamañoFuente3 })

                    if (siguiente == 0 || siguiente % 2 == 0) {
                        altoContenedor += 19
                        altoSumaCamposEspeciales += 19
                        doc.fillAndStroke("black", "black")
                        doc.fontSize(tamañoFuente3)
                            .font("Helvetica-Bold")
                            .text(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 15) + ":" : "CampoEsp:", posicionAnchoTexto3, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })
                        doc.fontSize(tamañoFuente2)
                            .font("Helvetica")
                            .text(esDatoValido(campo["valor"]) ? cortarTexto(campo["valor"], 25) : "Sin información", posicionAnchoTexto3 + anchoTextoEsp + 4, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })
                    } else {
                        doc.moveTo(anchoContainer3 + 30, containerSiguiente3(distanciaCE) - 2)
                            .lineTo(anchoContainer3 + 30, containerSiguiente3(distanciaCE) + 12)
                            .fill(colorGrisOscuro)

                        doc.fillAndStroke("black", "black")
                        doc.fontSize(tamañoFuente3)
                            .font("Helvetica-Bold")
                            .text(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 15) + ":" : "CampoEsp:", 265 + 38 + padding3, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })
                        doc.fontSize(tamañoFuente2)
                            .font("Helvetica")
                            .text(esDatoValido(campo["valor"]) ? cortarTexto(campo["valor"], 25) : "Sin información", 265 + 38 + padding3 + anchoTextoEsp + 4, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })

                        if (siguiente < 4) {
                            doc.moveTo(distanciaAncho3, containerSiguiente3(distanciaCE + 1) - 5)
                                .lineTo(560, containerSiguiente3(distanciaCE + 1) - 5)
                                .fill(colorGrisOscuro)
                        }

                        distanciaCE += 1
                    }
                    siguiente += 1
                }
            })
        } else {
        }
        // ! /SECCION CAMPOS ESPECIALES

        // ! SECCION FULLFILLMENT
        tamañoFuente4 = 6
        anchoContainer4 = 273
        altoContainer4 = 13
        margin4 = 3
        padding4 = 5
        borderRadius4 = 2
        distanciaAncho4 = distanciaAncho
        distanciaAlto4 = camposEspeciales.length == 0 ? distanciaAlto1 + 145 : distanciaAlto1 + 145 + altoSumaCamposEspeciales
        posicionAnchoTexto4 = distanciaAncho4 + padding4
        const containerSiguiente4 = (num) => distanciaAlto4 + altoContainer4 * num + margin4 * num
        const posicionAltoTexto4 = (num) => {
            if (num == 0) {
                return distanciaAlto4 + altoContainer4 / 2
            } else {
                return containerSiguiente4(num) + altoContainer4 / 2
            }
        }

        maximoCampoEspeciales = camposEspeciales.length > 6 ? 6 : camposEspeciales.length

        indexFF = Math.ceil(maximoCampoEspeciales / 2)

        if (fullfillment.length > 0) {
            altoContenedor += 30

            doc.circle(posicionAnchoTexto3, distanciaAlto4 - 21, 2.5).fillAndStroke(colorGrisOscuro, colorGrisOscuro)
            doc.fontSize(tamañoFuente2)
                .font("Helvetica")
                .text("Fullfillment", posicionAnchoTexto3 + 6, distanciaAlto4 - 20, { baseline: "middle", lineBreak: false })
            doc.moveTo(95, distanciaAlto4 - 20)
                .lineTo(560, distanciaAlto4 - 20)
                .fill(colorGrisOscuro)

            doc.fillAndStroke("black", "black")
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("SKU", posicionAnchoTexto4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("EAN", distanciaAncho4 + 104 + margin4 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("Descripción", distanciaAncho4 + 208 + margin4 * 2 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("Cantidad", distanciaAncho4 + 414 + margin4 * 3 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })

            await fullfillment.map((elemento) => {
                indexFF += 1

                if (indexFF > 42) {
                    return
                }

                altoContenedor += 15

                doc.moveTo(distanciaAncho4, distanciaAlto4)
                    .lineTo(distanciaAncho4 + 518 + margin4 * 3, distanciaAlto4)
                    .fill(colorGrisOscuro)

                doc.fillAndStroke("black", "black")
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["sku"]) ? cortarTexto(elemento["sku"], 25) : "Sin información", posicionAnchoTexto4, posicionAltoTexto4(0) + 1, { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["ean"]) ? cortarTexto(elemento["ean"], 25) : "Sin información", distanciaAncho4 + 104 + margin4 + padding4, posicionAltoTexto4(0) + 1, { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["descripcion"]) ? cortarTexto(elemento["descripcion"], 48) : "Sin información", distanciaAncho4 + 208 + margin4 * 2 + padding4, posicionAltoTexto4(0) + 1, { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["cantidad"]) ? cortarTexto(elemento["ean"], 25) : "Sin información", distanciaAncho4 + 414 + margin4 * 3 + padding4, posicionAltoTexto4(0) + 1, { baseline: "middle", lineBreak: false })

                distanciaAlto4 += 15
            })
        }

        // ! /SECCION FULLFILLMENT

        doc.roundedRect(distanciaAncho - 10, distanciaAlto1 - 10, 550, altoContenedor, 7).stroke("black")

        if (bultos > 1 && i < bultos) {
            doc.fontSize(7)
                .font("Helvetica")
                .text(`Bulto ${i + 1} / ${bultos}`, 380, distanciaAlto1, {
                    width: 170,
                    align: "right",
                })
        }

        index++
    }

    return {
        index,
        cantFullfilmentPag,
        distanciaAlto1,
        altoContenedor,
    }
}

module.exports = ea4
