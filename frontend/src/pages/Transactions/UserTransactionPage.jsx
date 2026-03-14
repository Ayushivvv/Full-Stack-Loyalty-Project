import UserTransactionList from "../../components/Transaction/UserTransactionList";

export default function TransactionPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Transactions</h1>
      <UserTransactionList />
    </div>
  );
}
