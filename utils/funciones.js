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

function tamañoSegunLargo(texto, tamaño, maximo) {
    if (esDatoValido(texto) && texto.length > maximo) {
        tamaño -= 2
    }

    return tamaño
}

function primeraLetraMayuscula(logistica) {
    return logistica.charAt(0).toUpperCase() + logistica.slice(1)
}

function cambiarACaba(texto) {
    if (esDatoValido(texto)) {
        textoMinusculas = texto.toLowerCase()

        if (textoMinusculas == "ciudad autonoma de buenos aires" || textoMinusculas == "ciudad autonoma buenos aires" || textoMinusculas == "ciudad de buenos aires") {
            return "CABA"
        } else {
            return texto
        }
    }
}

module.exports = { esDatoValido, convertirFecha, cortarTexto, tamañoSegunLargo, primeraLetraMayuscula, cambiarACaba }
