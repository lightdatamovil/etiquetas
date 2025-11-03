const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")
const BwipJs = require("bwip-js")

const { iconCalendar, iconNombre, iconTelefono, iconUbicacion } = require("../../utils/icons.js")
const { esDatoValido, cortarTexto, tamañoSegunLargo, altoCodigoBarras } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro, colorNegroClaro } = require("../../utils/colores.js")
//ETIQUETA 10X15 CON CAMPOS ESPECIALES

const e10x15CE = async ({ doc, objData, llevaCodigo, llevaCodigoBarras, camposExtraGrande, localidadSinFranja }) => {
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
        altoContainer1 = 22
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

        if (!localidadSinFranja) {
            doc.roundedRect(distanciaAncho1, distanciaAlto1, anchoContainer1, altoContainer1, borderRadius1) // x, y, ancho, alto, radio de la esquina
                .fillAndStroke("black", "black")
        } else {
            doc.moveTo(distanciaAncho1, containerSiguiente1(0) - 3)
                .lineTo(275, containerSiguiente1(0) - 3)
                .fill(colorGrisOscuro)
            doc.moveTo(distanciaAncho1, containerSiguiente1(1) - 3)
                .lineTo(275, containerSiguiente1(1) - 3)
                .fill(colorGrisOscuro)
        }

        doc.moveTo(distanciaAncho1, containerSiguiente1(2) - 3)
            .lineTo(275, containerSiguiente1(2) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(3) - 3)
            .lineTo(275, containerSiguiente1(3) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(4) - 3)
            .lineTo(275, containerSiguiente1(4) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(5) - 3)
            .lineTo(275, containerSiguiente1(5) - 3)
            .fill(colorGrisOscuro)

        doc.fillAndStroke(localidadSinFranja ? "black" : "white", localidadSinFranja ? "black" : "white")
        doc.fontSize(tamañoSegunLargo(localidad, tamañoFuente1, anchoCaracteres1))
            .font("Helvetica-Bold")
            .text(esDatoValido(localidad) ? cortarTexto(localidad.toUpperCase(), anchoCaracteres1 + 5) : "Sin información", distanciaAncho1, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false, width: anchoContainer1, align: "center" })

        SVGtoPDF(doc, iconCalendar, posicionAnchoTexto1, posicionAltoTexto1(0) + 17)

        doc.fillAndStroke("black", "black")
        doc.fontSize(tamañoSegunLargo(fecha, tamañoFuente1, 15))
            .font("Helvetica-Bold")
            .text(esDatoValido(fecha) ? fecha : "Sin información", posicionAnchoTexto1 + 20, posicionAltoTexto1(1), { baseline: "middle", lineBreak: false })

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
        tamañoFuente2 = 9
        anchoContainer2 = 273
        altoContainer2 = 20
        margin2 = 6
        padding2 = 7
        borderRadius2 = 2
        distanciaAncho2 = 5
        distanciaAlto2 = distanciaAlto1 + 137
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

        doc.moveTo(distanciaAncho2, distanciaAlto2 - 3)
            .lineTo(275, distanciaAlto2 - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(140, distanciaAlto2 - 1)
            .lineTo(140, distanciaAlto2 + 20)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(1) - 3)
            .lineTo(275, containerSiguiente2(1) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(2) - 3)
            .lineTo(275, containerSiguiente2(2) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(3) + 5)
            .lineTo(275, containerSiguiente2(3) + 5)
            .fill(colorGrisOscuro)

        doc.fillAndStroke("black", "black")

        SVGtoPDF(doc, iconNombre, posicionAnchoTexto2, posicionAltoTexto2(0) - 5)

        let tamañoNombre = tamañoSegunLargo(nombre, tamañoFuente2, 19)
        doc.fontSize(tamañoNombre)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombre) ? cortarTexto(nombre, 28) : "Sin información", posicionAnchoTexto2 + 12, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconTelefono, 145 + padding2, posicionAltoTexto2(0) - 5)

        let tamañoNumero = tamañoSegunLargo(nroTelefono, tamañoFuente2, 19)
        doc.fontSize(tamañoNumero)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroTelefono) ? cortarTexto(nroTelefono, 28) : "Sin información", 155 + padding2, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconUbicacion, posicionAnchoTexto2, posicionAltoTexto2(1) - 5)

        let tamañoDireccion = tamañoSegunLargo(direccion, tamañoFuente2, 37)
        doc.fontSize(tamañoDireccion)
            .font("Helvetica-Bold")
            .text(`${esDatoValido(direccion) ? cortarTexto(direccion, 57) : "Sin información"} ${esDatoValido(cp) ? "CP: " + cp : ""}`, posicionAnchoTexto2 + 12, posicionAltoTexto2(1), { baseline: "middle", lineBreak: false })

        let tamañoObs = tamañoSegunLargo("Observacion: " + observacion, tamañoFuente2, 130)
        doc.fontSize(tamañoObs)
        comienzoObs = tamañoObs == tamañoFuente2 ? 63 : 50

        doc.fontSize(tamañoObs).font("Helvetica-Bold").text("Observación:", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoObs)
            .font("Helvetica")
            .text(esDatoValido(observacion) ? cortarTexto(observacion, 155) : "Sin información", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", indent: comienzoObs, width: anchoContainer2 - 20 })
        // ! /SECCION DESTINATARIO

        // ! SECCION CAMPOS ESPECIALES
        tamañoFuente3 = 9
        anchoContainer3 = 273
        altoContainer3 = 20
        margin3 = 6
        padding3 = 7
        borderRadius3 = 2
        distanciaAncho3 = 5
        distanciaAlto3 = distanciaAlto1 + 243
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
            doc.circle(posicionAnchoTexto3, distanciaAlto3 - 11, 2.5).fillAndStroke(colorNegroClaro, colorNegroClaro)
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("Campos extra", posicionAnchoTexto3 + 6, distanciaAlto3 - 10, { baseline: "middle", lineBreak: false })

            siguiente = 0
            await camposEspeciales.map((campo) => {
                if (siguiente < 5) {
                    let tamañoCE = tamañoSegunLargo(campo["nombre"] + campo["valor"], camposExtraGrande ? tamañoFuente3 + 3 : tamañoFuente3, 65)
                    doc.fontSize(tamañoCE)
                    let anchoTextoEsp = doc.widthOfString(campo["nombre"] ? cortarTexto(campo["nombre"], 25) + ":" : "CampoEsp:", { font: "Helvetica-Bold", size: tamañoCE })

                    doc.moveTo(distanciaAncho3, containerSiguiente3(siguiente) - 3)
                        .lineTo(275, containerSiguiente3(siguiente) - 3)
                        .fill(colorGrisOscuro)

                    doc.fillAndStroke("black", "black")
                    doc.fontSize(tamañoCE)
                        .font("Helvetica-Bold")
                        .text(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 25) + ":" : "CampoEsp:", posicionAnchoTexto3, posicionAltoTexto3(siguiente), { baseline: "middle", lineBreak: false })

                    nombresConPrecio = ["total", "total a cobrar", "total a pagar"]
                    campoValor = esDatoValido(campo["valor"]) ? (nombresConPrecio.includes(campo["nombre"].toLowerCase()) ? cortarTexto(`$${Number(campo["valor"]).toLocaleString("es-AR")}`, 50) : cortarTexto(campo["valor"], 50)) : "Sin información"

                    doc.fontSize(tamañoCE)
                        .font("Helvetica-Bold")
                        .text(campoValor, posicionAnchoTexto3 + anchoTextoEsp + 10, posicionAltoTexto3(siguiente), { baseline: "middle", lineBreak: false })

                    siguiente += 1
                }
            })

            doc.moveTo(distanciaAncho3, containerSiguiente3(siguiente) - 3)
                .lineTo(275, containerSiguiente3(siguiente) - 3)
                .fill(colorGrisOscuro)
        }

        // ! /SECCION CAMPOS ESPECIALES

        if (bultos > 1 && i < bultos) {
            doc.fillAndStroke("black", "black")
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

module.exports = e10x15CE
