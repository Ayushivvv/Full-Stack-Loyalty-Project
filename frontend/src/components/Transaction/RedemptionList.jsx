import RedemptionCard from "./RedemptionCard";

export default function RedemptionList({ transactions, reload }) {
  if (transactions.length === 0) {
    return <p>No pending redemptions.</p>;
  }

  return (
    <div>
      {transactions.map(tx => (
        <RedemptionCard 
          key={tx.id} 
          transaction={tx} 
          reload={reload} 
        />
      ))}
    </div>
  );
}
