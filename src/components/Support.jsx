import React, { useState, useEffect, useRef } from 'react';

export default function Support({ addNotification }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello Kavya! I am Zenith, your secure banking chatbot. How can I assist you with your wealth or credit services today?", sender: "bot", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Ticket states
  const [tickets, setTickets] = useState([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Accounts');
  const [ticketMessage, setTicketMessage] = useState('');

  const chatEndRef = useRef(null);

  // Fetch tickets on load
  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/support/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMsg = {
      id: messages.length + 1,
      text: userText,
      sender: "user",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Chatbot intelligence (simple keyword matching)
    setTimeout(() => {
      let botResponse = "I've logged your request. For sensitive security tasks or custom rates, please open an official support ticket on the right panel or call our priority desk at 1800-258-ZENITH.";
      const query = userText.toLowerCase();

      if (query.includes('balance') || query.includes('savings') || query.includes('amount')) {
        botResponse = "Your Zenith premium savings balance is ₹7,82,450.30, with an available amount of ₹5,60,230.10. Business current holds ₹1,45,000.00.";
      } else if (query.includes('freeze') || query.includes('lock') || query.includes('lost') || query.includes('block')) {
        botResponse = "If your card is lost, navigate to the 'Cards' tab and toggle 'Freeze Card' instantly. This prevents unauthorized online/offline swipes immediately.";
      } else if (query.includes('loan') || query.includes('emi') || query.includes('interest')) {
        botResponse = "Zenith offers Home Loans at 7.25%, Car Loans at 8.75%, and Personal Loans at 10.5%. Calculate customized EMIs and get instant approvals in the 'Loans' tab.";
      } else if (query.includes('pin') || query.includes('cvv') || query.includes('password')) {
        botResponse = "Atm/Card PIN resets and CVV exposure can be done securely in the 'Cards' tab. Both actions require your transaction PIN ('1234') as authentication.";
      } else if (query.includes('budget') || query.includes('limit') || query.includes('spent')) {
        botResponse = "Set category caps in the 'Budget Planner'. We'll alert you with dashboard notifications once your spending hits 85% of your customized limits.";
      } else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        botResponse = "Hello Kavya! How can I help you manage your accounts, cards, or loan applications today?";
      }

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: botResponse,
        sender: "bot",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 800);
  };

  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: ticketSubject,
          category: ticketCategory,
          message: ticketMessage
        })
      });

      if (response.ok) {
        addNotification("Ticket Submitted", `Support ticket raised successfully.`);
        setTicketSubject('');
        setTicketMessage('');
        fetchTickets(); // Refresh list
      } else {
        alert("Failed to submit ticket.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Zenith Support Center</h1>
          <p className="welcome-subtitle">Chat with our virtual banking assistant or raise secure support tickets.</p>
        </div>
      </div>

      <div className="support-layout-grid">
        {/* Live Chatbot */}
        <div className="chat-assistant-column">
          <div className="zenith-card chatbot-card">
            <div className="chat-header-bar">
              <span className="online-dot-big"></span>
              <div>
                <h4>Zenith Virtual Assistant</h4>
                <p>Secure Demo Bot • Online</p>
              </div>
            </div>
            
            <div className="chat-dialog-body">
              {messages.map(msg => (
                <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                  <div className="bubble">
                    <p>{msg.text}</p>
                    <span className="bubble-time">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleChatSend} className="chat-input-bar">
              <input 
                type="text" 
                className="chat-text-input" 
                placeholder="Ask about balance, freezing card, loans..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button type="submit" className="chat-send-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Tickets portal */}
        <div className="tickets-column">
          {/* Raise ticket */}
          <div className="zenith-card raise-ticket-card">
            <h3>Open Support Ticket</h3>
            <p className="widget-subtitle">Submit a secure message to our operations team</p>
            
            <form onSubmit={handleRaiseTicket} className="ticket-form">
              <div className="form-group mt-4">
                <label>Subject</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Summarize your issue"
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-double-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    className="form-control"
                    value={ticketCategory}
                    onChange={e => setTicketCategory(e.target.value)}
                  >
                    <option value="Accounts">Accounts & Balances</option>
                    <option value="Cards">Credit/Debit Cards</option>
                    <option value="Loans">Loans & EMI</option>
                    <option value="Investments">Wealth Management</option>
                    <option value="Security">Security & PINs</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control" defaultValue="Standard">
                    <option value="Low">Low</option>
                    <option value="Standard">Standard</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Detailed Message</label>
                <textarea 
                  rows="3"
                  className="form-control"
                  placeholder="Explain details of your concern..."
                  value={ticketMessage}
                  onChange={e => setTicketMessage(e.target.value)}
                  style={{ resize: 'none' }}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2">Submit Secure Ticket</button>
            </form>
          </div>

          {/* Ticket lists */}
          <div className="zenith-card ticket-list-card mt-6">
            <h3>My Support Tickets</h3>
            <div className="tickets-list mt-4">
              {tickets.length === 0 ? (
                <p className="text-secondary text-center py-4">No open tickets found.</p>
              ) : (
                tickets.map(t => (
                  <div key={t.id} className="ticket-row-item-box">
                    <div className="ticket-top-line">
                      <strong>{t.subject}</strong>
                      <span className={`badge ${t.status === 'Closed' ? 'badge-success' : 'badge-warning'}`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="ticket-bottom-line mt-2">
                      <span>ID: {t.id} • {t.category}</span>
                      <span>Submitted: {t.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
