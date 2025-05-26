const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")

const { iconCalendarChico, iconNombreGrande, iconTelefonoGrande, iconUbicacionGrande } = require("../../utils/icons.js")
const { esDatoValido, cortarTexto, tamañoSegunLargo } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro, colorNegroClaro } = require("../../utils/colores.js")

//ETIQUETA 10x10 CON SOLO

const e10x10S = async (doc, objData) => {
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
        }

        // ! SECCION SUPERIOR
        tamañoFuente1 = 8
        altoContainer1 = 13
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

        doc.moveTo(distanciaAncho1, containerSiguiente1(1) - 3)
            .lineTo(190, containerSiguiente1(1) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(2) - 3)
            .lineTo(190, containerSiguiente1(2) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(3) - 3)
            .lineTo(190, containerSiguiente1(3) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(4) - 3)
            .lineTo(190, containerSiguiente1(4) - 3)
            .fill(colorGrisOscuro)

        doc.fillAndStroke("black", "black")
        doc.fontSize(tamañoSegunLargo(localidad, tamañoFuente1, anchoCaracteres1))
            .font("Helvetica-Bold")
            .text(esDatoValido(localidad) ? cortarTexto(localidad.toUpperCase(), anchoCaracteres1 + 5) : "Sin información", posicionAnchoTexto1, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconCalendarChico, posicionAnchoTexto1, posicionAltoTexto1(0) + 10)

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
        tamañoFuente2 = 10
        anchoContainer2 = 273
        altoContainer2 = 30
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

        doc.moveTo(distanciaAncho2, containerSiguiente2(0) - 3)
            .lineTo(275, containerSiguiente2(0) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(1) - 3)
            .lineTo(275, containerSiguiente2(1) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(2) - 3)
            .lineTo(275, containerSiguiente2(2) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho2, containerSiguiente2(3)).lineTo(275, containerSiguiente2(3)).fill(colorGrisOscuro)

        doc.fillAndStroke("black", "black")

        SVGtoPDF(doc, iconNombreGrande, posicionAnchoTexto2, posicionAltoTexto2(0) - 9)

        let tamañoNombre = tamañoSegunLargo(nombre, tamañoFuente2, 35)
        doc.fontSize(tamañoNombre)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombre) ? cortarTexto(nombre, 50) : "Sin información", posicionAnchoTexto2 + 22, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconTelefonoGrande, posicionAnchoTexto2, posicionAltoTexto2(1) - 8)

        let tamañoNumero = tamañoSegunLargo(nroTelefono, tamañoFuente2, 35)
        doc.fontSize(tamañoNumero)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroTelefono) ? cortarTexto(nroTelefono, 50) : "Sin información", posicionAnchoTexto2 + 22, posicionAltoTexto2(1), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconUbicacionGrande, posicionAnchoTexto2, posicionAltoTexto2(2) - 10)

        let tamañoDireccion = tamañoSegunLargo(direccion, tamañoFuente2 - 2, 50)
        doc.fontSize(tamañoDireccion)
            .font("Helvetica-Bold")
            .text(`${esDatoValido(direccion) ? cortarTexto(direccion, 65) : "Sin información"} ${esDatoValido(cp) ? "CP: " + cp : ""}`, posicionAnchoTexto2 + 22, posicionAltoTexto2(2), { baseline: "middle", lineBreak: false })

        let tamañoObs = tamañoSegunLargo("Observacion: " + observacion, tamañoFuente2, 180)
        doc.fontSize(tamañoObs)
        comienzoObs = tamañoObs == tamañoFuente2 ? 67 : 55

        doc.fontSize(tamañoObs).font("Helvetica-Bold").text("Observación:", posicionAnchoTexto2, posicionAltoTexto2(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoObs)
            .font("Helvetica")
            .text(esDatoValido(observacion) ? cortarTexto(observacion, 330) : "Sin información", posicionAnchoTexto2, posicionAltoTexto2(3), { baseline: "middle", indent: comienzoObs, width: anchoContainer2 - 8, height: altoContainer2 * 2.2 })

        // ! /SECCION DESTINATARIO

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

module.exports = e10x10S
