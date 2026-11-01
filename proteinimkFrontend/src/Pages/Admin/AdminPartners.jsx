import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("partners"); // "partners" or "awards"
  const [formData, setFormData] = useState({
    type: "partner",
    name: "",
    url: "",
    displayOrder: 0,
    createdBy: "",
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Fetch all items on component mount
  useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    setLoading(true);
    try {
      const data = await api.getAllPartners();
      // Separate partners and awards
      const partnersList = data.filter((item) => item.type === "partner");
      const awardsList = data.filter((item) => item.type === "award");
      setPartners(partnersList);
      setAwards(awardsList);
    } catch (error) {
      console.error("Error fetching items:", error);
      alert("Failed to fetch partners and awards");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          "Invalid file type. Only JPG, PNG, GIF, WEBP, and SVG are allowed.",
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large. Maximum 5MB allowed.");
        return;
      }

      setSelectedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? parseInt(value) || 0 : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      type: activeTab === "partners" ? "partner" : "award",
      name: "",
      url: "",
      displayOrder: 0,
      createdBy: "",
    });
    setSelectedImageFile(null);
    setImagePreview("");
    setEditingItem(null);
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!selectedImageFile) {
        alert("Please select an image");
        setLoading(false);
        return;
      }

      const user = api.getUser();
      const itemData = {
        type: formData.type,
        name: formData.name,
        url: formData.url || null,
        displayOrder: formData.displayOrder,
        image: selectedImageFile,
        createdBy: user?.fullName || user?.email || "Admin",
      };
      await api.createPartner(itemData);
      alert(
        `${formData.type === "partner" ? "Partner" : "Award"} created successfully`,
      );
      resetForm();
      fetchAllItems();
    } catch (error) {
      console.error("Error creating item:", error);
      alert("Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = api.getUser();
      const itemData = {
        id: editingItem.id,
        type: formData.type,
        name: formData.name,
        url: formData.url || null,
        displayOrder: formData.displayOrder,
        isActive: editingItem.isActive,
        updatedBy: user?.fullName || user?.email || "Admin",
      };

      if (selectedImageFile) {
        itemData.image = selectedImageFile;
      }

      await api.updatePartner(itemData);
      alert(
        `${formData.type === "partner" ? "Partner" : "Award"} updated successfully`,
      );
      resetForm();
      fetchAllItems();
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      name: item.name,
      url: item.url || "",
      displayOrder: item.displayOrder,
      createdBy: "",
    });
    setImagePreview(item.imagePath);
    setSelectedImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;

    setLoading(true);
    try {
      await api.deletePartner(id);
      alert(`${type === "partner" ? "Partner" : "Award"} deleted successfully`);
      fetchAllItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  const moveUp = async (items, index, type) => {
    if (index === 0) return;

    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [
      newItems[index],
      newItems[index - 1],
    ];

    const reorderData = newItems.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    try {
      await api.reorderPartners(reorderData);
      fetchAllItems();
    } catch (error) {
      console.error("Failed to reorder:", error);
      fetchAllItems();
    }
  };

  const moveDown = async (items, index, type) => {
    if (index === items.length - 1) return;

    const newItems = [...items];
    [newItems[index + 1], newItems[index]] = [
      newItems[index],
      newItems[index + 1],
    ];

    const reorderData = newItems.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    try {
      await api.reorderPartners(reorderData);
      fetchAllItems();
    } catch (error) {
      console.error("Failed to reorder:", error);
      fetchAllItems();
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) {
      return `https://proteini.mk${imagePath}`;
    }
    return imagePath;
  };

  const currentItems = activeTab === "partners" ? partners : awards;
  const itemType = activeTab === "partners" ? "partner" : "award";

  if (loading && !partners.length && !awards.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Partners & Awards Management
          </h1>
          <button
            onClick={() => {
              setFormData({
                ...formData,
                type: activeTab === "partners" ? "partner" : "award",
              });
              setShowForm(true);
            }}
            className="bg-[#2096D8] hover:bg-[#1A7AB3] text-white px-4 py-2 transition-colors"
          >
            + Add New {activeTab === "partners" ? "Partner" : "Award"}
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("partners")}
            className={`px-6 py-2 font-semibold transition-all ${
              activeTab === "partners"
                ? "bg-[#2096D8] text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Partners
          </button>
          <button
            onClick={() => setActiveTab("awards")}
            className={`px-6 py-2 font-semibold transition-all ${
              activeTab === "awards"
                ? "bg-[#2096D8] text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            Awards & Certificates
          </button>
        </div>

        {/* Items Grid */}
        {currentItems.length === 0 ? (
          <div className="bg-white shadow p-8 text-center">
            <p className="text-gray-500">
              No {activeTab === "partners" ? "partners" : "awards"} found. Click
              "Add New" to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {currentItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative h-32 bg-gray-100 flex items-center justify-center p-4">
                  <img
                    src={getImageUrl(item.imagePath)}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'%3E%3C/rect%3E%3Cpath d='M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5'%3E%3C/path%3E%3C/svg%3E";
                      e.target.onerror = null;
                    }}
                  />
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">
                    {item.name}
                  </h3>
                  {item.url && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {item.url}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Order: {item.displayOrder}
                  </p>
                  <p className="text-xs text-gray-400">
                    Status: {item.isActive ? "Active" : "Inactive"}
                  </p>
                </div>

                {/* Actions */}
                <div className="p-3 pt-0 flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 px-2 py-1 bg-[#2096D8] hover:bg-[#1A7AB3] text-white text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.type)}
                    className="flex-1 px-2 py-1 bg-red-500 text-white hover:bg-red-600 text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* Reorder buttons */}
                <div className="flex gap-2 p-3 pt-0">
                  <button
                    onClick={() => moveUp(currentItems, index, item.type)}
                    disabled={index === 0}
                    className="flex-1 px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ↑ Move Up
                  </button>
                  <button
                    onClick={() => moveDown(currentItems, index, item.type)}
                    disabled={index === currentItems.length - 1}
                    className="flex-1 px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ↓ Move Down
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingItem ? "Edit" : "Add New"}{" "}
                {activeTab === "partners" ? "Partner" : "Award"}
              </h2>
              <form onSubmit={editingItem ? handleUpdate : handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2096D8]"
                      placeholder="e.g., Mol, OMV, DM, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {imagePreview ? (
                        <div>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-32 mx-auto mb-2 rounded object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImageFile(null);
                              setImagePreview("");
                            }}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer text-[#2096D8] hover:text-[#1A7AB3]"
                          >
                            Click to upload image
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, GIF, WEBP, SVG. Max 5MB.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL (optional)
                    </label>
                    <input
                      type="url"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2096D8]"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2096D8]"
                      min="0"
                      placeholder="0 = first position"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className="flex-1 px-4 py-2 bg-[#2096D8] hover:bg-[#1A7AB3] text-white rounded-lg disabled:opacity-50"
                  >
                    {uploadingImage
                      ? "Uploading..."
                      : loading
                        ? "Saving..."
                        : editingItem
                          ? "Update"
                          : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
