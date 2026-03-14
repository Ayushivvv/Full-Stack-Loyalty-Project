import { useEffect, useState } from "react";
import { getMyTransactionsFiltered } from "../../api/transaction";
import TransactionCard from "./UserTransactionCard";

export default function UserTransactionList() {
  const [filters, setFilters] = useState({
    type: "",
    amount: "",
    operator: ""
  });

  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


  function updateFilter(field, value) {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  function resetFilters() {
    setFilters({
      type: "",
      amount: "",
      operator: ""
    });
    setPage(1);
    loadFiltered(1, limit);
  }

  async function loadFiltered(p = page, l = limit) {
    setLoading(true);

    try {
      const data = await getMyTransactionsFiltered({
        ...filters,
        page: p,
        limit: l
      });

      setTransactions(data.results || data.transactions || []);
      setCount(data.count || data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiltered(1, limit);
    // eslint-disable-next-line
  }, []);

  const handleApply = () => {
    setPage(1);
    loadFiltered(1, limit);
  };

  useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);


  const handlePrev = () => {
    if (page <= 1) return;
    const next = page - 1;
    setPage(next);
    loadFiltered(next, limit);
  };

  const handleNext = () => {
    const maxPage = Math.ceil(count / limit) || 1;
    if (page >= maxPage) return;
    const next = page + 1;
    setPage(next);
    loadFiltered(next, limit);
  };

  const inputStyle = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "14px",
  width: "70%",
  outline: "none",
};


  return (
    <div style={{ width: "100%", padding: isMobile ? "0 10px" : "0" }}>

      <h2>My Transactions</h2>

          {/* FILTER SECTION */}
    <div
      style={{
        width: "100%",
        marginBottom: "32px",
        padding: "22px 15px",
        background: "linear-gradient(135deg, #f5f7fa, #e4ebf5)",
        borderRadius: "18px",
        boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
      }}
    >
      <h3
        style={{
          marginBottom: "18px",
          fontSize: "20px",
          textAlign: "center",
        }}
      >
        Filter Transactions
      </h3>

     <div
  style={{
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : "repeat(5, minmax(0, 1fr))", 
    gap: "16px",
    alignItems: "center",
    width: "100%",       
    maxWidth: "100%",    
    margin: "0",
    marginLeft: 0,  
    marginRight: 0,  
  }}
>


        {/* TYPE */}
        <select
          value={filters.type}
          onChange={(e) => updateFilter("type", e.target.value)}
          style={inputStyle}
        >
          <option value="">All Types</option>
          <option value="purchase">Purchase</option>
          <option value="redemption">Redemption</option>
          <option value="adjustment">Adjustment</option>
          <option value="transfer">Transfer</option>
          <option value="event">Event</option>
        </select>

        {/* AMOUNT */}
        <input
          type="number"
          placeholder="Amount"
          value={filters.amount}
          onChange={(e) => updateFilter("amount", e.target.value)}
          style={inputStyle}
        />

        {/* OPERATOR */}
        <select
          value={filters.operator}
          onChange={(e) => updateFilter("operator", e.target.value)}
          style={inputStyle}
        >
          <option value="">Op</option>
          <option value="gte">≥</option>
          <option value="lte">≤</option>
        </select>

        {/* APPLY */}
        <button
          onClick={handleApply}
          style={{
            padding: "10px 18px",
            width: isMobile ? "70%" : "auto",
            borderRadius: "10px",
            border: "none",
            background: "#4f73ff",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Apply
        </button>

        {/* RESET */}
        <button
          onClick={resetFilters}
          style={{
            padding: "10px 18px",
            width: isMobile ? "70%" : "auto",
            borderRadius: "10px",
            border: "none",
            background: "#4f73ff",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
    </div>


      {/* LIST */}
      {loading ? (
        <p>Loading Transactions...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 350px)",
              columnGap: isMobile ? "16px" : "100px",
              rowGap: isMobile ? "22px" : "40px",
            }}
          >

            {transactions.map((t) => (
              <TransactionCard key={t.id} transaction={t} />
            ))}
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div
        style={{
          marginTop: 25,
          display: "flex",
          gap: 10,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <button onClick={handlePrev} disabled={page <= 1}>
          Previous
        </button>

        <span>
          Page {page} of {Math.max(1, Math.ceil(count / limit))}
        </span>

        <button
          onClick={handleNext}
          disabled={page >= Math.ceil(count / limit)}
        >
          Next
        </button>
      </div>
    </div>
  );
}