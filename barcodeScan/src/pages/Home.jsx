import React from "react";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { QRCodeSVG } from "qrcode.react";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState(null);
  const [quantity, setQuantity] = useState(1);

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

    const found = products.find(
      (item) => String(item["Primary Code"]).trim() === scannedCode,
    );

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
            <div className="border-[3px] border-slate-800 rounded-lg overflow-hidden text-slate-800">
              <div className="grid grid-cols-2">
                <div className="bg-white-100 p-3 font-bold border-r-[3px] border-b-[3px] border-slate-800">
                  Code
                </div>
                <div className="p-3 border-b-[3px] border-slate-800 font-semibold">
                  {result["Primary Code"]}
                </div>

                <div className="bg-white-100 p-3 font-bold border-r-[3px] border-b-[3px] border-slate-800">
                  Size
                </div>
                <div className="p-3 border-b-[3px] border-slate-800 font-semibold">
                  {result.Size}
                </div>

                <div className="bg-white-100 p-3 font-bold border-r-[3px] border-b-[3px] border-slate-800">
                  Grade
                </div>
                <div className="p-3 border-b-[3px] border-slate-800 font-semibold">
                  {result.Grade}
                </div>

                <div className="bg-white-100 p-3 font-bold border-r-[3px] border-slate-800">
                  Roll
                </div>
                <div className="p-3 font-semibold">{quantity}</div>
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
              disabled={!quantity || Number(quantity) < 1}
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
