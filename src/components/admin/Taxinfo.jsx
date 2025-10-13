import React, { useEffect, useRef, useState } from "react";
import { FaBan, FaPercent, FaReceipt, FaSliders, FaCircleCheck } from "react-icons/fa6";

const presetOptions = [
  { key: "none", label: "No Tax", icon: FaBan, rate: 0 },
  { key: "ab_gst", label: "AB GST (5%)", icon: FaPercent, rate: 5 },
  { key: "bc_gst", label: "BC GST (5%)", icon: FaPercent, rate: 5 },
  { key: "gst_only", label: "GST ONLY (5%)", icon: FaPercent, rate: 5 },
  { key: "hst_on", label: "HST ON (13%)", icon: FaReceipt, rate: 13 },
  { key: "mb_gst", label: "MB GST (5%)", icon: FaPercent, rate: 5 },
  { key: "nb_hst", label: "NB HST (15%)", icon: FaReceipt, rate: 15 },
  { key: "nl_hst", label: "NL HST (15%)", icon: FaReceipt, rate: 15 },
  { key: "ns_hst", label: "NS HST (14%)", icon: FaReceipt, rate: 14 },
  { key: "nu_gst", label: "NU GST (5%)", icon: FaPercent, rate: 5 },
  { key: "nw_gst", label: "NW GST (5%)", icon: FaPercent, rate: 5 },
  { key: "pe_hst", label: "PE HST (15%)", icon: FaReceipt, rate: 15 },
  { key: "qc_gst", label: "QC GST (5%)", icon: FaPercent, rate: 5 },
  { key: "sk_gst", label: "SK GST (5%)", icon: FaPercent, rate: 5 },
  { key: "yt_gst", label: "YT GST (5%)", icon: FaPercent, rate: 5 },
  { key: "custom", label: "Custom Tax", icon: FaSliders, rate: null, custom: true },
];

const Taxes = ({ formData, setFormData, setTaxSelected }) => {
  const [selectedKey, setSelectedKey] = useState("");
  const [customName, setCustomName] = useState("Custom"); // ✅ Default "Custom"
  const [customRate, setCustomRate] = useState("0"); // ✅ Default 0

  const customNameRef = useRef(null);
  const customRateRef = useRef(null);

  // Initialize selected tax from formData
  useEffect(() => {
    const taxObj = formData.otherSettings?.tax || {};
    const taxEntries = Object.entries(taxObj);

    if (taxEntries.length === 0) {
      setSelectedKey("none");
      return;
    }

    const [label, rate] = taxEntries[0];

    const preset = presetOptions.find((opt) => opt.label === label);
    if (preset) {
      setSelectedKey(preset.key);
    } else {
      setSelectedKey("custom");
      setCustomName(label || "Custom");
      setCustomRate(rate?.toString() || "0");
    }
  }, [formData.otherSettings?.tax]);

  // Focus custom name input only once when selected
  useEffect(() => {
    if (selectedKey === "custom") {
      customNameRef.current?.focus();
    }
  }, [selectedKey]);

  // Update formData whenever tax inputs change
  useEffect(() => {
    if (!selectedKey) return;

    if (selectedKey === "custom") {
      const rate = parseFloat(customRate) || 0;
      setFormData((prev) => ({
        ...prev,
        otherSettings: {
          ...prev.otherSettings,
          tax: { [customName || "Custom"]: rate },
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

    setTaxSelected(true);
  }, [selectedKey, customName, customRate, setFormData, setTaxSelected]);

 

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

                    {opt.custom && checked && (
                      <div className="mt-2 flex lg:flex-row flex-col items-start lg:items-center gap-2 overflow-hidden">
                        <input
                          ref={customNameRef}
                          className="w-40 rounded-lg border border-slate-300 px-2 py-1 text-base"
                          placeholder="Label (e.g., City Tax)"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            ref={customRateRef}
                            type="number"
                            className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-base"
                            placeholder="Rate %"
                            value={customRate}
                            onChange={(e)=>setCustomRate(e.target.value)}
                          />
                          <span className="text-base text-slate-500">%</span>
                        </div>
                      </div>
                    )}

                    {opt.key === "none" && <div className="text-base text-slate-500">Rate: 0%</div>}
                  </div>
                </div>

                {checked && (
                  <div className="absolute right-3 top-3 text-brand-600 text-2xl">
                    <FaCircleCheck />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Taxes;
