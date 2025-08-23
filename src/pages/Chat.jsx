import React, { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import Sidebar from "../components/chat/Sidebar";
import "../styles/Chat.scss";

const Chat = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);

  const auth = getAuth();
  const db = getFirestore();

  // 🔹 Track logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, [auth]);

  // 🔹 Real-time messages listener
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);

      // ✅ Auto-scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
    return () => unsubscribe();
  }, [db]);

  // 🔹 Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await addDoc(collection(db, "messages"), {
      text: newMessage,
      uid: user.uid,
      email: user.email,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="chat-wrapper">
      {/* ✅ Sidebar */}
      <Sidebar />

      {/* ✅ Main Chat Section */}
      <div className="chat-container">
        {/* Header */}
        <header className="chat-header">
          <h2>SecureHer Chat</h2>
          {user && <span className="user-info">Logged in as {user.email}</span>}
        </header>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble ${
                  msg.uid === user?.uid ? "sent" : "received"
                }`}
              >
                <p className="chat-text">{msg.text}</p>
                <small className="chat-meta">
                  {msg.email?.split("@")[0] || "Anon"} •{" "}
                  {msg.timestamp?.toDate
                    ? msg.timestamp.toDate().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "⏳"}
                </small>
              </div>
            ))
          ) : (
            <p className="no-messages">
              No messages yet. Start the conversation 👋
            </p>
          )}
          <div ref={scrollRef}></div>
        </div>

        {/* Input */}
        <form className="chat-input" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" disabled={!newMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
