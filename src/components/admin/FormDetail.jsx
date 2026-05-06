import React from "react";

const FormDetail = ({ formData, onInputChange,setFormData }) => {

  const handleDeveloperModeChange = (e) => {
  const value = e.target.checked;

  setFormData((prev) => ({
    ...prev,
    otherSettings: {
      ...prev.otherSettings,
      developer_mode: value,
    },
  }));
};
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols gap-4">
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Form Title
          </label>
          <input
            name="formTitle"
            value={formData.formTitle}
            onChange={onInputChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-3"
            placeholder="Enter form title"
          />
        </div>
        {/* <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Tradeshow Name
          </label>
          <input
            name="tradeshowName"
            value={formData.showName || ""}
            onChange={onInputChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-3"
            placeholder="Enter tradeshow name"
          />
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Contact Name
          </label>
          <input
            name="contactName"
            value={formData.contactName}
            onChange={onInputChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-3"
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Contact Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={onInputChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-3"
            placeholder="name@email.com"
          />
          <br></br>
          <span>Separate multiple emails with commas.</span>
        </div>
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Contact Phone
          </label>
          <div className="mt-1 flex gap-2">
            {/* Phone Number */}
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9+\-\s()]/g, "");
                onInputChange({
                  target: { name: "contactPhone", value: cleaned },
                });
              }}
              className="flex-1 rounded border border-slate-300 px-3 py-3"
              placeholder="+1 (555) 000-0000"
            />

            {/* Extension */}
            <input
              type="text"
              name="contactExt"
              value={formData.contactExt}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "");
                onInputChange({
                  target: { name: "contactExt", value: cleaned },
                });
              }}
              className="w-24 rounded border border-slate-300 px-3 py-3"
              placeholder="266"
            />
          </div>
        </div>
      <div className="mt-6 flex items-center gap-3">
  <input
    type="checkbox"
    id="developerMode"
    name="developerMode"
    checked={formData.otherSettings?.developer_mode ?? false}
    onChange={handleDeveloperModeChange}
    className="h-4 w-4 rounded border-slate-300"
  />

  <label
    htmlFor="developerMode"
    className="flex items-center gap-2 text-base font-medium text-black"
  >
    Developer Mode
    <span className="text-sm text-slate-400">
      (Fixed CAD 5 invoice when enabled for live testing)
    </span>
  </label>
</div>

      </div>
    </>
  );
};

export default FormDetail;
