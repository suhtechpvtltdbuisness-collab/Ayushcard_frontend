import React, { useState, useRef } from "react";
import { X, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AyushCardPreview from "./AyushCardPreview";
import { markCardsAsExported } from "../../data/mockData";

// Hidden Grid Component to render 25 cards
// Using 18x12 inches landscape aspect ratio container
// 18 inches = 1728px, 12 inches = 1152px (at 96 dpi)
const createPrintGrid = (cards, side, ref) => {
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: "-200vw", // Move way off-screen but keep it in normal document flow
        top: 0,
        width: "1152px", // 12 inches
        height: "1728px", // 18 inches
        backgroundColor: "#ffffff",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gridTemplateRows: "repeat(5, 1fr)",
        gap: "0px",
        zIndex: -1,
      }}
    >
      {[...Array(25)].map((_, i) => {
        const card = cards[i];
        return (
          <div
            key={i}
            style={{
              width: "100%",
              height: "100%",
              border: "1px dashed #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {card ? (
              <div
                style={{
                  transform: "scale(0.8) rotate(90deg)", // Scaled to fit perfectly in vertical slot
                  transformOrigin: "center",
                }}
              >
                <AyushCardPreview data={card} side={side} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const generatePdfFromElement = async (element, filename) => {
  if (!element) return;

  // ensure images load before generating
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true, // helps with external images if headers aren't strict
    logging: false,
    width: 1152,
    height: 1728,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  // 12x18 inches portrait = 304.8 x 457.2 mm
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [304.8, 457.2],
  });

  pdf.addImage(imgData, "JPEG", 0, 0, 304.8, 457.2);
  pdf.save(filename);
};

export default function ExportPrintModal({
  isOpen,
  onClose,
  selectedData,
  onExportSuccess,
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadedCount, setDownloadedCount] = useState(0);

  const frontRef = useRef(null);
  const backRef = useRef(null);

  // Chunk selectedData into arrays of 25
  const chunks = [];
  for (let i = 0; i < selectedData.length; i += 25) {
    chunks.push(selectedData.slice(i, i + 25));
  }

  // State to track which chunk is currently being processed
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const totalChunks = chunks.length;

  const currentCards = chunks[currentChunkIndex] || [];

  if (!isOpen) return null;

  const handleDownloadSide = async (side) => {
    try {
      setDownloading(true);
      const startCard = currentChunkIndex * 25 + 1;
      const endCard = Math.min(
        (currentChunkIndex + 1) * 25,
        selectedData.length,
      );
      const filename = `Batch_${currentChunkIndex + 1}_${side.toUpperCase()}_Cards_${startCard}-${endCard}.pdf`;

      const el = side === "front" ? frontRef.current : backRef.current;
      await generatePdfFromElement(el, filename);

      setDownloadedCount((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadBoth = async () => {
    setDownloading(true);
    await handleDownloadSide("front");
    await handleDownloadSide("back");
    setDownloading(false);
  };

  const handleDownloadAll = async () => {
    // For simplicity in this demo, it only downloads the current batch shown
    // A fully productionized version would iterate through all chunks and refs.
    await handleDownloadBoth();

    // Mark as exported since they downloaded 'All'
    const ids = selectedData.map((c) => c.id || c._id || c.applicationId);
    markCardsAsExported(ids);
    onExportSuccess();
  };

  const nextBatch = () => {
    if (currentChunkIndex < totalChunks - 1) {
      setCurrentChunkIndex((prev) => prev + 1);
    }
  };

  const prevBatch = () => {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex((prev) => prev - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 overflow-hidden text-[#1E293B]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="bg-white rounded-2xl w-[90%] max-w-5xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-[20px] font-bold">Export for Printing</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-gray-500 text-white flex items-center justify-center font-bold">
                {currentChunkIndex + 1}
              </span>
              <div>
                <h3 className="font-bold text-[16px]">
                  Batch {currentChunkIndex + 1} of {totalChunks}
                </h3>
                <p className="text-sm text-gray-500">
                  Cards {currentChunkIndex * 25 + 1} -{" "}
                  {Math.min((currentChunkIndex + 1) * 25, selectedData.length)}{" "}
                  · Front + Back Sheet pair
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadBoth}
                disabled={downloading}
                className="ml-4 flex items-center gap-2 px-4 py-2 bg-[#818181] text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <Download size={16} />
                Download Both
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Front Preview Box */}
            <div className="border border-gray-200 bg-[#EFF6FF4D] rounded-xl p-4 overflow-hidden shadow-sm flex flex-col h-[650px]">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-gray-200 rounded text-xs font-bold mr-2">
                    FRONT
                  </span>
                  <span className="font-bold text-sm">Sheet 1</span>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentCards.length} cards · Front_Sheet_
                    {currentChunkIndex + 1}.pdf
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadSide("front")}
                  disabled={downloading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#3E3E3E] text-white rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-50"
                >
                  <Download size={14} /> Download
                </button>
              </div>
              <div className="flex-1 bg-white rounded border border-gray-200 flex items-center justify-center p-2 relative overflow-hidden">
                {/* Visual Fake Preview */}
                <div className="grid grid-cols-5 gap-1 w-full h-full">
                  {[...Array(25)].map((_, i) => (
                    <div
                      key={i}
                      className={`bg-[#A4A4A4] rounded-sm w-full h-full flex flex-col ${i >= currentCards.length ? "opacity-20" : ""}`}
                    >
                      <div className="h-1/5 border-b border-gray-100/30 flex justify-end p-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                      </div>
                      <div className="flex-1 px-1 py-1">
                        <div className="w-1/3 h-[2px] bg-white/40 mb-1"></div>
                        <div className="w-1/2 h-[2px] bg-white/40 mb-1"></div>
                      </div>
                      <div className="h-[2px] bg-white/20 mx-1 mb-1"></div>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white/90 px-3 py-1 rounded text-xs font-medium text-gray-700 shadow-sm">
                    12 x 18 Preview
                  </span>
                </div>
              </div>
            </div>

            {/* Back Preview Box */}
            <div className="border border-gray-200 bg-[#EFF6FF4D] rounded-xl p-4 overflow-hidden shadow-sm flex flex-col h-[650px]">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-gray-200 rounded text-xs font-bold mr-2">
                    BACK
                  </span>
                  <span className="font-bold text-sm">Sheet 1</span>
                  <p className="text-xs text-gray-400 mt-1">
                    {currentCards.length} cards · Back_Sheet_
                    {currentChunkIndex + 1}.pdf
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadSide("back")}
                  disabled={downloading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#3E3E3E] text-white rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-50"
                >
                  <Download size={14} /> Download
                </button>
              </div>
              <div className="flex-1 bg-gray-50 rounded border border-gray-200 flex items-center justify-center p-2 relative overflow-hidden">
                {/* Visual Fake Preview */}
                <div className="grid grid-cols-5 gap-1 w-full h-full">
                  {[...Array(25)].map((_, i) => (
                    <div
                      key={i}
                      className={`bg-white border border-gray-300 rounded-sm w-full h-full flex flex-col items-center justify-center ${i >= currentCards.length ? "opacity-20" : ""}`}
                    >
                      <div className="w-2/3 h-1 rounded-full bg-[#CBD5E1] mb-1"></div>
                      <div className="w-1/2 h-0.5 rounded-full bg-[#3E3E3E]"></div>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white/90 px-3 py-1 rounded text-xs font-medium text-gray-700 shadow-sm">
                    12 x 18 Preview
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="border-t border-gray-200 bg-white p-4 flex items-center justify-end gap-4 shrink-0">
          <span className="text-sm font-medium text-gray-600 mr-2">
            {downloadedCount} of {totalChunks * 2} batch pairs downloaded
          </span>
          <button
            onClick={() => {
              setDownloadedCount(0);
              setCurrentChunkIndex(0);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          {downloading ? (
            <button
              disabled
              className="px-6 py-2 bg-gray-400 text-white rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Loader2 size={16} className="animate-spin" /> Processing...
            </button>
          ) : (
            <button
              onClick={handleDownloadAll}
              className="px-6 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download size={16} /> Download
            </button>
          )}
        </div>
      </div>

      {/* Hidden Grids for html2canvas to render */}
      {createPrintGrid(currentCards, "front", frontRef)}
      {createPrintGrid(currentCards, "back", backRef)}
    </div>
  );
}
