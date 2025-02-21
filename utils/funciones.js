function esDatoValido(dato) {
    return dato && dato !== null && dato !== undefined && dato !== ""
}

function convertirFecha(newFecha) {
    let date = new Date(newFecha)
    return date.toLocaleDateString("es-ES")
}

function cortarTexto(texto, caracteres) {
    return texto.length > caracteres ? texto.slice(0, caracteres) + "..." : texto
}

module.exports = { esDatoValido, convertirFecha, cortarTexto }
