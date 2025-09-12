const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const chatController = require('../controllers/chatController');

// Obtener todos los chats del usuario autenticado
router.get('/', verifyToken, chatController.obtenerChats);
// Obtener mensajes de un chat
router.get('/:chatId/messages', verifyToken, chatController.obtenerMensajes);
// Marcar mensajes como leídos
router.post('/:chatId/read', verifyToken, chatController.marcarComoLeido);
// Iniciar chat directo (o devolver el existente)
router.post('/start', verifyToken, chatController.iniciarChat);
// Buscar chats por usuario
router.get('/search', verifyToken, chatController.buscarChatsPorUsuario);
// Eliminar chat
router.delete('/:chatId', verifyToken, chatController.eliminarChat);
// Eliminar mensaje propio
router.delete('/:chatId/messages/:messageId', verifyToken, chatController.eliminarMensaje);
// Obtener conteo de mensajes no leídos por chat
router.get('/unread-count', verifyToken, chatController.contarNoLeidos);

module.exports = router; 