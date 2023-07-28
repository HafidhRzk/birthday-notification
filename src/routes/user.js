const express = require('express');
const router = express.Router();

const {
    createUser,
    updateUser,
    deleteUser,
    clearQueue
} = require('../controllers/user')

router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/clear-queue', clearQueue);

module.exports = router;
