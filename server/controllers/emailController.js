const Email = require('../models/Email');
const { sendMail } = require('../services/mailService');

const sendBulkEmail = async (req, res) => {
  try {
    const { subject, body, recipients } = req.body;

    if (!subject || !body || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: 'Subject, body and recipients are required' });
    }

    const unique = [...new Set(recipients.map((e) => String(e).trim().toLowerCase()))]
      .filter((e) => /^\S+@\S+\.\S+$/.test(e));

    if (unique.length === 0) {
      return res.status(400).json({ message: 'No valid email addresses found' });
    }

    const emailDoc = await Email.create({
      subject,
      body,
      recipients: unique.map((email) => ({ email })),
      totalCount: unique.length,
      status: 'sending'
    });

    let sent = 0;
    let failed = 0;

    for (const r of emailDoc.recipients) {
      try {
        await sendMail({ to: r.email, subject, html: body });
        r.status = 'sent';
        r.sentAt = new Date();
        sent++;
      } catch (err) {
        r.status = 'failed';
        r.error = err.message;
        failed++;
      }
    }

    emailDoc.sentCount = sent;
    emailDoc.failedCount = failed;
    emailDoc.status = failed === 0 ? 'completed' : sent === 0 ? 'failed' : 'partial';
    await emailDoc.save();

    res.status(201).json(emailDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmails = async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEmail = async (req, res) => {
  try {
    const doc = await Email.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendBulkEmail, getEmails, deleteEmail };