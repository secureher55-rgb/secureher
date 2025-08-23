import React, { useState, useEffect } from "react";
import { 
  getFirestore, collection, getDocs, addDoc, doc, getDoc, setDoc 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ContactSelector from "../components/ContactSelector";
import "../styles/ManageContacts.scss";

export default function ManageContacts() {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  // 🔹 Fetch contacts + saved selections
  const fetchContacts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // ✅ Ensure user doc exists
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, { selectedContacts: [] }, { merge: true });
      } else {
        setSelectedContacts(userSnap.data().selectedContacts || []);
      }

      // ✅ Fetch contacts
      const contactsRef = collection(db, "users", user.uid, "contacts");
      const snapshot = await getDocs(contactsRef);
      const contactsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContacts(contactsData);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // 🔹 Add new contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    if (!/^[0-9]{10}$/.test(newPhone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return;

      const contactsRef = collection(db, "users", user.uid, "contacts");
      await addDoc(contactsRef, { name: newName, phone: newPhone });

      setNewName("");
      setNewPhone("");

      await fetchContacts();
    } catch (error) {
      console.error("Error adding contact:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Loading contacts...</p>;

  return (
    <div className="manage-contacts-container">
      <h2 className="manage-emergency-contact">Manage Emergency Contacts</h2>

      {/* 🔹 Contact Selector */}
      <div className="contact-selector-wrapper">
        <ContactSelector
          contacts={contacts}
          selectedContacts={selectedContacts}
          setSelectedContacts={setSelectedContacts}
        />
      </div>

      {/* 🔹 Add Contact Form */}
      <form onSubmit={handleAddContact} className="add-contact-form">
        <h3 className="add-new-contact">Add New Contact</h3>
        
        <div className="form-inputs">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone number"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={saving}
          className="submit-btn"
        >
          {saving ? "Saving..." : "Add Contact"}
        </button>
      </form>
    </div>
  );
}
