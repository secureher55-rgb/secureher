import React, { useEffect, useState, useMemo } from "react";
import { 
  getAuth, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs 
} from "firebase/firestore";
import "../styles/ContactSelector.scss";

const ContactSelector = ({ selectedContacts, setSelectedContacts }) => {
  const auth = getAuth();
  const db = getFirestore();
  const [contacts, setContacts] = useState([]);
  const [primaryContact, setPrimaryContact] = useState(null);
  const [userId, setUserId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Track userId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, [auth]);

  // ✅ Fetch contacts list from Firestore
  useEffect(() => {
    if (!userId) return;

    const fetchContacts = async () => {
      try {
        const contactsRef = collection(db, "users", userId, "contacts");
        const snap = await getDocs(contactsRef);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setContacts(list);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };

    fetchContacts();
  }, [userId, db]);

  // ✅ Fetch primary contact
  useEffect(() => {
    const fetchPrimaryContact = async () => {
      if (!userId) return;
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.emergencyContact) {
            const primary = {
              id: "primary",
              name: "❤️ Primary Emergency Contact",
              phone: data.emergencyContact,
            };
            setPrimaryContact(primary);

            // Only add primary to selection if not already present
            setSelectedContacts((prev) =>
              prev.includes("primary") ? prev : [...prev, "primary"]
            );
          }
        }
      } catch (err) {
        console.error("Error fetching emergencyContact:", err);
      }
    };

    fetchPrimaryContact();
  }, [userId, db, setSelectedContacts]);

  // ✅ Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(query) || 
      contact.phone.includes(query)
    );
  }, [contacts, searchQuery]);

  // ✅ Prepare final contact list (primary + filtered)
  const finalContacts = primaryContact 
    ? [primaryContact, ...filteredContacts] 
    : filteredContacts;

  // ✅ Toggle normal contact selection (primary cannot be toggled)
  const toggleContactSelection = async (contactId) => {
    if (!contactId || contactId === "primary") return;

    const updatedSelection = selectedContacts.includes(contactId)
      ? selectedContacts.filter((cId) => cId !== contactId)
      : [...selectedContacts, contactId];

    setSelectedContacts(updatedSelection);

    try {
      if (!userId) return;
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { selectedContacts: updatedSelection }, { merge: true });
    } catch (error) {
      console.error("Error saving selected contacts:", error);
    }
  };

  // ✅ Delete a contact (never primary)
  const deleteContact = async (contactId) => {
    if (contactId === "primary") return;
    setDeletingId(contactId);

    try {
      if (!userId) return;
      const contactRef = doc(db, "users", userId, "contacts", contactId);
      await deleteDoc(contactRef);

      // Update local state
      const updatedContacts = contacts.filter((c) => c.id !== contactId);
      setContacts(updatedContacts);

      // Remove from selected if deleted
      setSelectedContacts((prev) => prev.filter((id) => id !== contactId));

      console.log("Contact deleted successfully");
    } catch (err) {
      console.error("Error deleting contact:", err);
      alert("Failed to delete contact. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="contact-selector">
      <h3 className="title">
        <i className="fas fa-address-book"></i>Emergency Contacts
      </h3>

      {/* Search Bar */}
      <div className="search-container">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search contacts by name or number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button 
            className="clear-search"
            onClick={() => setSearchQuery("")}
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {finalContacts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-users-slash"></i>
          </div>
          <p className="empty-text">
            {searchQuery 
              ? "No contacts found matching your search" 
              : "No emergency contacts found"
            }
          </p>
          <p className="empty-subtext">
            {searchQuery 
              ? "Try a different search term" 
              : "Add contacts in your profile settings"
            }
          </p>
        </div>
      ) : (
        <div className="contacts-list">
          {finalContacts.map((contact) => {
            const isSelected = selectedContacts.includes(contact.id);
            const isPrimary = contact.id === "primary";
            const isDeleting = deletingId === contact.id;

            return (
              <div key={contact.id} className="contact-wrapper">
                <button
                  type="button"
                  className={`contact-item ${isSelected ? "selected" : ""} ${isDeleting ? "deleting" : ""}`}
                  onClick={() => toggleContactSelection(contact.id)}
                  aria-pressed={isSelected}
                  disabled={isPrimary || isDeleting}
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

                {!isPrimary && (
                  <button
                    className="delete-btn"
                    onClick={() => deleteContact(contact.id)}
                    disabled={isDeleting}
                    aria-label={`Delete ${contact.name}`}
                  >
                    {isDeleting ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash"></i>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactSelector;