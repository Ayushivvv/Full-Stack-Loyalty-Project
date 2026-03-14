import { processRedemption } from "../../api/transaction";

export default function RedemptionCard({ transaction, reload }) {
  async function handleProcess() {
    try {
      await processRedemption(transaction.id);
      alert("Redemption processed!");
      reload(); // refresh list
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "12px",
      marginBottom: "12px"
    }}>
      <p><b>User:</b> {transaction.utorid}</p>
      <p><b>Points to Redeem:</b> {transaction.amount}</p>
      <p><b>Remark:</b> {transaction.remark}</p>

      <button onClick={handleProcess}>
         Process Redemption
      </button>
    </div>
  );
}
