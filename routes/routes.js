const { Router } = require("express");
const { postEtiqueta, postEtiqueta2 } = require("../handlers/etiquetasHandler");
const postGuia = require("../handlers/guiaHandler");
const comprobacionEtiquetas = require("../handlers/comprobacion-etiquetas");

const router = Router();

router.post("/print/etiqueta", postEtiqueta);
router.post("/print/guia", postGuia);
router.get(
  "/print/comprobacion/:token/:didEmpresa/:didEnvio",
  comprobacionEtiquetas,
  postEtiqueta2
);

module.exports = router;
