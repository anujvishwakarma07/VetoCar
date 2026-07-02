import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, CheckCircle2, Sparkles } from 'lucide-react';

const parseMarkdownToHtml = (markdown) => {
  if (!markdown) return '';

  // Escape basic HTML to protect rendering, preserving newline normalizations
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 1. Extract and placeholder code blocks: ```[lang]\n[code]\n```
  const codeBlocks = [];
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const placeholder = `__CODE_BLOCK_PLACEHOLDER_${codeBlocks.length}__`;
    codeBlocks.push(code);
    return placeholder;
  });

  // 2. Normalize linebreaks
  html = html.replace(/\r\n/g, '\n');

  // 3. Process structural blocks (headers, rules, lists, paragraphs)
  const lines = html.split('\n');
  const processedLines = [];
  let inBulletList = false;
  let inNumList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === '---') {
      if (inBulletList) { processedLines.push('</ul>'); inBulletList = false; }
      if (inNumList) { processedLines.push('</ol>'); inNumList = false; }
      processedLines.push('<hr style="border:none; border-bottom:1px solid var(--border); margin:16px 0;" />');
      continue;
    }

    // Headers
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      if (inBulletList) { processedLines.push('</ul>'); inBulletList = false; }
      if (inNumList) { processedLines.push('</ol>'); inNumList = false; }
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const fontSize = level === 1 ? '18px' : level === 2 ? '16px' : '14px';
      processedLines.push(`<h${level} style="color:var(--accent); font-family:var(--font-mono); font-size:${fontSize}; font-weight:800; margin:16px 0 8px 0; text-transform:uppercase; letter-spacing:0.05em; text-align:left;">${text}</h${level}>`);
      continue;
    }

    // Bullet Lists
    const bulletMatch = line.match(/^(\s*)[-*•+]\s+(.*)$/);
    if (bulletMatch) {
      if (inNumList) { processedLines.push('</ol>'); inNumList = false; }
      if (!inBulletList) {
        processedLines.push('<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc; display: flex; flex-direction: column; gap: 6px;">');
        inBulletList = true;
      }
      processedLines.push(`<li style="line-height:1.6; font-size:13.5px;">${bulletMatch[2]}</li>`);
      continue;
    }

    // Numbered Lists
    const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (inBulletList) { processedLines.push('</ul>'); inBulletList = false; }
      if (!inNumList) {
        processedLines.push('<ol style="margin: 8px 0; padding-left: 20px; list-style-type: decimal; display: flex; flex-direction: column; gap: 6px;">');
        inNumList = true;
      }
      processedLines.push(`<li style="line-height:1.6; font-size:13.5px;">${numMatch[3]}</li>`);
      continue;
    }

    // Blank line closes lists
    if (trimmed === '') {
      if (inBulletList) { processedLines.push('</ul>'); inBulletList = false; }
      if (inNumList) { processedLines.push('</ol>'); inNumList = false; }
      processedLines.push('');
      continue;
    }

    // Code block placeholder lines - bypass formatting wrapper
    if (trimmed.startsWith('__CODE_BLOCK_PLACEHOLDER_')) {
      if (inBulletList) { processedLines.push('</ul>'); inBulletList = false; }
      if (inNumList) { processedLines.push('</ol>'); inNumList = false; }
      processedLines.push(trimmed);
      continue;
    }

    // Standard body text paragraph
    if (inBulletList || inNumList) {
      processedLines.push(line);
    } else {
      processedLines.push(`<p style="margin: 8px 0; font-size: 13.5px; line-height: 1.6;">${line}</p>`);
    }
  }

  // Final list tags closure
  if (inBulletList) processedLines.push('</ul>');
  if (inNumList) processedLines.push('</ol>');

  html = processedLines.join('\n');

  // 4. Render Inline markdown tags
  // Bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700;">$1</strong>');
  // Italic (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em style="font-style: italic;">$1</em>');
  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, '<code style="background:var(--bg-hover); border:1px solid var(--border); padding:2px 6px; border-radius:4px; font-family:var(--font-mono); font-size:12px; color:var(--accent);">$1</code>');
  // High-visibility highlight tags for cash values
  html = html.replace(/(\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, '<span style="color:var(--accent); font-family:var(--font-mono); font-weight:700;">$1</span>');

  // 5. Restore code block templates with terminal UI wrapper
  codeBlocks.forEach((code, idx) => {
    const placeholder = `__CODE_BLOCK_PLACEHOLDER_${idx}__`;
    const lines = code.split('\n');
    let displayCode = code;
    if (lines[0] && !lines[0].includes(' ') && lines[0].length < 15) {
      displayCode = lines.slice(1).join('\n');
    }
    displayCode = displayCode.trim();
    const escapedCode = displayCode
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');

    const htmlCard = `
      <div class="interactive-code-card" style="border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: #07080a; margin: 16px 0; width: 100%; text-align: left;">
        <div style="padding: 10px 16px; background: #0c1017; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
            Negotiation Template / Script
          </span>
          <button 
            onclick="navigator.clipboard.writeText(\`${escapedCode}\`); this.style.background='rgba(16,185,129,0.15)'; this.style.borderColor='#10b981'; this.style.color='#10b981'; this.innerText='Copied!'; setTimeout(() => { this.style.background='transparent'; this.style.borderColor='var(--border)'; this.style.color='var(--text-main)'; this.innerText='Copy Script'; }, 2000);"
            style="background: transparent; border: 1px solid var(--border); color: var(--text-main); font-size: 11px; font-family: var(--font-mono); padding: 4px 10px; border-radius: 4px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 4px; transition: all 0.15s;"
          >
            Copy Script
          </button>
        </div>
        <pre style="margin: 0; padding: 16px; overflow-x: auto; font-size: 12px; font-family: var(--font-mono); line-height: 1.6; color: #e2e8f0; white-space: pre-wrap; text-align: left; background: transparent; border: none; border-radius: 0;">${displayCode}</pre>
      </div>
    `;
    html = html.replace(placeholder, htmlCard);
  });

  return html;
};

const NegotiationCoach = ({
  contractResult,
  chatMessages,
  setChatMessages,
  chatHistory,
  setChatHistory,
  userCredits,
  setCredits,
  setActiveTab
}) => {
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:8080/api';

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    if (userCredits !== undefined && userCredits <= 0) {
      alert("Insufficient credits. You will be redirected to purchase audit credits.");
      setActiveTab('buy_credits');
      return;
    }

    const userMessageText = chatInput.trim();
    setChatInput('');
    setSendingChat(true);

    setChatMessages((prev) => [...prev, { role: 'user', text: userMessageText }]);
    setTimeout(scrollToBottom, 50);

    try {
      const payload = {
        message: userMessageText,
        history: chatHistory,
        contractId: contractResult?._id || contractResult?.contractId || null
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
        if (response.status === 402 || data.code === 'INSUFFICIENT_CREDITS') {
          if (setCredits) setCredits(0);
          alert("Insufficient credits. Redirecting to top-up packages.");
          setActiveTab('buy_credits');
          setSendingChat(false);
          return;
        }
        throw new Error(data.error || 'Failed to chat with coach.');
      }

      if (setCredits) {
        setCredits(prev => Math.max(0, prev - 1));
      }

      // 3. Start line-by-line simulated streaming
      setIsTyping(true);
      const replyText = data.reply;
      const lines = replyText.split('\n');
      
      // Add empty bot reply slot
      setChatMessages((prev) => [...prev, { role: 'bot', text: '' }]);
      setTimeout(scrollToBottom, 50);

      let currentText = '';
      let lineIdx = 0;

      const interval = setInterval(() => {
        if (lineIdx < lines.length) {
          currentText += (lineIdx === 0 ? '' : '\n') + lines[lineIdx];
          setChatMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: 'bot', text: currentText };
            return copy;
          });
          lineIdx++;
          scrollToBottom();
        } else {
          clearInterval(interval);
          setIsTyping(false);
          setSendingChat(false);

          // 4. Save to API history tracker
          setChatHistory((prev) => [
            ...prev,
            { role: 'user', parts: [{ text: userMessageText }] },
            { role: 'model', parts: [{ text: replyText }] }
          ]);
        }
      }, 80); // Snappy 80ms line typing interval

    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'bot', text: `⚠️ Error: Connection failed. (${err.message})` }
      ]);
      setSendingChat(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div className="view-header" style={{ marginBottom: '16px', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
            VetoCar Negotiation Assistant Online
          </span>
        </div>
        <h1 className="view-title" style={{ fontSize: '24px', fontWeight: 800 }}>Negotiation Coach</h1>
        <p className="view-subtitle">Converse with the coach to strategize deal points, write templates, and review fees.</p>
      </div>

      {/* Contract Context Notification Card */}
      {contractResult && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'var(--bg-hover)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--accent)',
          borderRadius: '4px',
          marginBottom: '20px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'rgba(0, 245, 212, 0.06)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Negotiation Context
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                {[contractResult.analysis.year, contractResult.analysis.make, contractResult.analysis.model].filter(Boolean).join(' ') || 'Active Document Terms'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ fontSize: '11px', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>SCORE</span>
              <strong style={{ color: 'var(--accent)', fontWeight: 800 }}>{contractResult.analysis.fairnessScore ?? 'N/A'}</strong>
            </div>
            <div style={{ fontSize: '11px', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>TYPE</span>
              <strong style={{ color: 'var(--text-main)', fontWeight: 800 }}>{contractResult.analysis.contractType || 'Unknown'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Chatbox Window */}
      <div className="chat-container" style={{ height: 'calc(100vh - 295px)', display: 'flex', flexDirection: 'column' }}>
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {chatMessages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
              width: msg.role === 'bot' ? '75%' : 'auto',
              marginBottom: '16px'
            }}>
              {/* Header outside bubble */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '6px',
                fontSize: '9px',
                opacity: 0.5,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-mono)',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {msg.role === 'bot' ? (
                  <>
                    <Bot size={11} style={{ color: 'var(--accent)' }} />
                    <span>LEASING COACH</span>
                  </>
                ) : (
                  <>
                    <User size={11} style={{ color: 'var(--text-muted)' }} />
                    <span>YOU</span>
                  </>
                )}
              </div>

              {/* Chat bubble containing text only */}
              <div 
                className={`chat-message ${msg.role}`} 
                style={{ 
                  width: '100%',
                  borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-hover)',
                  color: msg.role === 'user' ? 'var(--bg-main)' : 'var(--text-main)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  padding: '12px 18px',
                  boxShadow: msg.role === 'user' ? '0 4px 12px rgba(255,255,255,0.02)' : 'none'
                }}
              >
                <div style={{ fontSize: '13.5px', lineHeight: '1.6', position: 'relative' }}>
                  <span dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(msg.text) }} />
                  {msg.role === 'bot' && isTyping && idx === chatMessages.length - 1 && (
                    <span 
                      style={{ 
                        display: 'inline-block', 
                        width: '8px', 
                        height: '14px', 
                        background: 'var(--accent)', 
                        marginLeft: '5px',
                        verticalAlign: 'middle',
                        animation: 'cursor-blink 0.8s infinite'
                      }} 
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          {sendingChat && !isTyping && (
            <div className="chat-message bot" style={{ background: 'transparent', border: 'none', boxShadow: 'none', paddingLeft: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '10px', opacity: 0.6, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                <Bot size={12} style={{ color: 'var(--accent)' }} />
                <span>COACH IS AUDITING CONTRACT DETAILS</span>
              </div>
              <div className="typing-wave-container">
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Calculating counter-offer script</span>
                <div style={{ display: 'flex', gap: '3px', marginLeft: '6px', alignItems: 'center' }}>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendChat} className="chat-input-area" style={{ borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
          <input
            type="text"
            className="form-input"
            placeholder={contractResult ? "Ask about negotiating this specific offer..." : "Ask the coach anything (e.g. 'Is $500 doc fee too high?')..."}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={sendingChat}
            style={{ borderRadius: '4px', background: 'var(--bg-main)', border: '1px solid var(--border)' }}
          />
          <button type="submit" className="btn" style={{ padding: '14px 24px', borderRadius: '4px' }} disabled={sendingChat || !chatInput.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default NegotiationCoach;
