export default function TransactionTable({ transactions, onView, onToggleSuspicious }) {
  return (
    <table width="100%" border="1" cellPadding="8">
      <thead>
        <tr>
          <th>ID</th>
          <th>Utorid</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Suspicious</th>
          <th>Created By</th>
          <th>Remark</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {transactions.length === 0 ? (
          <tr><td colSpan="8" style={{ textAlign: "center" }}>No transactions</td></tr>
        ) : (
          transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.utorid}</td>
              <td>{t.type}</td>
              <td>{t.amount !== undefined ? t.amount : "-"}</td>
              <td>{t.suspicious ? "Yes" : "No"}</td>
              <td>{t.createdBy}</td>
              <td>{t.remark}</td>
              <td>
                <button onClick={() => onView(t.id)}>View</button>
                 {t.type === "purchase" && (
                    <button
                    style={{ marginLeft: "10px", background: "orange" }}
                    onClick={() => onToggleSuspicious(t.id, t.suspicious)}
                    >
                    {t.suspicious ? "Unflag" : "Flag"}
                    </button>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
