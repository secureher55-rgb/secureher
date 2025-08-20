import React from "react";

const ContactSelector = ({ contacts, selectedContacts, setSelectedContacts }) => {
  const toggleContactSelection = (contactId) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  return (
    <div className="contact-selector">
      <h3>Select Emergency Contacts</h3>
      
      {contacts.length === 0 ? (
        <p className="no-contacts">No emergency contacts found. Please add contacts in your profile.</p>
      ) : (
        <div className="contacts-list">
          {contacts.map(contact => (
            <div 
              key={contact.id} 
              className={`contact-item ${selectedContacts.includes(contact.id) ? 'selected' : ''}`}
              onClick={() => toggleContactSelection(contact.id)}
            >
              <div className="contact-avatar">
                {contact.name ? contact.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-phone">{contact.phone}</div>
              </div>
              <div className="selection-indicator">
                {selectedContacts.includes(contact.id) && (
                  <i className="fas fa-check-circle"></i>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactSelector;