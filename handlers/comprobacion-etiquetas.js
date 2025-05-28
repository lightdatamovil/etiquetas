const { executeQuery, getConnection } = require("../dbconfig");
const { postEtiqueta2 } = require("./etiquetasHandler");

async function comprobacionEtiquetas(req, res) {
  const { token, didEmpresa, didEnvio } = req.params;

  if (token.length !== 128) {
    return res.status(400).json({ error: "Token no valido" });
  }

  const connection = await getConnection(didEmpresa);
  try {
    const queryToken =
      "SELECT did FROM clientes WHERE token_api_ext = ? and superado = 0 and elim = 0";
    const result = await executeQuery(connection, queryToken, [token]);
    console.log(result);

    const didCliente = result[0].did;

    if (result.length === 0) {
      return res.status(404).json({
        error:
          "No se encontraron datos para la empresa o envio proporcionados.",
      });
    }
    const checkEnvio =
      "SELECT did From envios where did = ? and didCliente = ? and superado = 0 and elim = 0";
    const result2 = await executeQuery(connection, checkEnvio, [
      didEnvio,
      didCliente,
    ]);
    if (result2.length === 0) {
      return res
        .status(404)
        .json({ error: "Este envio no pertenece a este cliente." });
    }
    const resulta2 = await postEtiqueta2(req, res);
    // console.log(resulta2);

    // return res.status(200).json({ message: "Etiqueta encontrada" });

    //  return res.status(200).json({ message: "Etiqueta encontrada" });
  } catch (error) {
    console.error("Error en comprobacionEtiquetas:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    connection.end();
  }
}

module.exports = comprobacionEtiquetas;
