import { useEffect, useState } from 'react';
import './App.css';
import { sendEmails, getEmails, deleteEmail } from './api';
// pull valid, unique emails out of any pasted or uploaded text
const extractEmails = (text) => {
  const found = text.match(/[^\s,;<>"']+@[^\s,;<>"']+\.[^\s,;<>"']+/g) || [];
  return [...new Set(found.map((e) => e.toLowerCase()))];
};

function App() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientText, setRecipientText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const recipients = extractEmails(recipientText);

  const loadHistory = async () => {
    try {
      const { data } = await getEmails();
      setHistory(data);
    } catch {
      console.error('Could not load history');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRecipientText((prev) => (prev ? prev + '\n' : '') + reader.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    if (!subject.trim() || !body.trim() || recipients.length === 0) {
      setResult({ type: 'error', text: 'Subject, message and at least one valid email are required.' });
      return;
    }
    const handleDelete = async (id) => {
  if (!window.confirm('Delete this record?')) return;
  try {
    await deleteEmail(id);
    loadHistory();
  } catch (err) {
    alert('Could not delete: ' + (err.response?.data?.message || err.message));
  }
};

    setLoading(true);
    try {
      const html = body.replace(/\n/g, '<br>');
      const { data } = await sendEmails({ subject, body: html, recipients });
      setResult({
        type: data.failedCount === 0 ? 'success' : 'error',
        text: `Sent: ${data.sentCount}, Failed: ${data.failedCount}`
      });
      setSubject('');
      setBody('');
      setRecipientText('');
      loadHistory();
    } catch (err) {
      setResult({ type: 'error', text: err.response?.data?.message || 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Bulk Mail App</h1>

      <form onSubmit={handleSubmit} className="card">
        <label>Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />

        <label>Message</label>
        <textarea rows="6" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message..." />

        <label>Recipients (paste emails, or upload a .csv / .txt file)</label>
        <textarea
          rows="5"
          value={recipientText}
          onChange={(e) => setRecipientText(e.target.value)}
          placeholder="one@gmail.com, two@gmail.com"
        />
        <input type="file" accept=".csv,.txt" onChange={handleFile} />
        <p className="count">{recipients.length} valid email(s) found</p>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending... please wait' : 'Send Emails'}
        </button>

        {result && <p className={`result ${result.type}`}>{result.text}</p>}
      </form>

      <h2>Sent History</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject</th>
              <th>Total</th>
              <th>Sent</th>
              <th>Failed</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
         </thead>
          <tbody>
            {history.length === 0 && (
              <tr><td colSpan="7">No emails sent yet</td></tr>
            )}
            {history.map((h) => (
  <tr key={h._id}>
    <td>{new Date(h.createdAt).toLocaleString()}</td>
    <td>{h.subject}</td>
    <td>{h.totalCount}</td>
    <td>{h.sentCount}</td>
    <td>{h.failedCount}</td>
    <td><span className={`badge ${h.status}`}>{h.status}</span></td>
  <td><button className="delete-btn" onClick={() => handleDelete(h._id)}>Delete</button></td>
  </tr>
))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;