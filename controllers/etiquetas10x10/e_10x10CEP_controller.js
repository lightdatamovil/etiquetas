const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")

const { iconCalendarChico, iconNombre, iconTelefono, iconUbicacion } = require("../../utils/icons.js")
const { esDatoValido, cortarTexto, tamañoSegunLargo } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro, colorNegroClaro } = require("../../utils/colores.js")

//ETIQUETA 10x10 CON CAMPOS ESPECIALES PREMIUM

const e10x10CEP = async (doc, objData) => {
    let { nombreFantasia, logo, camposEspeciales, localidad, fecha, nroVenta, nroEnvio, nombre, nroTelefono, direccion, cp, observacion, total, peso, remitente, qr, bultos, fulfillment } = objData

    for (let i = 0; i < bultos; i++) {
        distanciaAncho1 = 80
        anchoContainer1 = 110
        anchoCaracteres1 = 20
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
        altoContainer1 = 12
        margin1 = 3
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

        doc.roundedRect(distanciaAncho1, distanciaAlto1, anchoContainer1, altoContainer1, borderRadius1).fillAndStroke("black", "black")

        doc.roundedRect(distanciaAncho1, containerSiguiente1(1), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(2), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(3), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(4), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)

        doc.fillAndStroke("white", "white")
        doc.fontSize(tamañoSegunLargo(localidad, tamañoFuente1, anchoCaracteres1))
            .font("Helvetica-Bold")
            .text(esDatoValido(localidad) ? cortarTexto(localidad.toUpperCase(), anchoCaracteres1 + 5) : "Sin información", distanciaAncho1, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false, width: anchoContainer1, align: "center" })

        SVGtoPDF(doc, iconCalendarChico, posicionAnchoTexto1, posicionAltoTexto1(0) + 10)

        doc.fillAndStroke("black", "black")
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

        let tamañoVenta = tamañoSegunLargo("Venta: " + nroVenta, tamañoFuente1, 22)
        doc.fontSize(tamañoVenta)
        let anchoTextoVenta = doc.widthOfString("Venta:", { font: "Helvetica", size: tamañoVenta })

        doc.fontSize(tamañoVenta).font("Helvetica").text("Venta:", posicionAnchoTexto1, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoVenta)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroVenta) ? cortarTexto(nroVenta, 23) : "Sin información", posicionAnchoTexto1 + anchoTextoVenta, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })

        let tamañoEnvio = tamañoSegunLargo("Envio: " + nroEnvio, tamañoFuente1, 22)
        doc.fontSize(tamañoEnvio)
        let anchoTextoEnvio = doc.widthOfString("Envio:", { font: "Helvetica", size: tamañoEnvio })

        doc.fontSize(tamañoEnvio).font("Helvetica").text("Envio:", posicionAnchoTexto1, posicionAltoTexto1(4), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoEnvio)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroEnvio) ? cortarTexto(nroEnvio, 23) : "Sin información", posicionAnchoTexto1 + anchoTextoEnvio, posicionAltoTexto1(4), { baseline: "middle", lineBreak: false })

        let tamañoNombreFantasia = tamañoSegunLargo(nombreFantasia, tamañoFuente1, 19)
        doc.fontSize(tamañoNombreFantasia)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombreFantasia) ? cortarTexto(nombreFantasia.toUpperCase(), 30) : "LOGISTICA", distanciaAncho1 + anchoContainer1 + margin1, posicionAltoTexto1(4), { baseline: "middle", lineBreak: false, width: 87, align: "center" })

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

        doc.circle(posicionAnchoTexto2, distanciaAlto2 - 11, 2.5).fillAndStroke(colorNegroClaro, colorNegroClaro)
        doc.fontSize(tamañoFuente2)
            .font("Helvetica")
            .text("Destinatario", posicionAnchoTexto2 + 6, distanciaAlto2 - 10, { baseline: "middle", lineBreak: false })
        doc.moveTo(70, distanciaAlto2 - 10)
            .lineTo(275, distanciaAlto2 - 10)
            .fill(colorGrisOscuro)

        doc.roundedRect(distanciaAncho2, distanciaAlto2, 134, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(134 + 11, distanciaAlto2, 134, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho2, containerSiguiente2(1), anchoContainer2, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho2, containerSiguiente2(2), anchoContainer2, altoContainer2 * 1.8, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)

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
            .text(esDatoValido(nroTelefono) ? cortarTexto(nroTelefono, 33) : "Sin información", 155 + padding2, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconUbicacion, posicionAnchoTexto2, posicionAltoTexto2(1) - 5)

        let tamañoDireccion = tamañoSegunLargo(direccion, tamañoFuente2, 50)
        doc.fontSize(tamañoDireccion)
            .font("Helvetica-Bold")
            .text(`${esDatoValido(direccion) ? cortarTexto(direccion, 70) : "Sin información"} ${esDatoValido(cp) ? "CP: " + cp : ""}`, posicionAnchoTexto2 + 12, posicionAltoTexto2(1), { baseline: "middle", lineBreak: false })

        let tamañoObs = tamañoSegunLargo("Observacion: " + observacion, tamañoFuente2, 130)
        doc.fontSize(tamañoObs)
        comienzoObs = tamañoObs == tamañoFuente2 ? 53 : 40

        doc.fontSize(tamañoObs).font("Helvetica-Bold").text("Observación:", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoObs)
            .font("Helvetica")
            .text(esDatoValido(observacion) ? cortarTexto(observacion, 165) : "Sin información", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", indent: comienzoObs, width: anchoContainer2 - 10 })
        // ! /SECCION DESTINATARIO

        // ! SECCION CAMPOS ESPECIALES
        tamañoFuente3 = 8
        anchoContainer3 = 273
        altoContainer3 = 13
        margin3 = 6
        padding3 = 7
        borderRadius3 = 2
        distanciaAncho3 = 5
        distanciaAlto3 = distanciaAlto1 + 170
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
            doc.moveTo(80, distanciaAlto3 - 10)
                .lineTo(275, distanciaAlto3 - 10)
                .fill(colorGrisOscuro)

            siguiente = 0
            await camposEspeciales.map((campo) => {
                if (siguiente < 5) {
                    let tamañoCE = tamañoSegunLargo(campo["nombre"] + campo["valor"], tamañoFuente3, 68)
                    doc.fontSize(tamañoCE)
                    let anchoTextoEsp = doc.widthOfString(campo["nombre"] ? cortarTexto(campo["nombre"], 25) + ":" : "CampoEsp:", { font: "Helvetica-Bold", size: tamañoCE })

                    doc.roundedRect(distanciaAncho3, containerSiguiente3(siguiente), anchoContainer3, altoContainer3, borderRadius3).fillAndStroke(colorGrisClaro, colorGrisClaro)
                    doc.fillAndStroke("black", "black")

                    doc.fontSize(tamañoCE)
                        .font("Helvetica-Bold")
                        .text(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 25) + ":" : "CampoEsp:", posicionAnchoTexto3, posicionAltoTexto3(siguiente), { baseline: "middle", lineBreak: false })

                    nombresConPrecio = ["total", "total a cobrar", "total a pagar"]
                    campoValor = esDatoValido(campo["valor"]) ? (nombresConPrecio.includes(campo["nombre"].toLowerCase()) ? cortarTexto(`$${Number(campo["valor"]).toLocaleString("es-AR")}`, 60) : cortarTexto(campo["valor"], 60)) : "Sin información"

                    doc.fontSize(tamañoCE)
                        .font("Helvetica-Bold")
                        .text(campoValor, posicionAnchoTexto3 + anchoTextoEsp + 10, posicionAltoTexto3(siguiente), { baseline: "middle", lineBreak: false })
                    siguiente += 1
                }
            })
        }
        // ! /SECCION CAMPOS ESPECIALES

        if (bultos > 1 && i < bultos) {
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

module.exports = e10x10CEP
