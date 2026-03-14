export default function UserTransactionFilters({ filters, onChange, onReset, onApply }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>

      <select
        name="type"
        value={filters.type}
        onChange={onChange}
      >
        <option value="">All Types</option>
        <option value="purchase">Purchase</option>
        <option value="redemption">Redemption</option>
        <option value="adjustment">Adjustment</option>
        <option value="transfer">Transfer</option>
      </select>

      <select
        name="operator"
        value={filters.operator}
        onChange={onChange}
      >
        <option value="">Operator</option>
        <option value="gte">≥</option>
        <option value="lte">≤</option>
        <option value="eq">=</option>
      </select>

      <input
        type="number"
        name="amount"
        placeholder="Points"
        value={filters.amount}
        onChange={onChange}
      />

      <button onClick={onApply}>Apply</button>
      <button onClick={onReset}>Reset</button>
    </div>
  );
}
