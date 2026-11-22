import React, { useMemo } from "react";
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
  const isValidBarcode = (code) => {
    const barcodePattern = /^\d{6}E-SA-\d{2}-\d{2}[A-Z]\|\d{5}\|P$/;

    return code.length === 25 && barcodePattern.test(code);
  };
  const handleScan = (e) => {
    e.preventDefault();

    const scannedCode = barcode.trim();

    if (!scannedCode) return;

    // 1. Reject duplicate scans
    const isDuplicate = totalRoll.some((item) => item === scannedCode);

    if (isDuplicate) {
      alert("REJECTED: This item has already been scanned!");
      setBarcode("");
      return;
    }

    // 2. Extract item code
    const scannedItemCode = scannedCode.split("|")[1];

    if (!scannedItemCode) {
      setBarcode("");
      return;
    }
    // 3. Check if product code matches previous scans
    if (totalRoll.length > 0) {
      const existingItemCode = totalRoll[0].split("|")[1];

      if (scannedItemCode !== existingItemCode) {
        alert(
          `REJECTED: Different product code!\n\nExpected: ${existingItemCode}\nScanned: ${scannedItemCode}`,
        );
        setBarcode("");
        return;
      }
    }

    // 3. Find product in Excel (Grade and Size)
    const found = products.find(
      (item) => String(item["Primary Code"]).trim() === scannedItemCode,
    );

    if (!found) {
      alert("Product not found!");
      setBarcode("");
      return;
    }
    if (!isValidBarcode(scannedCode)) {
      alert("REJECTED: Invalid barcode length or format!");
      setBarcode("");
      return;
    }
    // 4. Add scanned barcode
    setTotalRoll((prev) => [...prev, scannedCode]);

    // 5. Update product information
    setResult(found);

    setBarcode("");
  };

  const oldestRoll = useMemo(() => {
    if (totalRoll.length === 0) return "";

    return [...totalRoll].sort((a, b) => {
      const dateA = a.split("|")[0].slice(0, 6);
      const dateB = b.split("|")[0].slice(0, 6);

      return dateA.localeCompare(dateB);
    })[0];
  }, [totalRoll]);

  const oldestDate = oldestRoll
    ? `20${oldestRoll.split("|")[0].slice(0, 6)}`
    : "";

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
          <div className="result-container mt-6">
            {/* Printable Area */}
            <div className="print-area mx-auto p-3 bg-white">
              <div className="border-[3px] border-slate-800 rounded-lg overflow-hidden text-slate-800">
                <div className="grid grid-cols-[1fr_3fr]">
                  {/* Grade */}
                  <div className="bg-slate-100 px-3 py-5 font-bold border-r-[3px] border-b-[3px] border-slate-800 text-xl uppercase">
                    Grade
                  </div>
                  <div className="px-3 py-5 border-b-[3px] border-slate-800 flex items-center justify-center font-semibold text-2xl uppercase">
                    {result.Grade}
                  </div>

                  {/* Size */}
                  <div className="bg-slate-100 px-3 py-5 font-bold border-r-[3px] border-b-[3px] border-slate-800 text-xl uppercase">
                    Size
                  </div>
                  <div className="px-3 py-5 border-b-[3px] border-slate-800 flex items-center justify-center font-semibold text-2xl uppercase">
                    {result.Size}
                  </div>

                  {/* Roll */}
                  <div className="bg-slate-100 px-3 py-5 font-bold border-r-[3px] border-b-[3px] border-slate-800 text-xl uppercase">
                    Qty
                  </div>
                  <div className="px-3 py-5 border-b-[3px] border-slate-800 flex items-center justify-center font-semibold text-2xl uppercase">
                    {quantity !== "" ? quantity : totalRoll.length} Roll
                  </div>
                  {/* rack number */}
                  <div className="bg-slate-100 px-3 py-5 font-bold border-r-[3px] border-b-[3px] border-slate-800 text-xl uppercase">
                    Rack
                  </div>
                  <div className="px-3 py-5 border-b-[3px] border-slate-800 flex items-center justify-center font-extrabold text-2xl uppercase">
                    <strong>{result.Rack_no}</strong>
                  </div>

                  {/* Code */}
                  <div className="bg-slate-100 px-3 py-5 font-bold border-r-[3px] border-slate-800 text-xl uppercase">
                    Lot
                  </div>
                  <div className="px-3 py-5 flex items-center justify-center font-semibold text-2xl uppercase">
                    {oldestDate}
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400"
              />
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              disabled={Number(quantity || totalRoll.length) < 1}
              className="print-button w-full mt-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50"
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
