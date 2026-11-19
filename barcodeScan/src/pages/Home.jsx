import React from "react";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { QRCodeSVG } from "qrcode.react";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [barcode, setBarcode] = useState(" ");
  const [result, setResult] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [totalRoll, setTotalRoll] = useState([]);

  // Load Excel file
  useEffect(() => {
    const loadExcel = async () => {
      const response = await fetch("/Book1.xlsx");

      const data = await response.arrayBuffer();

      const workbook = XLSX.read(data, {
        type: "array",
        raw: true,
      });

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      setProducts(json);
    };

    loadExcel();
  }, []);

  const handleScan = (e) => {
    e.preventDefault();

    const scannedCode = barcode.trim();
    // Check if barcode already exists

    const isDuplicate = totalRoll.some((item) => item === scannedCode);
    if (isDuplicate) {
      alert("REJECTED: This item has already been scanned!");
      return;
    }

    const scannedItemCode = scannedCode.split("|")[1];
    if (!scannedItemCode) {
      setBarcode("");
      return;
    }

    const found = products.find(
      (item) => String(item["Primary Code"]).trim() === scannedItemCode,
    );

    setTotalRoll((prev) => [...prev, scannedCode]);

    setResult(found || null);
    setBarcode("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-linear-to-br from-blue-100 via-blue-200 to-slate-100">
      {/* Glassmorphism Card */}
      <div
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl
      bg-white/50 backdrop-blur-xl
      border border-white/70
      shadow-[0_15px_40px_rgba(30,64,175,0.12)]"
      >
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-8">
          Barcode Lookup
        </h1>

        <form onSubmit={handleScan}>
          <input
            className="w-full px-4 py-4 rounded-xl
            bg-white/80 border border-slate-200
            text-slate-800 placeholder-slate-400
            outline-none transition-all duration-200
            focus:border-blue-400
            focus:ring-4 focus:ring-blue-500/10"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan barcode..."
            autoFocus
          />
        </form>

        {result ? (
          <div className="print-area mt-6 p-5 rounded-2xl bg-white/50 border border-white/60">
            {/* Vertical Product Grid */}

            <div className="print-area mt-6 p-3 rounded-2xl bg-white/50 border border-white/60">
              <div className="border-[3px] border-slate-800 rounded-lg overflow-hidden text-slate-800">
                <div className="grid grid-cols-[1fr_3fr]">
                  {/* Grade */}
                  <div className="bg-slate-100 px-3 py-5 font-bold border-r-[3px] border-b-[3px] border-slate-800 text-2xl uppercase">
                    Grade
                  </div>
                  <div className="px-3 py-5 border-b-[3px] border-slate-800 flex items-center justify-center font-semibold text-2xl uppercase">
                    {result.Grade}
                  </div>

                  {/* Size */}
                  <div className="bg-slate-100 px-3 py-5 font-bold border-r-[3px] border-b-[3px] border-slate-800 text-2xl uppercase">
                    Size
                  </div>
                  <div className="px-3 py-5 border-b-[3px] border-slate-800 flex items-center justify-center font-semibold text-2xl uppercase">
                    {result.Size}
                  </div>

                  {/* Code */}
                  <div className="bg-slate-100 px-3 py-5 font-bold border-r-[3px] border-b-[3px] border-slate-800 text-2xl uppercase">
                    Code
                  </div>
                  <div className="px-3 py-5 border-b-[3px] border-slate-800 flex items-center justify-center font-semibold text-2xl uppercase">
                    {result["Primary Code"]}
                  </div>

                  {/* Roll */}
                  <div className="bg-slate-100 px-3 py-5 font-bold border-r-[3px] border-slate-800 text-2xl uppercase">
                    Roll
                  </div>
                  <div className="px-3 py-5 flex items-center justify-center font-semibold text-2xl uppercase">
                    {quantity !== "" ? quantity : totalRoll.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="quantity-input mt-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200
        bg-white text-slate-800 outline-none
        focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400"
              />
            </div>

            {/* Printable Quantity */}

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              disabled={Number(quantity || totalRoll.length) < 1}
              className="print-button w-full mt-5 py-3 rounded-xl
      bg-blue-600 hover:bg-blue-700
      text-white font-semibold transition
      disabled:opacity-50"
            >
              Print
            </button>
          </div>
        ) : (
          barcode === "" && (
            <p className="text-sm text-slate-500 text-center mt-6">
              Scan a barcode to search.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
