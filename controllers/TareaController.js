const db = require('../config/db'); // Módulo de conexión a PostgreSQL

// Lógica para obtener todas las tareas [R]
exports.getAllTareas = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tareas ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener tareas' });
    }
};

// Lógica para crear una nueva tarea [C]
exports.createTarea = async (req, res) => {
    const { descripcion } = req.body;
    if (!descripcion) {
        return res.status(400).json({ message: 'La descripción de la tarea es obligatoria.' });
    }
    try {
        const queryText = 'INSERT INTO tareas (descripcion) VALUES ($1) RETURNING *';
        const result = await db.query(queryText, [descripcion]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear tarea' });
    }
};

// Lógica para actualizar una tarea (marcar como completada) [U]
exports.updateTarea = async (req, res) => {
    const { id } = req.params;
    // Asumimos que solo se actualiza el estado 'completada' y la descripción
    const { completada, descripcion } = req.body; 
    
    try {
        // SQL para actualización de estado y/o descripción
        let queryText = 'UPDATE tareas SET ';
        let params = [];
        let sets = [];

        if (completada !== undefined) {
            sets.push(`completada = $${params.push(!!completada)}`);
        }
        if (descripcion !== undefined) {
            sets.push(`descripcion = $${params.push(descripcion)}`);
        }
        
        if (sets.length === 0) {
            return res.status(400).json({ message: 'No hay campos válidos para actualizar.' });
        }

        queryText += sets.join(', ') + ` WHERE id = $${params.push(id)} RETURNING *`;

        const result = await db.query(queryText, params);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar tarea' });
    }
};

// Lógica para eliminar una tarea [D]
exports.deleteTarea = async (req, res) => {
    const { id } = req.params;
    try {
        const queryText = 'DELETE FROM tareas WHERE id = $1 RETURNING *';
        const result = await db.query(queryText, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada.' });
        }
        res.status(200).json({ message: 'Tarea eliminada con éxito.', deletedTask: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar tarea' });
    }
};