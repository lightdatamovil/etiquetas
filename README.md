<img src="https://play-lh.googleusercontent.com/KOPrtPxDHM29ZdqD4yjFJ4ukIwcdO0PnGNOOECwCOyv1cRZLovQHFDVS6iZhDTAgGgth" alt="e_10x10FFP" width="200"/>

<br />

# **GENERADOR DE ETIQUETAS y GUÍAS DE DESPACHO PDF 2025** | 📚 Documentación

## **💬 DESCRIPCIÓN**

Este servidor esta encargado de gestionar etiquetas para los paquetes de los envios de logisticas. Las etiquetas cuentan con la informacion de esos envios, en las cuales tambien cuentan con el codigo QR para asignar por ejemplo. Tambien cuenta con las guías de despacho para logisticas de larga distancia, las cuales cuentan tambien con un codigo QR.

---

<br />

## **📃 TAMAÑOS**

Cuenta con 3 opciones de tamaños:

| Tamaño        | Codigo | Opciones        |
| :------------ | :----- | :-------------- |
| A4            | a4     | guía - etiqueta |
| 10 cm x 15 cm | 10x15  | etiqueta        |
| 10 cm x 10 cm | 10x10  | etiqueta        |

---

<br />

## **🗂️ VARIANTES ETIQUETAS**

Cuenta con 8 variantes para los tamaños 10x10 y 10x15:

| Variante                  | Contiene                               | Codigo |
| :------------------------ | :------------------------------------- | :----- |
| SOLO                      | info                                   | S      |
| SOLO PREMIUM              | info                                   | SP     |
| FULFILLMENT               | info + fulfillment                     | FF     |
| FULFILLMENT PREMIUM       | info + fulfillment                     | FFP    |
| CAMPOS ESPECIALES         | info + campos especiales               | CE     |
| CAMPOS ESPECIALES PREMIUM | info + campos especiales               | CEP    |
| AMBAS                     | info + campos especiales + fulfillment | A      |
| AMBAS PREMIUM             | info + campos especiales + fulfillment | AP     |

Y para A4 hay dos variantes que son la SIMPLE Y la PREMIUM, que contemplan las 4 variantes correspondientes cada una

---

<br />

## **🗂️ ¿QUE CONTIENEN LAS ETIQUETAS?**

| Variable            | Tipo de dato                                                 |
| :------------------ | :----------------------------------------------------------- |
| NOMBRE LOGISTICA    | `string`                                                     |
| LOGO                | `img`                                                        |
| LOCALIDAD           | `string`                                                     |
| FECHA               | `string`                                                     |
| NUMERO VENTA        | `number`                                                     |
| NUMERO ENVIO        | `number`                                                     |
| NOMBRE RECEPTOR     | `string`                                                     |
| TELEFONO RECEPTOR   | `string`                                                     |
| DIRECCION           | `string`                                                     |
| CP                  | `string`                                                     |
| OBSERVACIONES       | `string`                                                     |
| TOTAL A COBRAR      | `string`                                                     |
| PESO                | `string`                                                     |
| CODIGO QR           | `img`                                                        |
| CAMPOS ESPECIALES   | `array`                                                      |
| LISTADO FULFILLMENT | `array`                                                      |
| BULTOS              | `number` (Dependiendo la cantidad se replican las etiquetas) |

---

<br />

## **🗂️ VARIANTES GUÍA DE DESPACHO** (Por el momento no disponible)

Cuenta con 2 variantes (solo tamaño A4):

| Variante | Contiene                                                | Codigo |
| :------- | :------------------------------------------------------ | :----- |
| SIMPLE   | info de: remito, remitente, destinatario, listado, etc. | G      |
| PREMIUM  | info de: remito, remitente, destinatario, listado, etc. | GP     |

---

<br />

## **🖥️ INSTALACIÓN E INICIACIÓN**

Para instalar las dependencias ejecutar el siguiente comando en la consola

```http
  npm install
```

Para iniciar/levantar el servidor ejecutar el siguiente comando en la consola

```http
  npm start
```

---

<br />
<br />

## **📍 RUTA ETIQUETAS**

Una unica ruta para generar etiquetas cualquier etiqueta:

```http
  POST /etiqueta
```

<br />
<br />

Y debes pasarle por body un JSON con los siguientes datos:

| Key            | Value    | Descripción                                                                                                 |
| :------------- | :------- | :---------------------------------------------------------------------------------------------------------- |
| `didEmpresa`   | `number` | Did de la empresa que generara la etiqueta                                                                  |
| `didEnvios`    | `array`  | Dids de los envios que deseas generar su etiqueta, es un array con los numeros. <br> **Ejemplo: [1, 2, 3]** |
| `tipoEtiqueta` | `number` | Es un numero para elegir el tamaño de la etiqueta: <br/> **0 = 10x10 <br/> 1 = 10x15 <br/> 2 = A4**         |
| `calidad`      | `number` | Es un numero para elegir si la etiqueta es premium o no: <br/> **0 = Simple <br/> 1 = Premium**             |
| `quien`        | `number` | Did del usuario que generara las etiquetas                                                                  |

---

<br />
<br />

Ejemplo del JSON que recibe por body:

```JSON
{
	"didEmpresa" : 4,
	"didEnvios": [1,2,3],
	"tipoEtiqueta": 1,
	"calidad": 0,
	"quien": 1
}
```

---

<br />

## **📍 RUTA GUÍA DE DESPACHO** (Por el momento no disponible)

Una unica ruta para generar etiquetas cualquier etiqueta:

```http
  POST /guía
```

<br />
<br />

Y debes pasarle por body un JSON con los siguientes datos:

| Key          | Value    | Descripción                                                                                                 |
| :----------- | :------- | :---------------------------------------------------------------------------------------------------------- |
| `didEmpresa` | `number` | Did de la empresa que generara la guia                                                                      |
| `didEnvios`  | `array`  | Dids de los envios que deseas generar su etiqueta, es un array con los numeros. <br> **Ejemplo: [1, 2, 3]** |
| `calidad`    | `number` | Es un numero para elegir si la etiqueta es premium o no: <br/> **0 = Simple <br/> 1 = Premium**             |
| `quien`      | `number` | Did del usuario que generara las guias                                                                      |

---

<br />
<br />

Ejemplo del JSON que recibe por body:

```JSON
{
	"didEmpresa" : 4,
	"didEnvios": [1,2,3],
	"calidad": 0,
	"quien": 1
}
```

---

<br />

## **👨 AUTOR**

### **Agustin Scaramello**

<a href="https://github.com/AgustinScaramello">
	<img src="https://img.icons8.com/ios11/512/FFFFFF/github.png" alt="github" width="40">
</a>

## **LIGHTDATA®**
