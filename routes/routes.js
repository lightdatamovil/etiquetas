const { Router } = require("express")
const postEtiqueta = require("../handlers/etiquetasHandler")
const postGuia = require("../handlers/guiaHandler")

const router = Router()

router.post("/etiqueta", postEtiqueta)
router.post("/guia", postGuia)

module.exports = router
