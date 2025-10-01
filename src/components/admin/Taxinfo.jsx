import React, { useEffect, useRef, useState } from "react";
import {
  FaBan,
  FaPercent,
  FaReceipt,
  FaCalendarDays,
  FaFileInvoiceDollar,
  FaSliders,
  FaCircleCheck,
} from "react-icons/fa6";

const presetOptions = [
  { key: "none", label: "No Tax", icon: FaBan, rate: 0 },
  { key: "gst5", label: "GST 5%", icon: FaPercent, rate: 5, sub: "Standard goods & services" },
  { key: "gst12", label: "GST 12%", icon: FaReceipt, rate: 12, sub: "Selected categories" },
  { key: "gst18", label: "GST 18%", icon: FaCalendarDays, rate: 18, sub: "Common services" },
  { key: "vat20", label: "VAT 20%", icon: FaFileInvoiceDollar, rate: 20, sub: "Value-added tax" },
  { key: "custom", label: "Custom", icon: FaSliders, rate: null, custom: true },
];

const Taxes = ({ formData, setFormData }) => {
  // Parse tax safely
  let taxObj = {};
  if (formData.otherSettings?.tax) {
    if (typeof formData.otherSettings.tax === "string") {
      try {
        taxObj = JSON.parse(formData.otherSettings.tax);
      } catch (err) {
        taxObj = {};
        console.error("Failed to parse tax:", err);
      }
    } else if (typeof formData.otherSettings.tax === "object" && !Array.isArray(formData.otherSettings.tax)) {
      taxObj = formData.otherSettings.tax;
    }
  }

  const currentTaxName = Object.keys(taxObj)[0] || "none";
  const currentTaxRate = currentTaxName in taxObj ? taxObj[currentTaxName] : 0;

  const [selectedKey, setSelectedKey] = useState(
    presetOptions.find((o) => o.label === currentTaxName)?.key ||
    (presetOptions.some((o) => o.custom && currentTaxName !== "none") ? "custom" : "none")
  );
  const [customName, setCustomName] = useState(
    !presetOptions.some((o) => o.label === currentTaxName) && currentTaxName !== "none"
      ? currentTaxName
      : ""
  );
  const [customRate, setCustomRate] = useState(
    !presetOptions.some((o) => o.label === currentTaxName) && currentTaxName !== "none"
      ? Number(currentTaxRate) || 0
      : 0
  );

  const customNameRef = useRef(null);
  const customRateRef = useRef(null);

  // Update formData when selection changes
  useEffect(() => {
    if (selectedKey === "custom") {
      if (!customName) return;
      setFormData((prev) => ({
        ...prev,
        otherSettings: {
          ...prev.otherSettings,
          tax: { [customName]: Number(customRate) || 0 },
        },
      }));
    } else {
      const opt = presetOptions.find((o) => o.key === selectedKey);
      if (opt) {
        const labelName = opt.key === "none" ? "none" : opt.label;
        setFormData((prev) => ({
          ...prev,
          otherSettings: { ...prev.otherSettings, tax: { [labelName]: opt.rate ?? 0 } },
        }));
      }
    }
  }, [selectedKey, customName, customRate, setFormData]);

  useEffect(() => {
    if (selectedKey === "custom") customNameRef.current?.focus();
  }, [selectedKey]);

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-2xl">Taxes</h3>
        <span className="inline-flex items-center gap-2 text-base px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
          <FaReceipt /> Configure tax for this order
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex items-center justify-between">
          <div className="text-base text-black font-medium">Choose a tax preset</div>
          <span className="text-base text-slate-500">Single-select</span>
        </div>

        <div className="p-5 grid gap-3 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 mobile-tax-box">
          {presetOptions.map((opt) => {
            const checked = selectedKey === opt.key;
            const Icon = opt.icon;
            return (
              <div
                key={opt.key}
                onClick={() => setSelectedKey(opt.key)}
                className={`group relative cursor-pointer rounded-lg border p-4 transition-all ${
                  checked
                    ? "border-brand-600 bg-brand-50 shadow-md"
                    : "border-slate-200 hover:shadow-md hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded grid place-items-center ${
                      checked
                        ? "bg-brand-600 text-white"
                        : opt.custom
                        ? "bg-brand-50 text-brand-700"
                        : opt.key === "none"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-brand-50 text-brand-700"
                    }`}
                  >
                    <Icon />
                  </div>
                  <div className="w-full">
                    <div className={`font-semibold text-xl ${checked ? "text-brand-700" : "text-slate-800"}`}>
                      {opt.label}
                    </div>
                    {opt.sub && <div className="text-base text-slate-500">{opt.sub}</div>}

                    {opt.custom && checked && (
                      <div className="mt-2 flex lg:flex-row flex-col items-start lg:items-center gap-2">
                        <input
                          ref={customNameRef}
                          className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-base"
                          placeholder="Label (e.g., City Tax)"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            ref={customRateRef}
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-base"
                            placeholder="Rate %"
                            value={customRate}
                            onChange={(e) => setCustomRate(e.target.value)}
                          />
                          <span className="text-base text-slate-500">%</span>
                        </div>
                      </div>
                    )}

                    {opt.key === "none" && <div className="text-base text-slate-500">Rate: 0%</div>}
                  </div>
                </div>

                {checked && <div className="absolute right-3 top-3 text-brand-600 text-2xl"><FaCircleCheck /></div>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Taxes;
