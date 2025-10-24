// 1. Cargar variables de entorno
require("dotenv").config();
require("./config/db");

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 4000; // Render usará el puerto de la variable de entorno

// 2. Middlewares esenciales
app.use(cors()); // Permite peticiones desde el frontend (React)
app.use(express.json()); // Permite a Express leer cuerpos de peticiones en formato JSON

// 5. Integración de Rutas (API RESTful)
const tareaRoutes = require("./routes/TareaRoutes");
app.use("/api/tareas", tareaRoutes); // Endpoint principal: /api/tareas

// 6. Integración del Servicio Web (SOAP) - *Se implementará en el siguiente paso*
const TareaSoapService = require("./services/TareaSoapService");
TareaSoapService.init(app, "/soap");

// 3. Ruta de prueba (Health Check)
app.get("/", (req, res) => {
  res.send("Servidor Express funcionando correctamente.");
});

// 4. Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express ejecutándose en el puerto: ${PORT}`);
});

// Nota: Aquí integraremos las rutas (CRUD y SOAP)
