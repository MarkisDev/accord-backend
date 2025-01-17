const express = require('express');
const router = express.Router();
const handleServerController = require('../../controllers/handleServerController');

router.post('/', handleServerController.handleAddServer);
router.get('/', handleServerController.handleGetServer)
router.get('/:server_id', handleServerController.handleGetServerId)
router.delete('/', handleServerController.deleteServer)

// router.route('/')
//     .post(handleServerController.handleAddServer)

// router.route('/:email')
//     .get(handleServerController.handleGetServer)

module.exports = router;     

