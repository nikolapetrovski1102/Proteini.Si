import { useEffect, useState } from "react";
import { api } from "../../services/api";

const emptyForm = {
  id: 0,
  type: "shop",
  name: "",
  city: "",
  address: "",
  phone: "",
  email: "makedonija@proteini.si",
  workingHoursMonFri: "10:00 - 22:00",
  workingHoursSat: "Closed",
  workingHoursSun: "Closed",
  coordinates: "",
  displayOrder: 0,
  isActive: true,
};

export default function AdminBranchLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await api.getAllBranchLocations();
      setLocations(response.data || []);
    } catch (error) {
      alert(error.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : name === "displayOrder"
            ? Number(value)
            : value,
    }));
  };

  const handleEdit = (location) => {
    setEditing(location);
    setFormData({
      id: location.id,
      type: location.type,
      name: location.name || "",
      city: location.city || "",
      address: location.address || "",
      phone: location.phone || "",
      email: location.email || "",
      workingHoursMonFri: location.workingHoursMonFri || "",
      workingHoursSat: location.workingHoursSat || "",
      workingHoursSun: location.workingHoursSun || "",
      coordinates: location.coordinates || "",
      displayOrder: location.displayOrder || 0,
      isActive: location.isActive !== false,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.updateBranchLocation(formData);
      } else {
        await api.createBranchLocation(formData);
      }
      resetForm();
      await fetchLocations();
    } catch (error) {
      alert(error.message || "Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (location) => {
    if (!window.confirm(`Delete ${location.name}?`)) return;

    setSaving(true);
    try {
      await api.deleteBranchLocation(location.id);
      await fetchLocations();
    } catch (error) {
      alert(error.message || "Failed to delete location");
    } finally {
      setSaving(false);
    }
  };

  const currentLocations = locations.filter((location) => location.type === formData.type);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Branch Locations
            </h1>
            <p className="text-sm text-gray-500">
              Add shops and partners shown on the locations page.
            </p>
          </div>
          <button
            onClick={resetForm}
            className="border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            New Location
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleSubmit} className="bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              {editing ? "Edit location" : "Add location"}
            </h2>

            <div className="space-y-3">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2"
              >
                <option value="shop">Shop</option>
                <option value="gym">Partner</option>
              </select>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Name"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Address"
                rows="3"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="workingHoursMonFri"
                value={formData.workingHoursMonFri}
                onChange={handleChange}
                placeholder="Monday - Friday"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="workingHoursSat"
                value={formData.workingHoursSat}
                onChange={handleChange}
                placeholder="Saturday"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="workingHoursSun"
                value={formData.workingHoursSun}
                onChange={handleChange}
                placeholder="Sunday"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                name="coordinates"
                value={formData.coordinates}
                onChange={handleChange}
                placeholder="Coordinates or map search text"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                placeholder="Display order"
                className="w-full border border-gray-300 px-3 py-2"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>

            <button
              disabled={saving}
              className="mt-4 w-full bg-[#2096D8] px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Location"}
            </button>
          </form>

          <div className="bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">
                {formData.type === "shop" ? "Shops" : "Partners"}
              </h2>
            </div>
            {loading ? (
              <div className="p-6 text-gray-500">Loading...</div>
            ) : currentLocations.length === 0 ? (
              <div className="p-6 text-gray-500">No locations yet.</div>
            ) : (
              <div className="divide-y">
                {currentLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex flex-wrap items-start justify-between gap-4 p-5"
                  >
                    <div>
                      <h3 className="font-semibold">{location.name}</h3>
                      <p className="text-sm text-gray-600">
                        {location.address}
                      </p>
                      <p className="text-xs text-gray-500">
                        {location.city} | {location.phone}
                      </p>
                      {!location.isActive && (
                        <span className="mt-2 inline-block bg-gray-100 px-2 py-1 text-xs uppercase text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(location)}
                        className="border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(location)}
                        className="border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
