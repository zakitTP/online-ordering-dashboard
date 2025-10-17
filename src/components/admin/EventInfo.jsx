import React, { useMemo, useEffect, useState } from "react";

const EventInfo = ({ formData, onInputChange, setFormData }) => {
  const [logoError, setLogoError] = useState("");
  const [dateError, setDateError] = useState("");

  // ✅ Generate logo preview
  const logoPreview = useMemo(() => {
    if (formData.companyLogo instanceof File) {
      return URL.createObjectURL(formData.companyLogo);
    }
    return null;
  }, [formData.companyLogo]);

  // ✅ Handle logo upload with inline error
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
     if (!file) return;
    if (!file.type.match("image.*")) {
      setLogoError("Please select an image file!");
      e.target.value = "";
      return;
    }
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSize) {
        setLogoError("File size must be less than 5 MB");
        e.target.value = ""; // Reset input
        return;
      }
      setLogoError("");
      onInputChange(e);
    }
  };

  // ✅ Handle room input changes
  const handleRoomChange = (index, value) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms[index] = value;
    setFormData(prev => ({
      ...prev,
      rooms: updatedRooms
    }));
  };


  // ✅ Add new room field
  const addRoom = () => {
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, ""]
    }));
  };

  // ✅ Remove room field
  const removeRoom = (index) => {
    if (formData.rooms.length > 1) {
      const updatedRooms = formData.rooms.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        rooms: updatedRooms
      }));
    }
  };

  // ✅ Auto-calculate rental days and validate date order
  useEffect(() => {
    const { loadInDate, loadInTime, startDate, startTime, finishDate, finishTime } = formData;

    const loadIn = loadInDate && loadInTime ? new Date(`${loadInDate}T${loadInTime}`) : null;
    const start = startDate && startTime ? new Date(`${startDate}T${startTime}`) : null;
    const finish = finishDate && finishTime ? new Date(`${finishDate}T${finishTime}`) : null;

    // Reset error before checking
    setDateError("");

    // Start cannot be before load-in
    if (start && loadIn && start < loadIn) {
      setDateError("Start date/time cannot be before load-in date/time.");
      setFormData((prev) => ({
        ...prev,
        startDate: "",
        startTime: "",
      }));
      return;
    }

    // Finish cannot be before start
    if (finish && start && finish < start) {
      setDateError("Finish date/time cannot be before start date/time.");
      setFormData((prev) => ({
        ...prev,
        finishDate: "",
        finishTime: "",
      }));
      return;
    }

    // Auto-calculate rental days
    if (start && finish && finish >= start) {
      const diffMs = finish - start;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      setFormData((prev) => ({
        ...prev,
        rentalDays: diffDays,
      }));
    }
  }, [
    formData.loadInDate,
    formData.loadInTime,
    formData.startDate,
    formData.startTime,
    formData.finishDate,
    formData.finishTime,
    setFormData,
  ]);

  // Initialize rooms array if not present
  useEffect(() => {
    if (!formData.rooms || formData.rooms.length === 0) {
      setFormData(prev => ({
        ...prev,
        rooms: [""] // Start with one empty room by default
      }));
    }
  }, [setFormData]);

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
          {logoError && <p className="text-red-500 text-sm mt-1">{logoError}</p>}
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
              onChange={handleLogoChange} // ✅ custom handler
              className="w-full rounded border border-slate-300 px-3 py-3 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Show Information */}
      <h3 className="font-bold text-2xl mt-6 mb-4">Show Information</h3>
      {dateError && <p className="text-red-500 text-sm mb-2">{dateError}</p>}

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

        {/* Rooms Repeater Field */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <label className="text-base lg:text-lg text-black font-medium">
              Venue Address
            </label>
            <button
              type="button"
              onClick={addRoom}
              className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              + Add Room
            </button>
          </div>
          
          <div className="space-y-3">
            {formData?.rooms &&
            formData?.rooms?.map((room, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  value={room}
                  onChange={(e) => handleRoomChange(index, e.target.value)}
                  className="flex-1 rounded border border-slate-300 px-3 py-3"
                  placeholder={`Building-Room ${index + 1}`}
                />
                {formData?.rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRoom(index)}
                    className="px-3 py-3 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Load-In Fields */}
        <div>
          <label className="text-base lg:text-lg text-black font-medium">
            Load-In Date
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
            Load-In Time
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

        {/* Start Fields */}
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
              min={formData.loadInDate || ""} // ✅ Restrict before load-in
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

        {/* Finish Fields */}
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
              min={formData.startDate || ""} // ✅ Restrict before start
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