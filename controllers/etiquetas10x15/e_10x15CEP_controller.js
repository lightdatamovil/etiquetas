const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")

const { iconCalendar, iconNombre, iconTelefono, iconUbicacion } = require("../../utils/icons.js")
const { esDatoValido, cortarTexto, tamañoSegunLargo } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro } = require("../../utils/colores.js")

//ETIQUETA 10X15 CON CAMPOS ESPECIALES PREMIUM

const e10x15CEP = async (doc, objData) => {
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
            doc.image(codigoQR, 0, 40, { height: 125 })
        } else {
            distanciaAncho1 = 5
            anchoContainer1 = 273
            anchoCaracteres1 = 30
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

        doc.roundedRect(distanciaAncho1, containerSiguiente1(1), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(2), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho1, containerSiguiente1(3), anchoContainer1, altoContainer1, borderRadius1).fillAndStroke(colorGrisClaro, colorGrisClaro)

        doc.fillAndStroke("white", "white")
        doc.fontSize(tamañoSegunLargo(localidad, tamañoFuente1, anchoCaracteres1))
            .font("Helvetica-Bold")
            .text(esDatoValido(localidad) ? cortarTexto(localidad.toUpperCase(), anchoCaracteres1 + 5) : "Sin información", distanciaAncho1, posicionAltoTexto1(0), { baseline: "middle", lineBreak: false, width: anchoContainer1, align: "center" })

        SVGtoPDF(doc, iconCalendar, posicionAnchoTexto1, posicionAltoTexto1(0) + 20)

        doc.fillAndStroke("black", "black")
        doc.fontSize(tamañoSegunLargo(fecha, tamañoFuente1, 15))
            .font("Helvetica-Bold")
            .text(esDatoValido(fecha) ? cortarTexto(fecha, anchoCaracteres2) : "Sin información", posicionAnchoTexto1 + 20, posicionAltoTexto1(1), { baseline: "middle", lineBreak: false })

        let tamañoVenta = tamañoSegunLargo("Venta: " + nroVenta, tamañoFuente1, anchoCaracteres2)
        doc.fontSize(tamañoVenta)
        let anchoTextoVenta = doc.widthOfString("Venta:", { font: "Helvetica", size: tamañoVenta })

        doc.fontSize(tamañoVenta).font("Helvetica").text("Venta:", posicionAnchoTexto1, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoVenta)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroVenta) ? cortarTexto(nroVenta, anchoCaracteres2 + 8) : "Sin información", posicionAnchoTexto1 + anchoTextoVenta, posicionAltoTexto1(2), { baseline: "middle", lineBreak: false })

        let tamañoEnvio = tamañoSegunLargo("Envio: " + nroEnvio, tamañoFuente1, anchoCaracteres2)
        doc.fontSize(tamañoEnvio)
        let anchoTextoEnvio = doc.widthOfString("Envio:", { font: "Helvetica", size: tamañoEnvio })

        doc.fontSize(tamañoEnvio).font("Helvetica").text("Envio:", posicionAnchoTexto1, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoEnvio)
            .font("Helvetica-Bold")
            .text(esDatoValido(nroEnvio) ? cortarTexto(nroEnvio, anchoCaracteres2 + 8) : "Sin información", posicionAnchoTexto1 + anchoTextoEnvio, posicionAltoTexto1(3), { baseline: "middle", lineBreak: false })
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

        doc.circle(posicionAnchoTexto2, distanciaAlto2 - 11, 2.5).fillAndStroke(colorGrisOscuro, colorGrisOscuro)
        doc.fontSize(tamañoFuente2)
            .font("Helvetica")
            .text("Destinatario", posicionAnchoTexto2 + 6, distanciaAlto2 - 10, { baseline: "middle", lineBreak: false })
        doc.moveTo(70, distanciaAlto2 - 10)
            .lineTo(275, distanciaAlto2 - 10)
            .fill(colorGrisOscuro)

        doc.roundedRect(distanciaAncho2, distanciaAlto2, 134, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(134 + 11, distanciaAlto2, 134, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho2, containerSiguiente2(1), anchoContainer2, altoContainer2, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)
        doc.roundedRect(distanciaAncho2, containerSiguiente2(2), anchoContainer2, altoContainer2 * 1.5, borderRadius2).fillAndStroke(colorGrisClaro, colorGrisClaro)

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

        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica-Bold")
            .text("Observación:", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", lineBreak: false })
        doc.fontSize(tamañoFuente2 - 2)
            .font("Helvetica")
            .text(esDatoValido(observacion) ? cortarTexto(observacion, 140) : "Sin información", posicionAnchoTexto2, posicionAltoTexto2(2), { baseline: "middle", indent: 50, width: anchoContainer2 - 10 })
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
            doc.circle(posicionAnchoTexto3, distanciaAlto3 - 11, 2.5).fillAndStroke(colorGrisOscuro, colorGrisOscuro)
            doc.fontSize(tamañoFuente3)
                .font("Helvetica")
                .text("Campos extra", posicionAnchoTexto3 + 6, distanciaAlto3 - 10, { baseline: "middle", lineBreak: false })
            doc.moveTo(80, distanciaAlto3 - 10)
                .lineTo(275, distanciaAlto3 - 10)
                .fill(colorGrisOscuro)

            siguiente = 0
            await camposEspeciales.map((campo) => {
                if (siguiente < 5) {
                    let tamañoCE = tamañoSegunLargo(campo["nombre"] + campo["valor"], tamañoFuente3, 65)
                    doc.fontSize(tamañoCE)
                    let anchoTextoEsp = doc.widthOfString(campo["nombre"] ? cortarTexto(campo["nombre"], 25) + ":" : "CampoEsp:", { font: "Helvetica-Bold", size: tamañoCE })

                    doc.roundedRect(distanciaAncho3, containerSiguiente3(siguiente), anchoContainer3, altoContainer3, borderRadius3).fillAndStroke(colorGrisClaro, colorGrisClaro)

                    doc.fillAndStroke("black", "black")
                    doc.fontSize(tamañoCE)
                        .font("Helvetica-Bold")
                        .text(esDatoValido(campo["nombre"]) ? cortarTexto(campo["nombre"], 25) + ":" : "CampoEsp:", posicionAnchoTexto3, posicionAltoTexto3(siguiente), { baseline: "middle", lineBreak: false })

                    doc.fontSize(tamañoCE)
                        .font("Helvetica")
                        .text(esDatoValido(campo["valor"]) ? cortarTexto(campo["valor"], 50) : "Sin información", posicionAnchoTexto3 + anchoTextoEsp + 10, posicionAltoTexto3(siguiente), { baseline: "middle", lineBreak: false })
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

module.exports = e10x15CEP
