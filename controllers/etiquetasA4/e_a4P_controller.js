const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")

const { iconCalendarChico, iconNombre, iconTelefono, iconUbicacion, iconNoQr, iconPeso } = require("../../utils/icons.js")
const { esDatoValido, cortarTexto, tamañoSegunLargo } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro, colorNegroClaro } = require("../../utils/colores.js")

// ! ETIQUETA a4 CON AMBOS PREMIUM

const ea4P = async (doc, objData, index, distanciaAlto1, cantFulfillmentPag, altoContenedor, mayorPorPag, llevaCodigo, totalGrande, observacionA4Grande) => {
    let { did, didCliente, nombreFantasia, logo, camposEspeciales, localidad, fecha, nroVenta, nroEnvio, nombre, nroTelefono, direccion, cp, observacion, total, peso, remitente, qr, bultos, fulfillment } = objData

    for (let i = 0; i < bultos; i++) {
        cantFulfillmentPag += camposEspeciales.length > 5 ? fulfillment.length + 3 : fulfillment.length + Math.ceil(camposEspeciales.length / 2)

        if ((index == 2 && cantFulfillmentPag > 28) || (index == 3 && cantFulfillmentPag > 16) || (index == 4 && cantFulfillmentPag > 10) || (index == 5 && cantFulfillmentPag > 4) || (index == 6 && cantFulfillmentPag > 0) || index > mayorPorPag) {
            await doc.addPage()
            cantFulfillmentPag = camposEspeciales > 6 ? fulfillment.length + Math.ceil(6 / 2) : fulfillment.length + Math.ceil(camposEspeciales.length / 2)

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
            if (llevaCodigo) {
                doc.image(codigoQR, distanciaAncho, distanciaAlto1 + 15, { height: 80 })
                doc.fontSize(8)
                    .font("Helvetica-Bold")
                    .text(`${did}d54df4s8a${didCliente}`, distanciaAncho, distanciaAlto1 + 97, { baseline: "middle", lineBreak: false, width: 85, align: "center" })
            } else {
                doc.image(codigoQR, distanciaAncho - 5, distanciaAlto1 + 20, { height: 90 })
            }
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

        doc.roundedRect(distanciaAncho, distanciaAlto1, 80, altoContainer1, borderRadius1) // x, y, ancho, alto, radio de la esquina
            .fillAndStroke("black", "black")

        doc.moveTo(distanciaAncho1 - 7, distanciaAlto1 - 3)
            .lineTo(distanciaAncho1 - 7, distanciaAlto1 + 105)
            .fill(colorGrisOscuro)

        doc.roundedRect(distanciaAncho1, containerSiguiente1(0), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(1), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(2), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(3), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)

        doc.fillAndStroke("white", "white")
        doc.fontSize(tamañoSegunLargo(localidad, tamañoFuente1, 13))
            .font("Helvetica-Bold")
            .text(esDatoValido(localidad) ? cortarTexto(localidad.toUpperCase(), 18) : "Sin información", distanciaAncho, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false, width: 80, align: "center" })

        doc.fillAndStroke("black", "black")

        SVGtoPDF(doc, iconCalendarChico, posicionAnchoTexto1, posicionAltoTexto1(0) - 5)

        doc.fontSize(tamañoSegunLargo(fecha, tamañoFuente1, 15))
            .font("Helvetica-Bold")
            .text(esDatoValido(fecha) ? fecha : "Sin información", posicionAnchoTexto1 + 15, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false })

        let tamañoRem = tamañoSegunLargo("Rte.: " + remitente, tamañoFuente1, 19)
        doc.fontSize(tamañoRem)
        let anchoTextoRem = doc.widthOfString("Rte.:", { font: "Helvetica", size: tamañoRem })

        doc.fontSize(tamañoRem).font("Helvetica").text("Rte.:", posicionAnchoTexto1, posicionAltoTexto1(1), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoRem)
            .font("Helvetica-Bold")
            .text(esDatoValido(remitente) ? cortarTexto(remitente, 20) : "Sin información", posicionAnchoTexto1 + anchoTextoRem, posicionAltoTexto1(1), { baseline: "middle", lineBreak: false })

        let tamañoVenta = tamañoSegunLargo("Venta: " + nroVenta, tamañoFuente1, 20)
        doc.fontSize(tamañoVenta)
        let anchoTextoVenta = doc.widthOfString("Venta:", { font: "Helvetica", size: tamañoVenta })

        doc.fontSize(tamañoVenta).font("Helvetica").text("Venta:", posicionAnchoTexto1, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoVenta)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroVenta) ? cortarTexto(nroVenta, 23) : "Sin información", posicionAnchoTexto1 + anchoTextoVenta, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })

        let tamañoEnvio = tamañoSegunLargo("Envio: " + nroEnvio, tamañoFuente1, 20)
        doc.fontSize(tamañoEnvio)
        let anchoTextoEnvio = doc.widthOfString("Envio:", { font: "Helvetica", size: tamañoEnvio })

        doc.fontSize(tamañoEnvio).font("Helvetica").text("Envio:", posicionAnchoTexto1, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoEnvio)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroEnvio) ? cortarTexto(nroEnvio, 23) : "Sin información", posicionAnchoTexto1 + anchoTextoEnvio, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })

        let tamañoNombreFantasia = tamañoSegunLargo(nombreFantasia, tamañoFuente1 + 2, 19)
        doc.fontSize(tamañoNombreFantasia)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombreFantasia) ? cortarTexto(nombreFantasia.toUpperCase(), 30) : "LOGISTICA", distanciaAncho + 425, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false, width: 100, align: "center" })

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

        doc.roundedRect(distanciaAncho2, containerSiguiente2(0), anchoContainer2, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho2, containerSiguiente2(1), anchoContainer2 / 2 - 2.5, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho2 + 2.5 + anchoContainer2 / 2, containerSiguiente2(1), anchoContainer2 / 2 - 2.5, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho2, containerSiguiente2(2), anchoContainer2, altoContainer2 * 2 - 5, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho2, containerSiguiente2(4) - 10, anchoContainer2, altoContainer2 * 2 + 10, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)

        doc.fillAndStroke("black", "black")

        SVGtoPDF(doc, iconNombre, posicionAnchoTexto2, posicionAltoTexto2(0) - 5)

        let tamañoNombre = tamañoSegunLargo(nombre, tamañoFuente1, 40)
        doc.fontSize(tamañoNombre)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombre) ? cortarTexto(nombre, 55) : "Sin información", posicionAnchoTexto2 + 12, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconTelefono, posicionAnchoTexto2, posicionAltoTexto2(1) - 5)

        let tamañoTelefono = tamañoSegunLargo(nroTelefono, tamañoFuente1, 40)
        doc.fontSize(tamañoTelefono)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroTelefono) ? cortarTexto(nroTelefono, 55) : "Sin información", posicionAnchoTexto2 + 12, posicionAltoTexto2(1), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconPeso, posicionAnchoTexto2 + 2.5 + anchoContainer2 / 2, posicionAltoTexto2(1) - 5)

        let tamañoPeso = tamañoSegunLargo(peso, tamañoFuente1, 40)
        doc.fontSize(tamañoPeso)
            .font("Helvetica-Bold")
            .text(esDatoValido(peso) ? `${cortarTexto(peso, 45)} kg.` : "Sin información", posicionAnchoTexto2 + 12 + 2.5 + anchoContainer2 / 2, posicionAltoTexto2(1), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconUbicacion, posicionAnchoTexto2, posicionAltoTexto2(2) - 5)

        let tamañoDireccion = tamañoSegunLargo(direccion, tamañoFuente1, 68)
        doc.fontSize(tamañoDireccion)
            .font("Helvetica-Bold")
            .text(`${esDatoValido(direccion) ? cortarTexto(direccion, 105) : "Sin información"} ${esDatoValido(cp) ? "CP: " + cortarTexto(cp, 10) : ""}`, posicionAnchoTexto2 + 12, posicionAltoTexto2(2), { baseline: "middle", width: anchoContainer2 - 10 })

        tamañoFuenteObs = tamañoFuente2 - 2
        indentObs = 40
        if (observacionA4Grande) {
            tamañoFuenteObs += 3
            indentObs += 20
        }

        doc.fontSize(tamañoFuenteObs)
            .font("Helvetica-Bold")
            .text("Observación:", posicionAnchoTexto2, posicionAltoTexto2(4) - 10, { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuenteObs)
            .font("Helvetica")
            .text(esDatoValido(observacion) ? cortarTexto(observacion, 250) : "Sin información", posicionAnchoTexto2, posicionAltoTexto2(4) - 10, { baseline: "middle", indent: indentObs, width: anchoContainer2 - 10 })
        // ! /SECCION DESTINATARIO

        // ! SECCION CAMPOS ESPECIALES
        tamañoFuente3 = 9
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

            doc.circle(posicionAnchoTexto3, distanciaAlto3 - 11, 2.5).fillAndStroke(colorNegroClaro, colorNegroClaro)
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("Campos extra", posicionAnchoTexto3 + 6, distanciaAlto3 - 10, { baseline: "middle", lineBreak: false })
            doc.moveTo(106, distanciaAlto3 - 10)
                .lineTo(560, distanciaAlto3 - 10)
                .fill(colorGrisOscuro)

            siguiente = 0
            distanciaCE = 0

            camposEspeciales = camposEspeciales.slice(0, 6)
            const esModoUnaColumna = camposEspeciales.length <= 3

            await camposEspeciales.map((campo, index) => {
                nombresConPrecio = ["total", "total a cobrar", "total a pagar"]
                campoValor = esDatoValido(campo["valor"]) ? (nombresConPrecio.includes(campo["nombre"].toLowerCase()) ? cortarTexto(` $${Number(campo["valor"]).toLocaleString("es-AR")}`, esModoUnaColumna ? 130 : 48) : cortarTexto(campo["valor"], esModoUnaColumna ? 130 : 48)) : "Sin información"

                let tamañoCE = tamañoSegunLargo(campo["nombre"] + campoValor, tamañoFuente3, esModoUnaColumna ? 115 : 40)
                if (totalGrande) {
                    tamañoCE = tamañoSegunLargo(campo["nombre"] + campoValor, nombresConPrecio.includes(campo["nombre"].toLowerCase()) ? tamañoFuente3 + 5 : tamañoFuente3, esModoUnaColumna ? 115 : 40)
                }

                doc.fontSize(tamañoCE)
                let anchoTextoEsp = doc.widthOfString(campo["nombre"] ? cortarTexto(campo["nombre"], esModoUnaColumna ? 50 : 38) + ":" : "CampoEsp:", { font: "Helvetica-Bold", size: tamañoCE })

                if (esModoUnaColumna) {
                    // Modo de una sola columna
                    let y = containerSiguiente3(index)
                    altoContenedor += 19
                    altoSumaCamposEspeciales += 19

                    doc.roundedRect(distanciaAncho3, y, 530, altoContainer3, borderRadius3).fillAndStroke(colorGrisClaro, colorGrisClaro)
                    doc.fillAndStroke("black", "black")

                    doc.fontSize(tamañoCE)
                        .font("Helvetica-Bold")
                        .text(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 50) + ":" : "CampoEsp:", posicionAnchoTexto3, posicionAltoTexto3(index), { baseline: "middle", lineBreak: false })

                    doc.fontSize(tamañoCE)
                        .font("Helvetica-Bold")
                        .text(campoValor, posicionAnchoTexto3 + anchoTextoEsp + 5, posicionAltoTexto3(index), { baseline: "middle", lineBreak: false })
                } else {
                    // Modo dos columnas
                    if (siguiente == 0 || siguiente % 2 == 0) {
                        altoContenedor += 19
                        altoSumaCamposEspeciales += 19
                        doc.roundedRect(distanciaAncho3, containerSiguiente3(distanciaCE), 261, altoContainer3, borderRadius3).fillAndStroke(colorGrisClaro, colorGrisClaro)
                        doc.fillAndStroke("black", "black")

                        doc.fontSize(tamañoCE)
                            .font("Helvetica-Bold")
                            .text(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 38) + ":" : "CampoEsp:", posicionAnchoTexto3, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })

                        doc.fontSize(tamañoCE)
                            .font("Helvetica-Bold")
                            .text(campoValor, posicionAnchoTexto3 + anchoTextoEsp + 5, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })
                    } else {
                        doc.roundedRect(261 + 38, containerSiguiente3(distanciaCE), 261, altoContainer3, borderRadius3).fillAndStroke(colorGrisClaro, colorGrisClaro)
                        doc.fillAndStroke("black", "black")

                        doc.fontSize(tamañoCE)
                            .font("Helvetica-Bold")
                            .text(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 38) + ":" : "CampoEsp:", 265 + 38 + padding3, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })

                        doc.fontSize(tamañoCE)
                            .font("Helvetica-Bold")
                            .text(campoValor, 265 + 38 + padding3 + anchoTextoEsp + 5, posicionAltoTexto3(distanciaCE), { baseline: "middle", lineBreak: false })

                        distanciaCE += 1
                    }
                    siguiente += 1
                }
            })
        }
        // ! /SECCION CAMPOS ESPECIALES

        // ! SECCION FULFILLMENT
        tamañoFuente4 = 6
        anchoContainer4 = 273
        altoContainer4 = 13
        margin4 = 3
        padding4 = 5
        borderRadius4 = 2
        distanciaAncho4 = distanciaAncho
        distanciaAlto4 = camposEspeciales.length == 0 ? distanciaAlto1 + 135 : distanciaAlto1 + 145 + altoSumaCamposEspeciales
        if (camposEspeciales.length == 0) {
            altoContenedor -= 10
        }

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

        if (fulfillment.length > 0) {
            altoContenedor += 30

            doc.circle(posicionAnchoTexto3, distanciaAlto4 - 21, 2.5).fillAndStroke(colorNegroClaro, colorNegroClaro)
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
                .text("Cantidad", distanciaAncho4 + 460 + margin4 * 3 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })

            await fulfillment.map((elemento) => {
                indexFF += 1

                if (indexFF > 42) {
                    return
                }

                altoContenedor += 15

                doc.roundedRect(distanciaAncho4, distanciaAlto4, 104, altoContainer4, borderRadius4).fillAndStroke(colorGrisClaro, colorGrisClaro)
                doc.roundedRect(distanciaAncho4 + 104 + margin4, distanciaAlto4, 104, altoContainer4, borderRadius4).fillAndStroke(colorGrisClaro, colorGrisClaro)
                doc.roundedRect(distanciaAncho4 + 208 + margin4 * 2, distanciaAlto4, 250, altoContainer4, borderRadius4).fillAndStroke(colorGrisClaro, colorGrisClaro)
                doc.roundedRect(distanciaAncho4 + 460 + margin4 * 3, distanciaAlto4, 58, altoContainer4, borderRadius4).fillAndStroke(colorGrisClaro, colorGrisClaro)

                doc.fillAndStroke("black", "black")
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["sku"]) ? cortarTexto(elemento["sku"], 25) : "Sin información", posicionAnchoTexto4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["ean"]) ? cortarTexto(elemento["ean"], 25) : "Sin información", distanciaAncho4 + 104 + margin4 + padding4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["descripcion"]) ? cortarTexto(elemento["descripcion"], 75) : "Sin información", distanciaAncho4 + 208 + margin4 * 2 + padding4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })
                doc.fontSize(tamañoFuente4)
                    .font("Helvetica")
                    .text(esDatoValido(elemento["cantidad"]) ? cortarTexto(elemento["cantidad"], 25) : "Sin información", distanciaAncho4 + 460 + margin4 * 3 + padding4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })

                distanciaAlto4 += 15
            })
        }

        // ! /SECCION FULFILLMENT

        doc.roundedRect(distanciaAncho - 10, distanciaAlto1 - 10, 550, altoContenedor, 7).stroke("black")

        if (bultos > 1 && i < bultos) {
            doc.fontSize(8)
                .font("Helvetica-Bold")
                .text(`BULTO ${i + 1} / ${bultos}`, 380, distanciaAlto1, {
                    width: 170,
                    align: "right",
                })
        }

        index++
    }

    return {
        index,
        cantFulfillmentPag,
        distanciaAlto1,
        altoContenedor,
    }
}

module.exports = ea4P
