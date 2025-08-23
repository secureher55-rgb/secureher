import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import MessageBubble from "./MessageBubble";
import "../styles/messagelist.scss";

export default function MessageList({ chatId }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    // ✅ Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);

      // ✅ Auto-scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  return (
    <div className="message-list">
      {messages.length > 0 ? (
        messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
      ) : (
        <p className="no-messages">No messages yet. Say hello 👋</p>
      )}
      <div ref={scrollRef}></div>
    </div>
  );
}
