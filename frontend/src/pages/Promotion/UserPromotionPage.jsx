import React from 'react';
import PromotionList from "../../components/Promotion/UserPromotionList";
import '../../promotionStyling.css';

export default function PromotionPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Promotions</h1>
      <PromotionList />
    </div>
  );
}
