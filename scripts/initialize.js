// Script para inicializar la base de datos con la tabla 'tareas' y datos iniciales

// Asumimos que la librería pg (PostgreSQL) ya está instalada en el backend
const { Client } = require('pg');

// Usamos la URL de conexión que se le pase al script (ya sea la local o la de Render)
const connectionString = process.env.PG_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: No se encontró la URL de conexión a PostgreSQL. Asegúrate de definir PG_URL o DATABASE_URL.');
  process.exit(1);
}

const DDL_AND_DML_SCRIPT = `
-- 1. Crear la tabla 'tareas' si no existe
CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    completada BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Eliminar las tareas existentes (opcional, para una inicialización limpia)
TRUNCATE TABLE tareas RESTART IDENTITY;

-- 3. Insertar los 5 registros iniciales
INSERT INTO tareas (descripcion, completada) VALUES
('Implementar la API CRUD con Express', TRUE),
('Diseñar el WSDL para el servicio SOAP', TRUE),
('Configurar la conexión a PostgreSQL en Render', FALSE),
('Crear la interfaz de React para el formulario', FALSE),
('Prueba final de despliegue y persistencia de datos', FALSE);
`;

async function initializeDatabase() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('✅ Conexión exitosa a la base de datos remota de Render.');

    // Ejecutar las sentencias DDL y DML
    await client.query(DDL_AND_DML_SCRIPT);

    console.log('🎉 Migración de tabla y datos iniciales completada.');
  } catch (err) {
    console.error('❌ ERROR al inicializar la base de datos:', err.message);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada.');
  }
}

initializeDatabase();