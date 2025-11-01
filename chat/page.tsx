// pages/chat.tsx
import React, { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const userMsg = { role: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput('');
    const res = await fetch('/api/orchestrator/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { message: input }, context: {} })
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let botText = '';
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      if (value) {
        botText += decoder.decode(value);
        setMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 ? { role: 'assistant', text: botText } : m))
        );
      }
      done = doneReading;
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role}>
            {m.text}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask SaintSal something..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
