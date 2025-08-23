import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "../../styles/sidebar.scss";

export default function Sidebar({ onSelectChat }) {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);

  // ✅ Listen for logged-in user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, "chats"),
          where("participants", "array-contains", currentUser.uid)
        );

        // ✅ Real-time chats
        onSnapshot(q, (snapshot) => {
          const chatList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChats(chatList);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="sidebar">
      {/* 🔹 User Profile */}
      <div className="sidebar-header">
        {user && (
          <div className="user-info">
            <img
              src={user.photoURL || "/default-avatar.png"}
              alt="User Avatar"
              className="avatar"
            />
            <span className="username">{user.displayName || "Anonymous"}</span>
          </div>
        )}
      </div>

      {/* 🔹 Search Bar */}
      <div className="sidebar-search">
        <input type="text" placeholder="Search chats..." />
      </div>

      {/* 🔹 Chat List */}
      <div className="chat-list">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <button
              key={chat.id}
              className="chat-item"
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar">💬</div>
              <div className="chat-info">
                <span className="chat-name">{chat.name || "Unnamed Chat"}</span>
                <p className="last-message">
                  {chat.lastMessage?.text || "No messages yet"}
                </p>
              </div>
            </button>
          ))
        ) : (
          <p className="no-chats">No chats yet. Start a new one!</p>
        )}
      </div>
    </div>
  );
}
