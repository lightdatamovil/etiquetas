const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")

const { iconCalendarChico, iconNombreGrande, iconTelefonoGrande, iconUbicacionGrande } = require("../../utils/icons.js")
const { esDatoValido, cortarTexto } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro } = require("../../utils/colores.js")

//ETIQUETA 10x10 CON SOLO

const e10x10S = async (doc, objData) => {
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

        doc.moveTo(distanciaAncho1, containerSiguiente1(1) - 3)
            .lineTo(190, containerSiguiente1(1) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(2) - 3)
            .lineTo(190, containerSiguiente1(2) - 3)
            .fill(colorGrisOscuro)
        doc.moveTo(distanciaAncho1, containerSiguiente1(3) - 3)
            .lineTo(190, containerSiguiente1(3) - 3)
            .fill(colorGrisOscuro)

        doc.fillAndStroke("black", "black")
        doc.fontSize(tamañoFuente1)
            .font("Helvetica-Bold")
            .text(esDatoValido(localidad) ? cortarTexto(localidad.toUpperCase(), anchoCaracteres1) : "Sin información", posicionAnchoTexto1, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false })

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
            .text(esDatoValido(nombreFantasia) ? cortarTexto(nombreFantasia.toUpperCase(), 25) : "LOGISTICA", distanciaAncho1 + anchoContainer1 + margin1, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false, width: 80, align: "center" })

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

        doc.circle(posicionAnchoTexto2, distanciaAlto2 - 11, 2.5).fillAndStroke(colorGrisOscuro, colorGrisOscuro)
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

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(esDatoValido(nombre) ? cortarTexto(nombre, 35) : "Sin información", posicionAnchoTexto2 + 22, posicionAltoTexto2(0), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconTelefonoGrande, posicionAnchoTexto2, posicionAltoTexto2(1) - 8)

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroTelefono) ? cortarTexto(nroTelefono, 35) : "Sin información", posicionAnchoTexto2 + 22, posicionAltoTexto2(1), { baseline: "middle", lineBreak: false })

        SVGtoPDF(doc, iconUbicacionGrande, posicionAnchoTexto2, posicionAltoTexto2(2) - 10)

        doc.fontSize(tamañoFuente2)
            .font("Helvetica-Bold")
            .text(`${esDatoValido(direccion) ? cortarTexto(direccion, 25) : "Sin información"} ${esDatoValido(cp) ? "CP: " + cp : ""}`, posicionAnchoTexto2 + 22, posicionAltoTexto2(2), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica-Bold")
            .text("Observación:", posicionAnchoTexto2, posicionAltoTexto2(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica")
            .text(esDatoValido(observacion) ? cortarTexto(observacion, 195) : "Sin información", posicionAnchoTexto2, posicionAltoTexto2(3), { baseline: "middle", indent: 55, width: anchoContainer2 - 8, height: altoContainer2 * 1.5 })
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
