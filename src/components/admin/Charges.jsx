import React, { useEffect } from "react";

const Charges = ({ formData, setFormData }) => {
  
  // Ensure default delivery charge = 200
  useEffect(() => {
    if (
      !formData.otherSettings?.charges ||
      formData.otherSettings.charges.delivery === undefined
    ) {
      setFormData((prev) => ({
        ...prev,
        otherSettings: {
          ...prev.otherSettings,
          charges: {
            ...(prev.otherSettings?.charges || {}),
            delivery: 200, // default value
          },
        },
      }));
    }
  }, []);

  // Handle input update
  const handleDeliveryChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      otherSettings: {
        ...prev.otherSettings,
        charges: {
          ...(prev.otherSettings?.charges || {}),
          delivery: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-xl">Charges</h3>

      {/* Delivery Charges */}
      <div className="flex flex-col gap-2">
        <label className="font-medium text-gray-700">Delivery Charges</label>
        <input
          type="number"
          min="0"
          value={formData.otherSettings?.charges?.delivery ?? ""}
          onChange={handleDeliveryChange}
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Enter delivery charge"
        />
      </div>
    </div>
  );
};

export default Charges;
