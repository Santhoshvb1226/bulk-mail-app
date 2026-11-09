const express = require('express');
const { sendBulkEmail, getEmails, deleteEmail } = require('../controllers/emailController');

const router = express.Router();

router.post('/send', sendBulkEmail);
router.get('/', getEmails);
router.delete('/:id', deleteEmail);

module.exports = router;