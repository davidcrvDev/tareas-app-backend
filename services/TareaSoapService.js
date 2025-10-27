const soap = require("soap");
const db = require("../config/db");

// ====================================================================
// 1. CORRECCIÓN CRÍTICA: Definir PUBLIC_HOST y PUBLIC_PATH al inicio
// ====================================================================

// Usamos la URL de Render si está disponible, sino localhost para desarrollo
const PUBLIC_HOST =
  process.env.BACKEND_API_URL || `http://localhost:${process.env.PORT || 4000}`;
const SOAP_PATH = "/soap"; // Definimos el path de forma consistente

// El WSDL (Web Services Description Language) define la interfaz del servicio.
// Aquí se define un WSDL minimalista que describe la función del informe.
const wsdl = `
<definitions name="TareaService" 
    targetNamespace="http://www.tudominio.com/tareas"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:tns="http://www.tudominio.com/tareas"
    xmlns="http://schemas.xmlsoap.org/wsdl/">
    <types>
        <xsd:schema targetNamespace="http://www.tudominio.com/tareas">
            <xsd:element name="ObtenerReporteTareasResponse">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="xmlReporte" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
            <xsd:element name="ObtenerReporteTareasRequest">
                <xsd:complexType/>
            </xsd:element>
        </xsd:schema>
    </types>
    <message name="ObtenerReporteTareasRequest">
        <part name="parameters" element="tns:ObtenerReporteTareasRequest"/>
    </message>
    <message name="ObtenerReporteTareasResponse">
        <part name="parameters" element="tns:ObtenerReporteTareasResponse"/>
    </message>
    <portType name="TareaPort">
        <operation name="ObtenerReporteTareas">
            <input message="tns:ObtenerReporteTareasRequest"/>
            <output message="tns:ObtenerReporteTareasResponse"/>
        </operation>
    </portType>
    <binding name="TareaBinding" type="tns:TareaPort">
        <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
        <operation name="ObtenerReporteTareas">
            <soap:operation soapAction="urn:ObtenerReporteTareas" style="document"/>
            <input>
                <soap:body use="literal"/>
            </input>
            <output>
                <soap:body use="literal"/>
            </output>
        </operation>
    </binding>
    <service name="TareaService">
        <port name="TareaPort" binding="tns:TareaBinding">
            <soap:address location="${PUBLIC_HOST}${SOAP_PATH}"/> 
        </port>
    </service>
</definitions>
`;

// Implementación de la Lógica del Servicio SOAP
const service = {
  // ... (el resto de la implementación de service es la misma y está correcta)
  TareaService: {
    TareaPort: {
      ObtenerReporteTareas: async (args, callback) => {
        // ... (lógica interna del servicio SOAP)

        try {
          // 1. Obtener todas las tareas
          const result = await db.query("SELECT completada FROM tareas");
          const tareas = result.rows;
          const totalTareas = tareas.length;
          const tareasCompletadas = tareas.filter((t) => t.completada).length;

          // 2. Calcular el porcentaje
          const porcentajeCompletado =
            totalTareas > 0 ? (tareasCompletadas / totalTareas) * 100 : 0;

          // 3. Construir el XML de Reporte (¡Asegurando formato y datos!)
          const xmlReporte = `
<reporte>
    <fechaGeneracion>${new Date().toISOString()}</fechaGeneracion>
    <estadisticas>
        <totalTareas>${totalTareas}</totalTareas>
        <tareasCompletadas>${tareasCompletadas}</tareasCompletadas>
        <porcentajeCompletado>${porcentajeCompletado.toFixed(
          2
        )}%</porcentajeCompletado>
    </estadisticas>
    <tareas>
        ${tareas
          .map(
            (t) =>
              `<tarea estado="${t.completada ? "Completada" : "Pendiente"}"/>`
          )
          .join("")}
    </tareas>
</reporte>`.trim();

          // Devolver la respuesta SOAP con el XML dentro
          return { xmlReporte: xmlReporte };
        } catch (error) {
          console.error(
            "❌ ERROR CRÍTICO en servicio SOAP (BD/Lógica):",
            error.message
          );

          throw {
            Fault: {
              faultcode: "soap:Server",
              faultstring:
                "Error al procesar el reporte de tareas. Verifique la conexión a la base de datos.",
              detail: error.message,
            },
          };
        }
      },
    },
  },
};

/**
 * Inicializa el servicio SOAP
 * @param {object} app - Instancia de Express
 * @param {string} path - Ruta donde se montará el servicio (ej: /soap)
 */
exports.init = (app, path) => {
  // Nota: Eliminamos la re-declaración de PUBLIC_HOST de aquí,
  // ya que ahora se define globalmente arriba.

  soap.listen(
    app,
    path,
    service,
    wsdl,
    function () {
      console.log(
        `📡 Servidor SOAP escuchando en ${PUBLIC_HOST}${path}?wsdl` // Usamos PUBLIC_HOST en el log
      );
    },
    PUBLIC_HOST // El argumento que fuerza a soap a usar esta URL en el WSDL servido.
  );
};
