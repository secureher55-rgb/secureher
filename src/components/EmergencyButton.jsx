import React, { useState } from "react";

const EmergencyButton = ({ onEmergencyCall }) => {
  const [isCalling, setIsCalling] = useState(false);

  const handleClick = () => {
    setIsCalling(true);
    if (onEmergencyCall) {
      onEmergencyCall();
    }
    setTimeout(() => {
      setIsCalling(false);
    }, 3000);
  };

  return (
    <div className="emergency-button-container">
      <button 
        className={`emergency-btn ${isCalling ? 'calling' : ''}`}
        onClick={handleClick}
        disabled={isCalling}
        aria-label="Emergency call button"
      >
        <div className="btn-inner">
          <div className="secureher-logo">
            <i className="fas fa-shield-alt"></i>
          </div>
          {isCalling ? (
            <span className="call-text">Connecting Emergency...</span>
          ) : (
            <span className="call-text">Emergency Alert</span>
          )}
        </div>
      </button>
    </div>
  );
};

export default EmergencyButton;