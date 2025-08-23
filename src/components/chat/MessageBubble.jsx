import React from "react";
import { auth } from "../firebase/config";
import "../styles/messagebubble.scss";

export default function MessageBubble({ msg }) {
  const isSent = msg.senderId === auth.currentUser?.uid;

  return (
    <div className={`message-bubble ${isSent ? "sent" : "received"}`}>
      <div className="bubble-content">
        <p>{msg.text}</p>
        <span className="timestamp">
          {msg.createdAt?.toDate
            ? msg.createdAt.toDate().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>
      </div>
    </div>
  );
}
