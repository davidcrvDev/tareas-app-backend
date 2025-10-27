// backend/config/db.js

const { Pool } = require('pg');

// La PG_URL se lee de la variable de entorno que establecimos en Render
const connectionString = process.env.PG_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ ERROR: No se encontró la URL de conexión a PostgreSQL. El servidor no puede iniciar.');
    // Es CRÍTICO salir aquí si no hay URL, ya que el servidor no puede funcionar.
    process.exit(1); 
}

// ----------------------------------------------------------------------
// Configuración del Pool con la URL y SSL
// ----------------------------------------------------------------------
const pool = new Pool({
    // 1. Usa la cadena de conexión completa de Render
    connectionString: connectionString, 
    
    // 2. CONFIGURACIÓN CRÍTICA PARA RENDER (FORZAR SSL)
    ssl: {
        // Render usa un certificado autofirmado que Node rechazaría por defecto.
        // Esto permite la conexión segura.
        rejectUnauthorized: false
    }
});

// Opcional: Una verificación de conexión al inicio
pool.query('SELECT NOW() AS hora_conexion', (err, res) => {
    if (err) {
        // Esta línea es la que genera el "Error fatal al conectar con PostgreSQL" en el log de Render
        console.error('❌ Error fatal al conectar con PostgreSQL:', err.message);
        process.exit(1); // Detenemos el proceso para evitar que Express se inicie sin BD
    } else {
        console.log(`✅ Conexión a PostgreSQL exitosa. Hora del servidor BD: ${res.rows[0].hora_conexion}`);
    }
});

// Exportamos el objeto pool y una función de consulta simplificada
module.exports = {
    // Exportamos una función 'query' que nos permite ejecutar consultas fácilmente
    query: (text, params) => pool.query(text, params),
    
    // Exportamos el pool directamente, útil para transacciones avanzadas
    pool,
};