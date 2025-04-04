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

function combinarArrays(camposEspeciales, camposCobranzas, camposLogi) {
    const nuevoArray = []

    // Función para agregar elementos asegurando que no exceda 6
    const agregarElementos = (arr) => {
        for (let i = 0; i < 2 && nuevoArray.length < 6; i++) {
            if (arr[i] !== undefined) {
                nuevoArray.push(arr[i])
            }
        }
    }

    // Agregar hasta 2 elementos de cada array
    agregarElementos(camposEspeciales)
    agregarElementos(camposCobranzas)
    agregarElementos(camposLogi)

    // Si faltan elementos, agregar sobrantes hasta completar 6
    const sobrantes = [...camposEspeciales, ...camposCobranzas, ...camposLogi].filter((el) => !nuevoArray.includes(el))

    while (nuevoArray.length < 6 && sobrantes.length > 0) {
        nuevoArray.push(sobrantes.shift())
    }

    return nuevoArray // No se rellena con null, simplemente devuelve lo que haya
}

module.exports = { esDatoValido, convertirFecha, cortarTexto, tamañoSegunLargo, primeraLetraMayuscula, cambiarACaba, combinarArrays }
