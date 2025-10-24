const { Pool } = require('pg');

// ----------------------------------------------------------------------
// Configuración Automática del Pool
// ----------------------------------------------------------------------
// La clase Pool de 'pg' está diseñada para leer automáticamente las
// variables de entorno estándar (PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT)
// que definimos en nuestro archivo .env. Esto hace que la configuración
// sea limpia y lista para ser usada tanto localmente como en Render.
// ----------------------------------------------------------------------

const pool = new Pool();

// Opcional: Una verificación de conexión al inicio
// Es una buena práctica para asegurar que la aplicación puede interactuar
// con la BD antes de aceptar peticiones.

pool.query('SELECT NOW() AS hora_conexion', (err, res) => {
    if (err) {
        console.error('Error fatal al conectar con PostgreSQL:', err.message);
        // Podrías salir del proceso aquí si la conexión a la BD es vital:
        // process.exit(1); 
    } else {
        console.log(`Conexión a PostgreSQL exitosa. Hora del servidor BD: ${res.rows[0].hora_conexion}`);
    }
});

// Exportamos el objeto pool y una función de consulta simplificada
module.exports = {
    // Exportamos una función 'query' que nos permite ejecutar consultas fácilmente
    query: (text, params) => pool.query(text, params),
    
    // Exportamos el pool directamente, útil para transacciones avanzadas
    pool,
};