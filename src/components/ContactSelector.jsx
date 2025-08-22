import React from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, setDoc } from "firebase/firestore";
import "../styles/ContactSelector.scss";

const ContactSelector = ({ contacts, selectedContacts, setSelectedContacts }) => {
  const auth = getAuth();
  const db = getFirestore();

  // 🔹 Toggle contact selection + save to Firestore
  const toggleContactSelection = async (contactId) => {
    if (!contactId) return;

    const updatedSelection = selectedContacts.includes(contactId)
      ? selectedContacts.filter((cId) => cId !== contactId)
      : [...selectedContacts, contactId];

    // Update local state immediately
    setSelectedContacts(updatedSelection);

    try {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, "users", user.uid);

      // ✅ update OR create if missing
      await setDoc(userRef, { selectedContacts: updatedSelection }, { merge: true });
    } catch (error) {
      console.error("Error saving selected contacts:", error);
    }
  };

  return (
    <div className="contact-selector">
      <h3 className="title">Select Emergency Contacts</h3>

      {(!contacts || contacts.length === 0) ? (
        <p className="no-contacts">
          No emergency contacts found. Please add contacts in your profile.
        </p>
      ) : (
        <div className="contacts-list">
          {contacts.map((contact) => {
            const isSelected = selectedContacts.includes(contact.id);

            return (
              <button
                key={contact.id}
                type="button"
                className={`contact-item ${isSelected ? "selected" : ""}`}
                onClick={() => toggleContactSelection(contact.id)}
                aria-pressed={isSelected}
              >
                <div className="contact-avatar">
                  {contact?.name ? contact.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="contact-info">
                  <div className="contact-name">{contact?.name || "Unknown"}</div>
                  <div className="contact-phone">{contact?.phone || "No number"}</div>
                </div>
                <div className="selection-indicator">
                  {isSelected && <i className="fas fa-check-circle"></i>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactSelector;
