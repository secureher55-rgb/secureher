import React, { useState } from "react";
import { db, auth } from "../firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import "../styles/chatinput.scss";

export default function ChatInput({ chatId }) {
  const [message, setMessage] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !chatId) return;

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: message,
        senderId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      });
      setMessage(""); // ✅ Clear input after sending
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <form className="chat-input" onSubmit={sendMessage}>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}
