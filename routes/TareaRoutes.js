const express = require('express');
const router = express.Router();
const TareaController = require('../controllers/TareaController');

// Rutas RESTful para el CRUD de Tareas
// ------------------------------------

// [R]ead All: Obtener todas las tareas
router.get('/', TareaController.getAllTareas);

// [C]reate: Crear una nueva tarea
router.post('/', TareaController.createTarea);

// [U]pdate: Actualizar el estado de una tarea por ID
router.put('/:id', TareaController.updateTarea);

// [D]elete: Eliminar una tarea por ID
router.delete('/:id', TareaController.deleteTarea);

module.exports = router;