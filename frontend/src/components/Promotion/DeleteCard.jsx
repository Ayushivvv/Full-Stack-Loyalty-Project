import React from "react";

export default function DeleteModal({ open, promoName, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{ marginBottom: "15px" }}>
          Delete promotion “{promoName}”?
        </h3>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button style={styles.deleteBtn} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    padding: "20px",
    width: "350px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
  },
  cancelBtn: {
    padding: "8px 12px",
    marginRight: "10px",
    background: "#ccc",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 12px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
