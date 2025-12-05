const mysql = require("mysql");
const redis = require("redis");
require("dotenv").config();
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, FULFILLMENT_DB_HOST, FULFILLMENT_DB_USER_FOR_LOGS, FULFILLMENT_DB_PASSWORD_FOR_LOGS
  , FULFILLMENT_DB_NAME_FOR_LOGS, FULFILLMENT_DB_PORT
} = process.env


const redisClient = redis.createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
  password: REDIS_PASSWORD,
});

redisClient.on("error", (err) => {
  console.error("Error al conectar con Redis:", err);
});
(async () => {
  await redisClient.connect();
  console.log("Redis conectado");
})();

async function getConnection(idempresa) {
  try {
    console.log("idempresa recibido:", idempresa);

    // Validación del tipo de idempresa
    if (typeof idempresa !== "string" && typeof idempresa !== "number") {
      throw new Error(
        `idempresa debe ser un string o un número, pero es: ${typeof idempresa}`
      );
    }

    // Obtener las empresas desde Redis
    const redisKey = "empresasData";
    const empresasData = await getFromRedis(redisKey);
    if (!empresasData) {
      throw new Error(`No se encontraron datos de empresas en Redis.`);
    }

    // Buscar la empresa por su id
    const empresa = empresasData[String(idempresa)];
    if (!empresa) {
      throw new Error(
        `No se encontró la configuración de la empresa con ID: ${idempresa}`
      );
    }

    //console.log("Configuración de la empresa encontrada:", empresa);

    // Configurar la conexión a la base de datos
    const config = {
      host: "bhsmysql1.lightdata.com.ar", // Host fijo
      database: empresa.dbname, // Base de datos desde Redis
      user: empresa.dbuser, // Usuario desde Redis
      password: empresa.dbpass, // Contraseña desde Redis
    };

    console.log("Configuración de la conexión:", config);

    return mysql.createConnection(config);
  } catch (error) {
    console.error(`Error al obtener la conexión:`, error.message);

    // Lanza un error con una respuesta estándar
    throw {
      status: 500,
      response: {
        estado: false,

        error: -1,
      },
    };
  }
}

// Función para obtener datos desde Redis
async function getFromRedis(key) {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error obteniendo clave ${key} de Redis:`, error);
    throw {
      status: 500,
      response: {
        estado: false,

        error: -1,
      },
    };
  }
}

async function executeQuery(connection, query, values, log = false) {
  if (log) {
    logYellow(`Ejecutando query: ${query} con valores: ${values}`);
  }
  try {
    return new Promise((resolve, reject) => {
      connection.query(query, values, (err, results) => {
        if (err) {
          if (log) {
            logRed(`Error en executeQuery: ${err.message}`);
          }
          reject(err);
        } else {
          if (log) {
            logYellow(`Query ejecutado con éxito: ${JSON.stringify(results)}`);
          }
          resolve(results);
        }
      });
    });
  } catch (error) {
    log(`Error en executeQuery: ${error.message}`);
    throw error;
  }
}
async function getConnectionFF(idempresa) {
  try {



    if (typeof idempresa !== "string" && typeof idempresa !== "number") {
      throw new Error(
        `idempresa debe ser un string o un número, pero es: ${typeof idempresa}`
      );
    }

    const config = {
      host: FULFILLMENT_DB_HOST,
      user: `ue${idempresa}`,
      password: `78451296_${idempresa}`,
      database: `empresa_${idempresa}`,
      port: FULFILLMENT_DB_PORT,
    };



    console.log("Configuración de la conexión:", config);

    return mysql.createConnection(config);
  } catch (error) {
    console.error(`Error al obtener la conexión:`, error.message);

    // Lanza un error con una respuesta estándar
    throw {
      status: 500,
      response: {
        estado: false,

        error: -1,
      },
    };
  }
}

module.exports = { getConnection, getFromRedis, redisClient, executeQuery, getConnectionFF };
