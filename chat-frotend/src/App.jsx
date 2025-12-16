import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef(null);

  // Efeito para rolar para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Configurar listeners do Socket.IO
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
      setIsTyping(false);
    });

    socket.on('users_update', (users) => {
      setOnlineUsers(users);
    });

    socket.on('user_typing', (user) => {
      setIsTyping(true);
      setTypingUser(user);
    });

    socket.on('user_stop_typing', () => {
      setIsTyping(false);
    });

    return () => {
      socket.off('receive_message');
      socket.off('users_update');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, []);

  const joinChat = () => {
    if (username.trim()) {
      socket.emit('user_join', username);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', {
        author: username,
        message: message
      });
      setMessage('');
    }
  };

  const handleTyping = () => {
    if (message.trim()) {
      socket.emit('typing', username);
    } else {
      socket.emit('stop_typing');
    }
  };

  return (
    <div className="App">
      {!username ? (
        <div className="join-container">
          <input
            type="text"
            placeholder="Digite seu nome"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && joinChat()}
          />
          <button onClick={joinChat}>Entrar no Chat</button>
        </div>
      ) : (
        <div className="chat-container">
          <div className="sidebar">
            <h3>Usuários Online ({onlineUsers.length})</h3>
            <ul>
              {onlineUsers.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>

          <div className="chat-main">
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div key={index} className="message">
                  <strong>{msg.author}: </strong>
                  {msg.message}
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
              ))}
              {isTyping && (
                <div className="typing-indicator">
                  {typingUser} está digitando...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Digite sua mensagem"
              />
              <button onClick={sendMessage}>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;