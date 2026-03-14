export default function TransactionFilters({ filters, updateFilter }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      <div>
        <label>Utorid</label>
        <input
          name="name"
          value={filters.name}
          onChange={updateFilter}
          placeholder="Search utorid or author name"
        />
      </div>

      <div>
        <label>Type</label>
        <select name="type" value={filters.type} onChange={updateFilter}>
          <option value="">Any</option>
          <option value="purchase">Purchase</option>
          <option value="redemption">Redemption</option>
          <option value="adjustment">Adjustment</option>
          <option value="transfer">Transfer</option>
          <option value="event">Event</option>
        </select>
      </div>

      <div>
        <label>Suspicious</label>
        <select name="suspicious" value={filters.suspicious} onChange={updateFilter}>
          <option value="">Any</option>
          <option value="true">Suspicious</option>
          <option value="false">Not suspicious</option>
        </select>
      </div>

      <div>
        <label>Amount</label>
        <input
          name="amount"
          type="number"
          value={filters.amount}
          onChange={updateFilter}
          placeholder="e.g. 50"
        />
      </div>

      <div>
        <label>Operator</label>
        <select name="operator" value={filters.operator} onChange={updateFilter}>
          <option value="">Any</option>
          <option value="gte">≥</option>
          <option value="lte">≤</option>
        </select>
      </div>
    </div>
  );
}
