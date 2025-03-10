const QRCode = require("qrcode")
const SVGtoPDF = require("svg-to-pdfkit")

const { esDatoValido, cortarTexto, tamañoSegunLargo } = require("../../utils/funciones.js")
const { colorGrisClaro, colorGrisOscuro } = require("../../utils/colores.js")
const { flechaGuia } = require("../../utils/icons.js")

//! GUIA A4 PREMIUM--------------------------------------------------------------
const ga4 = async (doc, objData, distanciaAlto) => {
    let { nombreFantasia, logo, qr, numeroRem, fecha, facturaTipo, codigo, desde, hacia, remitente, destinatario, condicionVenta, operador, bultos, descripcion, peso, codPrecio, valor, obsevacion, ultimosDatos, listado, total } = objData

    distanciaAncho = 10
    anchoTotalPagina = 595
    altoContainer = 30
    marginContainer = 6
    tamañoFuente = 6

    doc.fillAndStroke("black", "black")

    // ! LOGO --------------------------------
    if (esDatoValido(logo)) {
        const response = await fetch(logo)
        const imageBuffer = await response.arrayBuffer()
        doc.image(Buffer.from(imageBuffer), distanciaAncho, distanciaAlto, { fit: [60, 60], baseline: "middle" })
    }
    // ! /LOGO --------------------------------

    // ! NOMBRE LOGISTICA --------------------------------¿
    doc.fontSize(25)
        .font("Helvetica-BoldOblique")
        .text(esDatoValido(nombreFantasia) ? nombreFantasia : "Sin información", distanciaAncho + 70, distanciaAlto)
    doc.fontSize(25)
        .font("Helvetica-BoldOblique")
        .text("Pack", distanciaAncho + 70, distanciaAlto + 25)

    doc.fontSize(9)
        .font("Helvetica")
        .text("LOGISTICA", distanciaAncho + 135, distanciaAlto + 25)
    doc.fontSize(9)
        .font("Helvetica")
        .text("PROFERSIONAL", distanciaAncho + 135, distanciaAlto + 35)
    // ! /NOMBRE LOGISTICA --------------------------------

    // ! TIPO DE FACTURA -----------------------------------
    distanciaAnchoTDF = distanciaAncho + 230

    doc.roundedRect(distanciaAnchoTDF, distanciaAlto, 30, 40, 5).stroke(colorGrisOscuro)
    doc.fontSize(25)
        .font("Helvetica-Bold")
        .text(esDatoValido(facturaTipo) ? facturaTipo : "Sin información", distanciaAnchoTDF + 6, distanciaAlto + 4)
    doc.fontSize(6)
        .font("Helvetica")
        .text("Código", distanciaAnchoTDF + 6, distanciaAlto + 24)
    doc.fontSize(6)
        .font("Helvetica")
        .text(esDatoValido(codigo) ? `N°${codigo}` : "Sin información", distanciaAnchoTDF + 9, distanciaAlto + 31)
    doc.fontSize(7)
        .font("Helvetica")
        .text("ORIGINAL", distanciaAnchoTDF - 1, distanciaAlto + 44)
    // ! /TIPO DE FACTURA -----------------------------------

    // ! INFO DE FACTURACION -------------------------------------
    distanciaAnchoIDF = distanciaAncho + 270
    const distanciaRenglonIDF = (por) => distanciaAlto + 8 * por

    doc.fontSize(6).font("Helvetica").text("CRUCERO DEL SUR SRL", distanciaAnchoIDF, distanciaAlto)
    doc.fontSize(6).font("Helvetica").text("C.U.I.T. N° 30707812822", distanciaAnchoIDF, distanciaRenglonIDF(1))
    doc.fontSize(6).font("Helvetica").text("I. Brutos: CM 914-532269", distanciaAnchoIDF, distanciaRenglonIDF(2))
    doc.fontSize(6).font("Helvetica").text("I. Actividades: 16/11/24", distanciaAnchoIDF, distanciaRenglonIDF(3))
    doc.fontSize(6).font("Helvetica").text("IVA RESPONSABLE INSCRIPTO", distanciaAnchoIDF, distanciaRenglonIDF(4))
    doc.fontSize(6).font("Helvetica").text("RNPSP N° 864", distanciaAnchoIDF, distanciaRenglonIDF(5))

    // ! /INFO DE FACTURACION -------------------------------------

    // ! CODIGO QR --------------------------------
    if (esDatoValido(qr)) {
        // qr = JSON.stringify(qr)
        let codigoQR = await new Promise((resolve, reject) => {
            QRCode.toBuffer(qr, { type: "png" }, (err, buffer) => {
                if (err) reject(err)
                resolve(buffer)
            })
        })
        doc.image(codigoQR, distanciaAncho + 375, distanciaAlto - 5, { height: 47 })
    } else {
        qr = "Sin código QR"
        doc.fontSize(6)
            .font("Helvetica")
            .text(qr, distanciaAncho + 375, distanciaAlto)
    }

    doc.fontSize(9)
        .font("Helvetica")
        .text("DOCUMENTO NO VALIDO COMO FACTURA", distanciaAncho + 378, distanciaAlto + 45, { lineBreak: false })

    // ! /CODIGO QR --------------------------------

    // ! NUMERO DE REMITO Y FECHA --------------------------------
    doc.fontSize(8)
        .font("Helvetica-Bold")
        .text("Remito N°:", anchoTotalPagina - 120, distanciaAlto, { lineBreak: false })
    doc.fontSize(8)
        .font("Helvetica")
        .text(esDatoValido(numeroRem) ? numeroRem : "Sin información", anchoTotalPagina - 75, distanciaAlto, { width: 55, align: "right" })

    doc.fontSize(8)
        .font("Helvetica-Bold")
        .text("Fecha:", anchoTotalPagina - 90, distanciaAlto + 20, { lineBreak: false })
    doc.fontSize(8)
        .font("Helvetica")
        .text(esDatoValido(fecha) ? fecha : "Sin información", anchoTotalPagina - 105, distanciaAlto + 20, { width: 85, align: "right" })
    // ! /NUMERO DE REMITO Y FECHA --------------------------------

    // ! DESDE -------------------------------------------------------
    distanciaAltoDesde = distanciaAlto + 60
    anchoContainerDesde = anchoTotalPagina / 2 - 13
    altoContainerDesde = altoContainer
    distanciaAnchoTextoDesde = distanciaAncho + 7
    const distanciaAltoTextoDesde = (num) => distanciaAltoDesde + 10 * num

    doc.roundedRect(distanciaAncho, distanciaAltoDesde, anchoContainerDesde, altoContainerDesde, 5).fillAndStroke("white", colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Localidad origen:", distanciaAnchoTextoDesde, distanciaAltoTextoDesde(1), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(desde["localidad"]) ? desde["localidad"] : "Sin información", distanciaAnchoTextoDesde + 52, distanciaAltoTextoDesde(1), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Direccion:", distanciaAnchoTextoDesde, distanciaAltoTextoDesde(2), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(desde["direccion"]) ? desde["direccion"] : "Sin información", distanciaAnchoTextoDesde + 32, distanciaAltoTextoDesde(2), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente)
        .font("Helvetica-Bold")
        .text(esDatoValido(desde["donde"]) ? `Se envió DESDE ${desde["donde"]}` : "", anchoContainerDesde - 85, distanciaAltoTextoDesde(1), { baseline: "middle", width: 90, align: "right" })

    // ! /DESDE -------------------------------------------------------

    // ! REMITENTE -------------------------------------------------------
    distanciaAltoRem = distanciaAltoDesde + altoContainerDesde + marginContainer
    altoContainerRem = altoContainer + 30
    distanciaAnchoTextoRem = distanciaAnchoTextoDesde
    const distanciaAltoTextoRem = (num) => distanciaAltoRem + 10 * num

    doc.roundedRect(distanciaAncho, distanciaAltoRem, anchoContainerDesde, altoContainerRem, 5).fillAndStroke("white", colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Remitente:", distanciaAnchoTextoRem, distanciaAltoTextoRem(1), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(remitente["nombre"]) ? remitente["nombre"] : "Sin información", distanciaAnchoTextoRem + 34, distanciaAltoTextoRem(1), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Dirección:", distanciaAnchoTextoRem, distanciaAltoTextoRem(2), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(remitente["direccion"]) ? remitente["direccion"] : "Sin información", distanciaAnchoTextoRem + 32, distanciaAltoTextoRem(2), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Localidad:", distanciaAnchoTextoRem, distanciaAltoTextoRem(3), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(remitente["localidad"]) ? remitente["localidad"] : "Sin información", distanciaAnchoTextoRem + 32, distanciaAltoTextoRem(3), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Telefono:", distanciaAnchoTextoRem, distanciaAltoTextoRem(4), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(remitente["telefono"]) ? remitente["telefono"] : "Sin información", distanciaAnchoTextoRem + 28, distanciaAltoTextoRem(4), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Tipo IVA:", distanciaAnchoTextoRem, distanciaAltoTextoRem(5), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(remitente["iva"]) ? remitente["iva"] : "Sin información", distanciaAnchoTextoRem + 28, distanciaAltoTextoRem(5), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente)
        .font("Helvetica-Bold")
        .text(esDatoValido(remitente["cuit"]) ? `Identif.: CUIT ${remitente["cuit"]}` : "", anchoContainerDesde - 85, distanciaAltoTextoRem(5), { baseline: "middle", width: 90, align: "right" })
    // ! /REMITENTE--------------------------------------------------------

    // ! HACIA--------------------------------------------------------
    distanciaAnchoTextoHasta = anchoTotalPagina / 2 + distanciaAncho - 6 + 7
    const distanciaAltoTextoHasta = (num) => distanciaAltoDesde + 10 * num

    doc.roundedRect(anchoTotalPagina / 2 + distanciaAncho - 6, distanciaAltoDesde, anchoContainerDesde, altoContainerDesde, 5).fillAndStroke("white", colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Localidad origen:", distanciaAnchoTextoHasta, distanciaAltoTextoHasta(1), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(hacia["localidad"]) ? hacia["localidad"] : "Sin información", distanciaAnchoTextoHasta + 52, distanciaAltoTextoHasta(1), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Direccion:", distanciaAnchoTextoHasta, distanciaAltoTextoHasta(2), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(hacia["direccion"]) ? hacia["direccion"] : "Sin información", distanciaAnchoTextoHasta + 32, distanciaAltoTextoHasta(2), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente)
        .font("Helvetica-Bold")
        .text(esDatoValido(hacia["donde"]) ? `Se envió A ${hacia["donde"]}` : "", anchoContainerDesde * 2 - 79, distanciaAltoTextoDesde(1), { baseline: "middle", width: 90, align: "right" })

    // ! /HACIA--------------------------------------------------------

    // ! DESTINATARIO--------------------------------------------------------
    distanciaAnchoTextoDes = anchoTotalPagina / 2 + distanciaAncho - 6 + 7
    const distanciaAltoTextoDes = (num) => distanciaAltoRem + 10 * num

    doc.roundedRect(anchoTotalPagina / 2 + distanciaAncho - 6, distanciaAltoRem, anchoContainerDesde, altoContainerRem, 5).fillAndStroke("white", colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Remitente:", distanciaAnchoTextoDes, distanciaAltoTextoDes(1), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(destinatario["nombre"]) ? destinatario["nombre"] : "Sin información", distanciaAnchoTextoDes + 34, distanciaAltoTextoDes(1), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Dirección:", distanciaAnchoTextoDes, distanciaAltoTextoDes(2), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(destinatario["direccion"]) ? destinatario["direccion"] : "Sin información", distanciaAnchoTextoDes + 32, distanciaAltoTextoDes(2), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Localidad:", distanciaAnchoTextoDes, distanciaAltoTextoDes(3), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(destinatario["localidad"]) ? destinatario["localidad"] : "Sin información", distanciaAnchoTextoDes + 32, distanciaAltoTextoDes(3), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Telefono:", distanciaAnchoTextoDes, distanciaAltoTextoDes(4), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(destinatario["telefono"]) ? destinatario["telefono"] : "Sin información", distanciaAnchoTextoDes + 28, distanciaAltoTextoDes(4), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Tipo IVA:", distanciaAnchoTextoDes, distanciaAltoTextoDes(5), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(destinatario["iva"]) ? destinatario["iva"] : "Sin información", distanciaAnchoTextoDes + 28, distanciaAltoTextoDes(5), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente)
        .font("Helvetica-Bold")
        .text(esDatoValido(destinatario["cuit"]) ? `Identif.: CUIT ${destinatario["cuit"]}` : "", anchoContainerDesde * 2 - 79, distanciaAltoTextoRem(5), { baseline: "middle", width: 90, align: "right" })

    // ! /DESTINATARIO--------------------------------------------------------

    SVGtoPDF(doc, flechaGuia, anchoContainerDesde + marginContainer, distanciaAltoDesde + altoContainerDesde / 2 - 6)
    SVGtoPDF(doc, flechaGuia, anchoContainerDesde + marginContainer, distanciaAltoDesde + altoContainerDesde + altoContainerRem / 2)

    // ! CONDICION DE VENTA--------------------------------------------------------
    distanciaAltoCDV = distanciaAltoRem + altoContainerRem + marginContainer
    anchoContainerCDV = anchoTotalPagina / 2 + 50
    altoContainerCDV = altoContainer - 13
    distanciaAnchoTextoCDV = distanciaAncho + 7
    const distanciaAltoTextoCDV = (num) => distanciaAltoCDV + 10 * num

    doc.roundedRect(distanciaAncho, distanciaAltoCDV, anchoContainerCDV, altoContainerCDV, 5).fillAndStroke("white", colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Condición de venta:", distanciaAnchoTextoCDV, distanciaAltoTextoCDV(1), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(condicionVenta) ? condicionVenta : "Sin información", distanciaAnchoTextoCDV + 59, distanciaAltoTextoCDV(1), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(operador) ? `Operador ${operador}` : "", anchoContainerCDV - 165, distanciaAltoTextoCDV(1), { baseline: "middle", width: 170, align: "right" })

    // ! /CONDICION DE VENTA--------------------------------------------------------

    //! BULTOS--------------------------------------------------------------
    distanciaAltoBultos = distanciaAltoCDV + altoContainerCDV + marginContainer
    anchoContainerBultos = anchoContainerCDV
    altoContainerBultos = altoContainer + 20
    distanciaAnchoTextoBultos = distanciaAncho + 7
    const distanciaAltoTextoBultos = (num) => distanciaAltoBultos + 15 * num
    distanciaAnchoBultos1 = distanciaAncho + 40
    distanciaAnchoBultos2 = distanciaAncho + 190
    distanciaAnchoBultos3 = distanciaAncho + 230
    distanciaAnchoBultos4 = distanciaAncho + 290

    doc.roundedRect(distanciaAncho, distanciaAltoBultos, anchoContainerBultos, altoContainerBultos, 5).fillAndStroke("white", colorGrisOscuro)

    doc.fillAndStroke(colorGrisOscuro, colorGrisOscuro)

    doc.moveTo(distanciaAncho, distanciaAltoBultos + altoContainerBultos / 2)
        .lineTo(anchoContainerBultos + 10, distanciaAltoBultos + altoContainerBultos / 2)
        .stroke()
        .fill(colorGrisOscuro)

    doc.moveTo(distanciaAnchoBultos1, distanciaAltoBultos)
        .lineTo(distanciaAnchoBultos1, distanciaAltoBultos + altoContainerBultos)
        .stroke()
        .fill(colorGrisOscuro)

    doc.moveTo(distanciaAnchoBultos2, distanciaAltoBultos)
        .lineTo(distanciaAnchoBultos2, distanciaAltoBultos + altoContainerBultos)
        .stroke()
        .fill(colorGrisOscuro)

    doc.moveTo(distanciaAnchoBultos3, distanciaAltoBultos)
        .lineTo(distanciaAnchoBultos3, distanciaAltoBultos + altoContainerBultos)
        .stroke()
        .fill(colorGrisOscuro)

    doc.moveTo(distanciaAnchoBultos4, distanciaAltoBultos)
        .lineTo(distanciaAnchoBultos4, distanciaAltoBultos + altoContainerBultos)
        .stroke()
        .fill(colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("Bultos", distanciaAnchoTextoBultos, distanciaAltoTextoBultos(1), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(bultos) ? bultos : "-", distanciaAnchoTextoBultos, distanciaAltoTextoBultos(2.5), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente)
        .font("Helvetica-Bold")
        .text("Descripción", distanciaAnchoBultos1 + 7, distanciaAltoTextoBultos(1), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(descripcion) ? descripcion : "Sin información", distanciaAnchoBultos1 + 7, distanciaAltoTextoBultos(2.5), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente)
        .font("Helvetica-Bold")
        .text("Peso/Aforo", distanciaAnchoBultos2 + 7, distanciaAltoTextoBultos(1) - 5, { baseline: "middle", width: 20 })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(peso) ? peso : "-", distanciaAnchoBultos2 + 7, distanciaAltoTextoBultos(2.5), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente)
        .font("Helvetica-Bold")
        .text("Cod. precio a cobrar", distanciaAnchoBultos3 + 7, distanciaAltoTextoBultos(1) - 5, { baseline: "middle", width: 40 })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(codPrecio) ? codPrecio : "-", distanciaAnchoBultos3 + 7, distanciaAltoTextoBultos(2.5), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente)
        .font("Helvetica-Bold")
        .text("Valor declarado", distanciaAnchoBultos4 + 7, distanciaAltoTextoBultos(1), { baseline: "middle", lineBreak: false })
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(valor) ? valor : "-", distanciaAnchoBultos4 + 7, distanciaAltoTextoBultos(2.5), { baseline: "middle", lineBreak: false })

    //! /BULTOS--------------------------------------------------------------

    //! FIRMA REMITENTE--------------------------------------------------------------
    distanciaAltoFirmas = distanciaAltoBultos + altoContainerBultos + marginContainer
    anchoContainerFirmas = anchoContainerBultos / 2 - marginContainer + 3
    altoContainerFirmas = altoContainer + 42
    distanciaAnchoFirmas = distanciaAncho + anchoContainerFirmas + marginContainer
    distanciaAnchoTextoFirmas = distanciaAncho + 7
    distanciaAnchoTextoFirmasDes = distanciaAnchoFirmas + 7
    const distanciaAltoTextoFirmas = (num) => distanciaAltoFirmas + 10 * num

    doc.roundedRect(distanciaAncho, distanciaAltoFirmas, anchoContainerFirmas, altoContainerFirmas, 5).fillAndStroke("white", colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("REMITENTE:", distanciaAnchoTextoFirmas, distanciaAltoTextoFirmas(1), { baseline: "middle", lineBreak: false })

    doc.moveTo(distanciaAnchoTextoFirmas, distanciaAltoFirmas + altoContainerFirmas - 15)
        .lineTo(anchoContainerFirmas / 2, distanciaAltoFirmas + altoContainerFirmas - 15)
        .lineWidth(0)
        .stroke()
        .fill("black")

    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text("Documento", distanciaAnchoTextoFirmas + 20, distanciaAltoFirmas + altoContainerFirmas - 10, { baseline: "middle", lineBreak: false })

    doc.fillAndStroke("black", "black")

    doc.moveTo(anchoContainerFirmas / 2 + 10, distanciaAltoFirmas + altoContainerFirmas - 15)
        .lineTo(anchoContainerFirmas, distanciaAltoFirmas + altoContainerFirmas - 15)
        .lineWidth(0)
        .stroke()
        .fill("black")

    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text("Firma", anchoContainerFirmas / 2 + 10 + 30, distanciaAltoFirmas + altoContainerFirmas - 10, { baseline: "middle", lineBreak: false })
    //! FIRMA REMITENTE--------------------------------------------------------------

    //! FIRMA DESTINATARIO--------------------------------------------------------------
    doc.roundedRect(distanciaAnchoFirmas, distanciaAltoFirmas, anchoContainerFirmas, altoContainerFirmas, 5).fillAndStroke("white", colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("DESTINATARIO:", distanciaAnchoTextoFirmasDes, distanciaAltoTextoFirmas(1), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente - 1)
        .font("Helvetica")
        .text("Fecha de entrega", distanciaAnchoTextoFirmasDes, distanciaAltoFirmas + 25, { baseline: "alphabetic", lineBreak: false })

    doc.moveTo(distanciaAnchoTextoFirmasDes + 40, distanciaAltoFirmas + 25)
        .lineTo(anchoContainerFirmas * 2 - 70, distanciaAltoFirmas + 25)
        .lineWidth(0)
        .stroke()
        .fill("black")

    doc.fontSize(tamañoFuente - 1)
        .font("Helvetica")
        .text("Entregó", distanciaAnchoTextoFirmasDes + 80, distanciaAltoFirmas + 25, { baseline: "alphabetic", lineBreak: false })

    doc.moveTo(distanciaAnchoTextoFirmasDes + 40 + 59, distanciaAltoFirmas + 25)
        .lineTo(anchoContainerFirmas * 2 + 10, distanciaAltoFirmas + 25)
        .lineWidth(0)
        .stroke()
        .fill("black")

    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text("RECIBÍ CONFORME (Firma, aclaración y documento)", distanciaAnchoTextoFirmasDes, distanciaAltoFirmas + altoContainerFirmas - 7, { baseline: "middle", lineBreak: false })

    //! /FIRMA DESTINATARIO--------------------------------------------------------------

    //! OBSERVACIONES--------------------------------------------------------------
    distanciaAltoObs = distanciaAltoFirmas + altoContainerFirmas + marginContainer
    altoContainerObs = altoContainer + 20
    anchoContainerObs = anchoContainerBultos
    distanciaAnchoTextoObs = distanciaAncho + 7
    const distanciaAltoTextoObs = (num) => distanciaAltoObs + 10 * num

    doc.roundedRect(distanciaAncho, distanciaAltoObs, anchoContainerObs, altoContainerObs, 5).fillAndStroke("white", colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("OBSERVACIONES:", distanciaAnchoTextoObs, distanciaAltoTextoObs(1), { baseline: "middle", lineBreak: false })

    // ! EL PROBLEMA ESTA DE AQUI PARA ABAJO

    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(obsevacion) ? obsevacion : "", distanciaAnchoTextoObs, distanciaAltoTextoObs(2), { baseline: "middle", width: anchoContainerObs - 10 })

    doc.fontSize(tamañoFuente)
        .font("Helvetica-Bold")
        .text(esDatoValido(facturaTipo) && esDatoValido(numeroRem) ? `Remito N° ${facturaTipo}-${numeroRem}` : "", anchoContainerObs - 165, distanciaAltoTextoObs(1), { baseline: "middle", width: 170, align: "right" })

    //! /OBSERVACIONES--------------------------------------------------------------

    //! ULTIMOS DATOS--------------------------------------------------------------
    doc.fontSize(tamañoFuente)
        .font("Helvetica")
        .text(esDatoValido(ultimosDatos) ? ultimosDatos : "", distanciaAnchoTextoObs, distanciaAltoTextoObs(6), { baseline: "middle", width: anchoContainerObs - 10 })
    //! /ULTIMOS DATOS--------------------------------------------------------------

    //! LISTADO--------------------------------------------------------------
    distanciaAnchoListado = distanciaAncho + anchoContainerCDV + marginContainer
    distanciaAltoListado = distanciaAltoCDV
    anchoContainerListado = anchoTotalPagina - anchoContainerCDV - marginContainer - distanciaAncho - distanciaAncho
    altoContainerListado = altoContainerCDV + altoContainerBultos + altoContainerFirmas + altoContainerObs + marginContainer * 3 + 30
    distanciaAnchoTextoListado = distanciaAnchoListado + 7
    const distanciaAltoTextoListado = (num) => distanciaAltoListado + 10 * num

    doc.roundedRect(distanciaAnchoListado, distanciaAltoListado, anchoContainerListado, altoContainerListado, 5).fillAndStroke("white", colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    doc.fontSize(tamañoFuente).font("Helvetica-Bold").text("CONCEPTO", distanciaAnchoTextoListado, distanciaAltoTextoListado(1), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente)
        .font("Helvetica-Bold")
        .text("IMPORTE", distanciaAnchoTextoListado + 20 + anchoContainerListado / 2, distanciaAltoTextoListado(1), { baseline: "middle", lineBreak: false })

    doc.fillAndStroke(colorGrisOscuro, colorGrisOscuro)
    doc.moveTo(distanciaAnchoListado, distanciaAltoListado + altoContainerCDV)
        .lineTo(distanciaAnchoListado + anchoContainerListado, distanciaAltoListado + altoContainerCDV)
        .stroke()
        .fill(colorGrisOscuro)

    doc.moveTo(distanciaAnchoListado + 20 + anchoContainerListado / 2, distanciaAltoListado)
        .lineTo(distanciaAnchoListado + 20 + anchoContainerListado / 2, distanciaAltoListado + altoContainerListado)
        .stroke()
        .fill(colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    indexListado = 3
    listado.map((dato) => {
        doc.fontSize(tamañoFuente + 1)
            .font("Helvetica")
            .text(esDatoValido(dato["concepto"]) ? dato["concepto"] : "-", distanciaAnchoTextoListado, distanciaAltoTextoListado(indexListado), { baseline: "middle", lineBreak: false })

        doc.fontSize(tamañoFuente + 1)
            .font("Helvetica")
            .text(esDatoValido(dato["importe"]) ? `$${dato["importe"]}` : "-", distanciaAnchoTextoListado + 20 + anchoContainerListado / 2, distanciaAltoTextoListado(indexListado), { baseline: "middle", lineBreak: false })

        indexListado++
    })

    doc.fillAndStroke(colorGrisOscuro, colorGrisOscuro)

    doc.moveTo(distanciaAnchoListado, distanciaAltoObs + altoContainerObs)
        .lineTo(distanciaAnchoListado + anchoContainerListado, distanciaAltoObs + altoContainerObs)
        .stroke()
        .fill(colorGrisOscuro)

    doc.fillAndStroke("black", "black")

    doc.fontSize(tamañoFuente + 2)
        .font("Helvetica")
        .text("TOTAL", distanciaAnchoTextoListado, distanciaAltoTextoListado(22.5), { baseline: "middle", lineBreak: false })

    doc.fontSize(tamañoFuente + 2)
        .font("Helvetica")
        .text(esDatoValido(total) ? `$${total}` : "----", distanciaAnchoTextoListado + 20 + anchoContainerListado / 2, distanciaAltoTextoListado(22.5), { baseline: "middle", lineBreak: false })

    //! /LISTADO--------------------------------------------------------------
}

module.exports = ga4
