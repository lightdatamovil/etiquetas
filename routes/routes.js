const { Router } = require("express")
const postEtiqueta = require("../handlers/etiquetasHandler")
const postGuia = require("../handlers/guiaHandler")

const router = Router()

router.post("/print/etiqueta", postEtiqueta)
router.post("/print/guia", postGuia)

module.exports = router
