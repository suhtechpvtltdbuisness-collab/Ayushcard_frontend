import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import ThermalReceiptContent from "./ThermalReceiptContent";
import { buildReceiptViewModel, fetchFullReceiptCard } from "./receiptLoader";

const AyushCardReceiptPreview = ({ card, className = "", previewScale = 1.5 }) => {
  const [loadedCard, setLoadedCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchFullReceiptCard(card).then((enriched) => {
      if (active) {
        setLoadedCard(enriched);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [card?.id, card?._id, card?._rawCard?._id, card?.receiptNo]);

  const vm = useMemo(
    () => (loadedCard ? buildReceiptViewModel(loadedCard) : null),
    [loadedCard],
  );

  if (loading || !vm) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 text-gray-400 ${className}`}>
        <Loader2 size={24} className="animate-spin text-[#F68E5F] mb-2" />
        <p className="text-xs font-semibold">Loading receipt...</p>
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="origin-top"
        style={{
          transform: `scale(${previewScale})`,
          marginBottom: `${Math.max(0, (previewScale - 1) * 420)}px`,
        }}
      >
        <ThermalReceiptContent {...vm} />
      </div>
    </div>
  );
};

export default AyushCardReceiptPreview;
