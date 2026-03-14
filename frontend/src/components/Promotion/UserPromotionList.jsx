import React, { useEffect, useState } from "react";
import { getPromotions } from "../../api/promotions";
import PromotionCard from "./UserPromotionCard";

export default function PromotionList() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [count, setCount] = useState(0);

  // MOBILE DETECTION
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function loadPromotions(p = page, l = limit) {
    setLoading(true);
    try {
      const data = await getPromotions({ page: p, limit: l });
      setPromotions(data.results || data.promotions || []);
      setCount(data.count || data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPromotions(1, limit);
    // eslint-disable-next-line
  }, []);

  const handlePrev = () => {
    if (page <= 1) return;
    const next = page - 1;
    setPage(next);
    loadPromotions(next, limit);
  };

  const handleNext = () => {
    const maxPage = Math.ceil(count / limit) || 1;
    if (page >= maxPage) return;
    const next = page + 1;
    setPage(next);
    loadPromotions(next, limit);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading promotions...</p>;

  return (
    <div style={{ padding: "16px" }}>
      <h2 style={{ textAlign: "center" }}>Available Promotions</h2>

      {/* ✅ FORCED RESPONSIVE GRID */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 350px)",
            columnGap: isMobile ? "12px" : "100px",  
    rowGap: isMobile ? "20px" : "40px", 
            marginTop: "20px"
          }}
        >
          {promotions.map((p) => (
            <PromotionCard key={p.id} promo={p} />
          ))}
        </div>
      </div>

      {/* ✅ PAGINATION */}
      <div
        style={{
          marginTop: 30,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <button onClick={handlePrev} disabled={page <= 1}>
          Previous
        </button>

        <span style={{ whiteSpace: "nowrap" }}>
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
