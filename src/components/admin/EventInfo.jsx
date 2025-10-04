import React, { useMemo, useEffect } from "react";

const EventInfo = ({ formData, onInputChange, setFormData }) => {
  const logoPreview = useMemo(() => {
    if (formData.companyLogo instanceof File) {
      return URL.createObjectURL(formData.companyLogo);
    }
    return null;
  }, [formData.companyLogo]);

  // 👉 Auto-calculate rental days whenever dates/times change
  useEffect(() => {
    if (
      formData.loadInDate &&
      formData.loadInTime &&
      formData.finishDate &&
      formData.finishTime
    ) {
      const start = new Date(`${formData.loadInDate}T${formData.loadInTime}`);
      const end = new Date(`${formData.finishDate}T${formData.finishTime}`);

      if (!isNaN(start) && !isNaN(end) && end >= start) {
        const diffMs = end - start;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); 
        setFormData((prev) => ({
          ...prev,
          rentalDays: diffDays,
        }));
      }
    }
  }, [
    formData.loadInDate,
    formData.loadInTime,
    formData.finishDate,
    formData.finishTime,
    setFormData,
  ]);

  return (
    <>
      {/* Company Information */}
      <h3 className="font-bold text-2xl mb-4">Company Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Company Name
          </label>
          <input
            name="companyName"
            value={formData.companyName}
            onChange={onInputChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-3"
            placeholder="Company Inc."
          />
        </div>
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Company Logo
          </label>
          <div className="mt-1 flex items-center gap-3">
            {(logoPreview || formData?.companyLogoUrl) && (
              <img
                src={logoPreview || formData.companyLogoUrl}
                alt="Company Logo"
                className="h-12 w-12 object-contain border rounded"
              />
            )}

            <input
              type="file"
              name="companyLogo"
              accept="image/*"
              onChange={onInputChange}
              className="w-full rounded border border-slate-300 px-3 py-3 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Show Information */}
      <h3 className="font-bold text-2xl mt-6 mb-4">Show Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Show Name
          </label>
          <input
            name="showName"
            value={formData.showName}
            onChange={onInputChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-3"
            placeholder="Show name"
          />
        </div>
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Facility
          </label>
          <input
            name="facility"
            value={formData.facility}
            onChange={onInputChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-3"
            placeholder="Facility"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-base lg:text-lg text-black font-medium">
            Room
          </label>
          <input
            name="room"
            value={formData.room}
            onChange={onInputChange}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-3"
            placeholder="Room"
          />
        </div>

        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Load in Date
          </label>
          <div className="relative mt-1">
            <input
              type="date"
              name="loadInDate"
              value={formData.loadInDate}
              onChange={onInputChange}
              className="w-full rounded border border-slate-300 px-3 py-3"
            />
          </div>
        </div>
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Load in Time
          </label>
          <div className="relative mt-1">
            <input
              type="time"
              name="loadInTime"
              value={formData.loadInTime}
              onChange={onInputChange}
              className="w-full rounded border border-slate-300 px-3 py-3"
            />
          </div>
        </div>

        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Start Date
          </label>
          <div className="relative mt-1">
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={onInputChange}
              className="w-full rounded border border-slate-300 px-3 py-3"
            />
          </div>
        </div>
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Start Time
          </label>
          <div className="relative mt-1">
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={onInputChange}
              className="w-full rounded border border-slate-300 px-3 py-3"
            />
          </div>
        </div>

        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Finish Date
          </label>
          <div className="relative mt-1">
            <input
              type="date"
              name="finishDate"
              value={formData.finishDate}
              onChange={onInputChange}
              className="w-full rounded border border-slate-300 px-3 py-3"
            />
          </div>
        </div>
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Finish Time
          </label>
          <div className="relative mt-1">
            <input
              type="time"
              name="finishTime"
              value={formData.finishTime}
              onChange={onInputChange}
              className="w-full rounded border border-slate-300 px-3 py-3"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EventInfo;