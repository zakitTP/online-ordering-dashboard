import React from "react";

const FormDetail = ({ formData, onInputChange }) => {
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
      inputMode="tel"
      name="contactPhone"
      value={formData.contactPhone}
      onChange={onInputChange}
      className="flex-1 rounded border border-slate-300 px-3 py-3"
      placeholder="+1 (555) 000-0000"
    />
    {/* Extension */}
    <input
      inputMode="numeric"
      name="contactExt"
      value={formData.contactExt}
      onChange={onInputChange}
      className="w-24 rounded border border-slate-300 px-3 py-3"
      placeholder="x266"
    />
  </div>
</div>

      </div>
    </>
  );
};

export default FormDetail;
