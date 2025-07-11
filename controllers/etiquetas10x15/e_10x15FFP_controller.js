const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")
const BwipJs = require("bwip-js")

const { iconCalendar, iconNombre, iconTelefono, iconUbicacion } = require("../../utils/icons.js")
const { esDatoValido, cortarTexto, tamañoSegunLargo, altoCodigoBarras } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro, colorNegroClaro } = require("../../utils/colores.js")

//ETIQUETA 10X15 CON FULFILLMENT PREMIUM

const e10x15FF = async (doc, objData, llevaCodigo, llevaCodigoBarras) => {
    let { did, didCliente, nombreFantasia, logo, camposEspeciales, localidad, fecha, nroVenta, nroEnvio, nombre, nroTelefono, direccion, cp, observacion, total, peso, remitente, qr, bultos, fulfillment } = objData

    for (let i = 0; i < bultos; i++) {
        const distanciaAncho1 = 129
        const anchoContainer1 = 150
        const anchoCaracteres1 = 20
        const anchoCaracteres2 = 15

        if (esDatoValido(qr)) {
            // qr = JSON.stringify(qr)
            let codigoQR = await new Promise((resolve, reject) => {
                QRCode.toBuffer(qr, { type: "png" }, (err, buffer) => {
                    if (err) reject(err)
                    resolve(buffer)
                })
            })
            if (llevaCodigo) {
                doc.image(codigoQR, 0, 40, { height: 115 })
                doc.fontSize(8).font("Helvetica-Bold").text(`${did}d54df4s8a${didCliente}`, 0, 155, { baseline: "middle", lineBreak: false, width: 125, align: "center" })
            } else {
                doc.image(codigoQR, 0, 40, { height: 125 })
            }
        }

        if (esDatoValido(logo)) {
            const response = await fetch(logo)
            const imageBuffer = await response.arrayBuffer()
            doc.image(Buffer.from(imageBuffer), 10, 10, { fit: [50, 35] })
        }

        doc.fontSize(tamañoSegunLargo(nombreFantasia, 20, 14))
            .font("Helvetica-Bold")
            .text(esDatoValido(nombreFantasia) ? cortarTexto(nombreFantasia, 20) : "Logistica", 63, 30, { lineBreak: false, baseline: "middle" })

        if (llevaCodigoBarras && esDatoValido(nroVenta)) {
            let codigoBarras = await new Promise((resolve, reject) => {
                BwipJs.toBuffer(
                    {
                        bcid: "code128", // Tipo de código
                        text: nroVenta, // Texto a codificar
                        scale: 3, // Escala (tamaño)
                        height: altoCodigoBarras(nroVenta), // Alto del código
                        includetext: true, // Mostrar texto debajo
                        textxalign: "center", // Centrado del texto
                        textsize: 5,
                    },
                    (err, png) => {
                        if (err) reject(err)
                        resolve(png)
                    }
                )
            })

            doc.image(codigoBarras, 170, 5, { fit: [100, 50], align: "center", valign: "center" })
        }
        // ! SECCION SUPERIOR
        tamañoFuente1 = 10
        altoContainer1 = 21
        margin1 = 3
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

        doc.roundedRect(distanciaAncho1, containerSiguiente1(1), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(2), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(3), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(4), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)

        doc.fillAndStroke("white", "white")
        doc.fontSize(tamañoSegunLargo(localidad, tamañoFuente1, anchoCaracteres1))
            .font("Helvetica-Bold")
            .text(esDatoValido(localidad) ? cortarTexto(localidad.toUpperCase(), anchoCaracteres1 + 5) : "Sin información", distanciaAncho1, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false, width: anchoContainer1, align: "center" })

        doc.fillAndStroke("black", "black")

        SVGtoPDF(doc, iconCalendar, posicionAnchoTexto1, posicionAltoTexto1(0) + 17)

        doc.fontSize(tamañoSegunLargo(fecha, tamañoFuente1, 15))
            .font("Helvetica-Bold")
            .text(esDatoValido(fecha) ? cortarTexto(fecha, anchoCaracteres2) : "Sin información", posicionAnchoTexto1 + 20, posicionAltoTexto1(1), { baseline: "middle", lineBreak: false })

        let tamañoRem = tamañoSegunLargo("Rte.: " + remitente, tamañoFuente1, 20)
        doc.fontSize(tamañoRem)
        let anchoTextoRem = doc.widthOfString("Rte.:", { font: "Helvetica", size: tamañoRem })

        doc.fontSize(tamañoRem).font("Helvetica").text("Rte.:", posicionAnchoTexto1, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoRem)
            .font("Helvetica-Bold")
            .text(esDatoValido(remitente) ? cortarTexto(remitente, 23) : "Sin información", posicionAnchoTexto1 + anchoTextoRem, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })

        let tamañoVenta = tamañoSegunLargo("Venta: " + nroVenta, tamañoFuente1, anchoCaracteres2)
        doc.fontSize(tamañoVenta)
        let anchoTextoVenta = doc.widthOfString("Venta:", { font: "Helvetica", size: tamañoVenta })

        doc.fontSize(tamañoVenta).font("Helvetica").text("Venta:", posicionAnchoTexto1, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoVenta)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroVenta) ? cortarTexto(nroVenta, anchoCaracteres2 + 8) : "Sin información", posicionAnchoTexto1 + anchoTextoVenta, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })

        let tamañoEnvio = tamañoSegunLargo("Envio: " + nroEnvio, tamañoFuente1, anchoCaracteres2)
        doc.fontSize(tamañoEnvio)
        let anchoTextoEnvio = doc.widthOfString("Envio:", { font: "Helvetica", size: tamañoEnvio })

        doc.fontSize(tamañoEnvio).font("Helvetica").text("Envio:", posicionAnchoTexto1, posicionAltoTexto1(4), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoEnvio)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroEnvio) ? cortarTexto(nroEnvio, anchoCaracteres2 + 8) : "Sin información", posicionAnchoTexto1 + anchoTextoEnvio, posicionAltoTexto1(4), { baseline: "middle", lineBreak: false })
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

        doc.circle(posicionAnchoTexto2, distanciaAlto2 - 11, 2.5).fillAndStroke(colorNegroClaro, colorNegroClaro)
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

        let tamañoNombre = tamañoSegunLargo(nombre, tamañoFuente2, 24)
        doc.fontSize(tamañoNombre)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombre) ? cortarTexto(nombre, 33) : "Sin información", posicionAnchoTexto2 + 12, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconTelefono, 145 + padding2, posicionAltoTexto2(0) - 5)

        let tamañoNumero = tamañoSegunLargo(nroTelefono, tamañoFuente2, 24)
        doc.fontSize(tamañoNumero)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroTelefono) ? cortarTexto(nroTelefono, 30) : "Sin información", 155 + padding2, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconUbicacion, posicionAnchoTexto2, posicionAltoTexto2(1) - 5)

        let tamañoDireccion = tamañoSegunLargo(direccion, tamañoFuente2, 37)
        doc.fontSize(tamañoDireccion)
            .font("Helvetica-Bold")
            .text(`${esDatoValido(direccion) ? cortarTexto(direccion, 57) : "Sin información"} ${esDatoValido(cp) ? "CP: " + cp : ""}`, posicionAnchoTexto2 + 12, posicionAltoTexto2(1), { baseline: "middle", lineBreak: false })

        let tamañoObs = tamañoSegunLargo("Observacion: " + observacion, tamañoFuente2, 130)
        doc.fontSize(tamañoObs)
        comienzoObs = tamañoObs == tamañoFuente2 ? 53 : 40

        doc.fontSize(tamañoObs).font("Helvetica-Bold").text("Observación:", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoObs)
            .font("Helvetica")
            .text(esDatoValido(observacion) ? cortarTexto(observacion, 180) : "Sin información", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", indent: comienzoObs, width: anchoContainer2 - 10 })

        // ! /SECCION DESTINATARIO

        // ! SECCION FULFILLMENT
        tamañoFuente4 = 6
        anchoContainer4 = 273
        altoContainer4 = 13
        margin4 = 3
        padding4 = 5
        borderRadius4 = 2
        distanciaAncho4 = 5
        distanciaAlto4 = distanciaAlto1 + 225
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
        if (fulfillment.length > 0) {
            doc.circle(12, distanciaAlto4 - 21, 2.5).fillAndStroke(colorNegroClaro, colorNegroClaro)
            doc.fontSize(tamañoFuente2)
                .font("Helvetica")
                .text("Fullfillment", 12 + 6, distanciaAlto4 - 20, { baseline: "middle", lineBreak: false })
            doc.moveTo(60, distanciaAlto4 - 20)
                .lineTo(275, distanciaAlto4 - 20)
                .fill(colorGrisOscuro)

            doc.fillAndStroke("black", "black")
            doc.fontSize(tamañoFuente4 + 2)
                .font("Helvetica")
                .text("SKU", posicionAnchoTexto4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(tamañoFuente4 + 2)
                .font("Helvetica")
                .text("EAN", distanciaAncho4 + 52 + margin4 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(tamañoFuente4 + 2)
                .font("Helvetica")
                .text("Descripción", distanciaAncho4 + 104 + margin4 * 2 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })
            doc.fontSize(tamañoFuente4 + 2)
                .font("Helvetica")
                .text("Cantidad", distanciaAncho4 + 224 + margin4 * 3 + padding4, posicionAltoTexto4(0) - 12, { baseline: "middle", lineBreak: false })

            for (elemento of fulfillment) {
                indexFF += 1
                if (indexFF < 37) {
                    let mensajePagina1 = `Etiqueta 1`
                    let mensajePagina2 = `Etiqueta 2`

                    if (bultos > 1 && i < bultos) {
                        mensajePagina1 = `Bulto ${i + 1} / ${bultos} | Etiqueta 1`
                        mensajePagina2 = `Bulto ${i + 1} / ${bultos} | Etiqueta 2`
                    }

                    if (indexFF == 10) {
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
                    doc.roundedRect(distanciaAncho4 + 104 + margin4 * 2, distanciaAlto4, 126, altoContainer4, borderRadius4).fillAndStroke(colorGrisClaro, colorGrisClaro)
                    doc.roundedRect(distanciaAncho4 + 231 + margin4 * 3, distanciaAlto4, 31, altoContainer4, borderRadius4).fillAndStroke(colorGrisClaro, colorGrisClaro)

                    doc.fillAndStroke("black", "black")
                    doc.fontSize(tamañoFuente4)
                        .font("Helvetica")
                        .text(esDatoValido(elemento["sku"]) ? cortarTexto(elemento["sku"], 11) : "Sin información", posicionAnchoTexto4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })
                    doc.fontSize(tamañoFuente4)
                        .font("Helvetica")
                        .text(esDatoValido(elemento["ean"]) ? cortarTexto(elemento["ean"], 11) : "Sin información", distanciaAncho4 + 52 + margin4 + padding4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })
                    doc.fontSize(tamañoFuente4)
                        .font("Helvetica")
                        .text(esDatoValido(elemento["descripcion"]) ? cortarTexto(elemento["descripcion"], 40) : "Sin información", distanciaAncho4 + 104 + margin4 * 2 + padding4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })
                    doc.fontSize(tamañoFuente4)
                        .font("Helvetica")
                        .text(esDatoValido(elemento["cantidad"]) ? cortarTexto(elemento["cantidad"], 6) : "Sin información", distanciaAncho4 + 231 + margin4 * 3 + padding4, posicionAltoTexto4(0), { baseline: "middle", lineBreak: false })

                    if (indexFF != 9) {
                        distanciaAlto4 += 16
                    }
                }
            }
        }

        // ! /SECCION FULFILLMENT

        if (bultos > 1 && i < bultos && fulfillment.length < 10) {
            doc.fontSize(10)
                .font("Helvetica-Bold")
                .text(`BULTO ${i + 1} / ${bultos}`, 100, 10, {
                    width: 170,
                    align: "right",
                })
        }

        if (bultos > 1 && i < bultos - 1) {
            doc.addPage()
        }
    }
}

module.exports = e10x15FF
