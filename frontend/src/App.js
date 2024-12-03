import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./App.css";

let stompClient = null;

const App = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const userName = "익명";

  const connect = () => {
    stompClient = new Client({
      brokerURL: "ws://localhost:8080/chat",
      onConnect: () => {
        setIsConnected(true);
        stompClient.subscribe("/topic/messages", (message) => {
          const parsedMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, parsedMessage]);
        });
      },
      onStompError: (error) => {
        console.error("STOMP error:", error);
      },
    });

    stompClient.webSocketFactory = () =>
      new SockJS("http://localhost:8080/chat");

    stompClient.activate();
  };

  const sendMessage = () => {
    if (userInput.trim() && stompClient) {
      const chatMessage = {
        sender: userName,
        content: userInput,
      };
      stompClient.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify(chatMessage),
      });
      setUserInput("");
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="header">
        <span className="book-title">『군주론』 - 마키아벨리</span>
        <div className="header-buttons">
          <button className="note-button">메모</button>
          <button className="exit-button">나가기</button>
        </div>
      </div>
      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="chat-placeholder"></div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === userName ? "own" : ""}`}
              >
                <strong>{msg.sender}: </strong>
                {msg.content}
              </div>
            ))}
          </div>
        )}
        <div className="chat-input">
          <button className="add-button">+</button>
          <input
            type="text"
            placeholder="여기에 내용을 입력해주세요."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button className="send-button" onClick={sendMessage}>
            📩
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
