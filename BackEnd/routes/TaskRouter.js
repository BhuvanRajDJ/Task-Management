const router = require('express').Router();
const {createTask,fetchTask,updateTask,deleteTask} = require('../controllers/TaskController');

router.get('/tasks', fetchTask);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.patch('/tasks', updateTask)
router.delete('/tasks/:id', deleteTask);
module.exports = router;