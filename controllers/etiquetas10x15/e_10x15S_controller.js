const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")

const { iconCalendarGrande, iconNombreGrande, iconTelefonoGrande, iconUbicacionGrande } = require("../../utils/icons.js")
const { esDatoValido, cortarTexto, tamañoSegunLargo } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro } = require("../../utils/colores.js")

//ETIQUETA 10X15 CON SOLO

const e10x15S = async (doc, objData) => {
    let { nombreFantasia, logo, camposEspeciales, ciudad, localidad, fecha, nroVenta, nroEnvio, nombre, nroTelefono, direccion, cp, observacion, ref, total, peso, remitente, qr, bultos, fullfillment } = objData

    direccion = esDatoValido(ciudad) && esDatoValido(localidad) ? `${direccion}, ${localidad}` : direccion
    localidad = esDatoValido(ciudad) ? ciudad : localidad
    
    observacion = esDatoValido(observacion) && esDatoValido(ref) ? `${observacion} / Ref: ${ref}` : esDatoValido(ref) ? `Ref: ${ref}`: observacion

    for (let i = 0; i < bultos; i++) {
        distanciaAncho1 = 129
        anchoContainer1 = 150
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
            doc.image(codigoQR, 0, 75, { height: 125 })
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
        doc.fontSize(tamañoSegunLargo(nombreFantasia, 23, 14))
            .font("Helvetica-Bold")
            .text(esDatoValido(nombreFantasia) ? cortarTexto(nombreFantasia, 18) : "Logistica", 63, 30, { lineBreak: false, baseline: "middle" })

        // ! SECCION SUPERIOR
        tamañoFuente1 = 11
        anchoContainer12 = 273
        altoContainer1 = 30
        margin1 = 6
        padding1 = 7
        borderRadius1 = 5
        distanciaAncho12 = 5
        distanciaAlto1 = 48
        posicionAnchoTexto1 = distanciaAncho1 + padding1
        posicionAnchoTexto12 = distanciaAncho12

        const containerSiguiente1 = (num) => distanciaAlto1 + altoContainer1 * num + margin1 * num
        const posicionAltoTexto1 = (num) => {
            if (num == 0) {
                return distanciaAlto1 + altoContainer1 / 2
            } else {
                return containerSiguiente1(num) + altoContainer1 / 2
            }
        }

        doc.roundedRect(distanciaAncho12, distanciaAlto1, anchoContainer12, altoContainer1, borderRadius1) // x, y, ancho, alto, radio de la esquina
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
        doc.fontSize(tamañoSegunLargo(localidad, 14, 27))
            .font("Helvetica-Bold")
            .text(esDatoValido(localidad) ? cortarTexto(localidad.toUpperCase(), 32) : "Sin información", posicionAnchoTexto12, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false, width: anchoContainer12, align: "center" })

        SVGtoPDF(doc, iconCalendarGrande, posicionAnchoTexto1, posicionAltoTexto1(0) + 27)

        doc.fillAndStroke("black", "black")
        doc.fontSize(tamañoSegunLargo(fecha, tamañoFuente1, 15))
            .font("Helvetica-Bold")
            .text(esDatoValido(fecha) ? cortarTexto(fecha, anchoCaracteres2) : "Sin información", posicionAnchoTexto1 + 20, posicionAltoTexto1(1), { baseline: "middle", lineBreak: false })

        let tamañoVenta = tamañoSegunLargo("Venta: " + nroVenta, tamañoFuente1, anchoCaracteres2 + 7)
        doc.fontSize(tamañoVenta)
        let anchoTextoVenta = doc.widthOfString("Venta:", { font: "Helvetica", size: tamañoVenta })

        doc.fontSize(tamañoVenta).font("Helvetica").text("Venta:", posicionAnchoTexto1, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoVenta)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroVenta) ? cortarTexto(nroVenta, anchoCaracteres2 + 6) : "Sin información", posicionAnchoTexto1 + anchoTextoVenta, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })

        let tamañoEnvio = tamañoSegunLargo("Envio: " + nroEnvio, tamañoFuente1, anchoCaracteres2 + 7)
        doc.fontSize(tamañoEnvio)
        let anchoTextoEnvio = doc.widthOfString("Envio:", { font: "Helvetica", size: tamañoEnvio })

        doc.fontSize(tamañoEnvio).font("Helvetica").text("Envio:", posicionAnchoTexto1, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoEnvio)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroEnvio) ? cortarTexto(nroEnvio, anchoCaracteres2 + 6) : "Sin información", posicionAnchoTexto1 + anchoTextoEnvio, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })
        // ! /SECCION SUPERIOR

        // ! SECCION DESTINATARIO
        tamañoFuente2 = 10
        anchoContainer2 = 273
        altoContainer2 = 30
        margin2 = 6
        padding2 = 7
        borderRadius2 = 2
        distanciaAncho2 = 5
        distanciaAlto2 = distanciaAlto1 + 167
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

        let tamañoDireccion = tamañoSegunLargo(direccion, tamañoFuente2, 35)
        doc.fontSize(tamañoDireccion)
            .font("Helvetica-Bold")
            .text(`${esDatoValido(direccion) ? cortarTexto(direccion, 40) : "Sin información"} ${esDatoValido(cp) ? "CP: " + cortarTexto(cp, 10) : ""}`, posicionAnchoTexto2 + 22, posicionAltoTexto2(2), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica-Bold")
            .text("Observación:", posicionAnchoTexto2, posicionAltoTexto2(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica")
            .text(esDatoValido(observacion) ? cortarTexto(observacion, 330) : "Sin información", posicionAnchoTexto2, posicionAltoTexto2(3), { baseline: "middle", indent: 55, width: anchoContainer2 - 8, height: altoContainer2 * 2.2 })
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

module.exports = e10x15S
