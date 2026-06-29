import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, CheckCircle2, Sparkles } from 'lucide-react';

const parseMarkdown = (text) => {
  if (!text) return '';

  // Escape basic HTML to prevent XSS injections
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 1. Convert markdown headers (e.g. ### Header) to bold text
  let formatted = escaped
    .replace(/^###\s+(.*)$/gm, '<strong>$1</strong>')
    .replace(/^##\s+(.*)$/gm, '<strong>$1</strong>')
    .replace(/^#\s+(.*)$/gm, '<strong>$1</strong>');

  // 2. Convert markdown bold (**text**) to HTML strong
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 3. Convert markdown inline code (`code`) to HTML code tag
  formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

  // 4. Convert markdown bullet points (* text or - text) to bullet characters (• text)
  formatted = formatted.replace(/^\s*[\*\-]\s+(.*)$/gm, '• $1');

  return formatted;
};

const NegotiationCoach = ({
  contractResult,
  chatMessages,
  setChatMessages,
  chatHistory,
  setChatHistory
}) => {
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:8080/api';

  // Automatically scroll chat to bottom when messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userMessageText = chatInput.trim();
    setChatInput('');
    setSendingChat(true);

    // 1. Add user message to UI
    setChatMessages((prev) => [...prev, { role: 'user', text: userMessageText }]);

    try {
      // 2. Query chatbot API with message, history context, and contract ID
      const payload = {
        message: userMessageText,
        history: chatHistory,
        contractId: contractResult?.contractId || null
      };

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to chat with coach.');
      }

      // 3. Add bot message to UI
      setChatMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);

      // 4. Append to API history tracker
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', parts: [{ text: userMessageText }] },
        { role: 'model', parts: [{ text: data.reply }] }
      ]);

    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'bot', text: `⚠️ Error: Connection failed. (${err.message})` }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div>
      <div className="view-header">
        <h1 className="view-title">Negotiation Coach</h1>
        <p className="view-subtitle">Converse with Gemini to strategize deal points, write templates, and review fees.</p>
      </div>

      {/* Contract Context Notification Bar */}
      {contractResult && (
        <div className="badge badge-success" style={{ marginBottom: '24px', gap: '8px', display: 'inline-flex', textTransform: 'none', padding: '8px 16px', borderRadius: '10px' }}>
          <CheckCircle2 size={16} />
          <span>Loaded Contract Context: <strong>{contractResult.analysis.year} {contractResult.analysis.make} {contractResult.analysis.model}</strong></span>
        </div>
      )}

      {/* Chatbox Window */}
      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}>
              {/* Header outside bubble */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
                fontSize: '10px',
                opacity: 0.6,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-mono)',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {msg.role === 'bot' ? (
                  <>
                    <Bot size={12} style={{ color: 'var(--accent)' }} />
                    <span>AI LEASE COACH</span>
                  </>
                ) : (
                  <>
                    <User size={12} style={{ color: 'var(--text-muted)' }} />
                    <span>YOU</span>
                  </>
                )}
              </div>

              {/* Chat bubble containing text only */}
              <div className={`chat-message ${msg.role}`}>
                <div
                  style={{ whiteSpace: 'pre-line', fontSize: '13px', lineHeight: '1.5' }}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                />
              </div>
            </div>
          ))}

          {sendingChat && (
            <div className="chat-message bot">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '12px', opacity: 0.8, fontWeight: 600 }}>
                <Bot size={14} style={{ color: 'var(--primary)' }} />
                <span>AI LEASE COACH</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '16px', height: '16px' }}></div>
                <span style={{ color: 'var(--text-muted)' }}>Strategizing negotiation points...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendChat} className="chat-input-area">
          <input
            type="text"
            className="form-input"
            placeholder={contractResult ? "Ask about negotiating this specific offer..." : "Ask the coach anything (e.g. 'Is $500 doc fee too high?')..."}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={sendingChat}
          />
          <button type="submit" className="btn" style={{ padding: '14px 24px' }} disabled={sendingChat || !chatInput.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default NegotiationCoach;
