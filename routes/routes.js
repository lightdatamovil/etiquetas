const { Router } = require("express")
const { postEtiqueta, postEtiqueta2, getEtiqueta, testconexion } = require("../handlers/etiquetasHandler")
const postGuia = require("../handlers/guiaHandler")
const comprobacionEtiquetas = require("../handlers/comprobacion-etiquetas")

const router = Router()

router.post("/print/etiqueta", postEtiqueta)
router.post("/print/guia", postGuia)
router.get("/print/etiqueta", getEtiqueta)
router.get("/print/v1/:token/:didEmpresa/:didEnvio", comprobacionEtiquetas, postEtiqueta2)
router.get("/print/conexion/:didEmpresa", testconexion)

module.exports = router
