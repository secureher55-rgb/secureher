import React from "react";
import "../styles/chatheader.scss";

export default function ChatHeader({ chatName = "Chat", onBack }) {
  return (
    <div className="chat-header">
      {onBack && (
        <button className="back-btn" onClick={onBack}>
          ⬅
        </button>
      )}
      <h2>{chatName}</h2>
      <div className="actions">
        <button>⋮</button>
      </div>
    </div>
  );
}
