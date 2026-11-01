import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function AdminGallery() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    image: null,
    mobileImage: null,
    clickUrl: "",
    previewUrl: null,
    mobilePreviewUrl: null,
  });
  const [editForm, setEditForm] = useState({
    clickUrl: "",
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Fetch all sliders
  const fetchSliders = async () => {
    try {
      setLoading(true);
      const data = await api.getAllHomeSliders();
      // Sort by display order
      const sorted = data.sort((a, b) => a.displayOrder - b.displayOrder);
      setSliders(sorted);
      setError(null);
    } catch (err) {
      setError("Failed to load sliders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Handle file selection for upload
  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === "desktop") {
        setUploadForm({
          ...uploadForm,
          image: file,
          previewUrl: previewUrl,
        });
      } else {
        setUploadForm({
          ...uploadForm,
          mobileImage: file,
          mobilePreviewUrl: previewUrl,
        });
      }
    }
  };

  // Handle upload form change
  const handleUploadChange = (e) => {
    setUploadForm({
      ...uploadForm,
      [e.target.name]: e.target.value,
    });
  };

  // Submit new slider
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.image) {
      alert("Please select a desktop image");
      return;
    }

    setUploading(true);
    try {
      await api.uploadHomeSlider(
        uploadForm.image,
        uploadForm.mobileImage || null,
        uploadForm.clickUrl || null,
      );
      await fetchSliders();
      setShowUploadModal(false);
      setUploadForm({
        image: null,
        mobileImage: null,
        clickUrl: "",
        previewUrl: null,
        mobilePreviewUrl: null,
      });
    } catch (err) {
      alert("Failed to upload slider: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  // Open edit modal
  const openEditModal = (slider) => {
    setSelectedSlider(slider);
    setEditForm({
      clickUrl: slider.clickUrl || "",
      isActive: slider.isActive,
    });
    setShowEditModal(true);
  };

  // Submit edit
  const handleEdit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.updateHomeSlider(selectedSlider.id, {
        clickUrl: editForm.clickUrl,
        title: selectedSlider.title,
        isActive: editForm.isActive,
      });
      await fetchSliders();
      setShowEditModal(false);
      setSelectedSlider(null);
    } catch (err) {
      alert("Failed to update slider: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Delete slider
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this slider? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await api.deleteHomeSlider(id);
      await fetchSliders();
    } catch (err) {
      alert("Failed to delete slider: " + err.message);
    }
  };

  // Move slider up
  const moveUp = async (index) => {
    if (index === 0) return;

    setReordering(true);
    const newSliders = [...sliders];
    [newSliders[index - 1], newSliders[index]] = [
      newSliders[index],
      newSliders[index - 1],
    ];
    setSliders(newSliders);

    // Prepare reorder data
    const reorderData = newSliders.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    try {
      await api.reorderHomeSliders(reorderData);
      await fetchSliders(); // Refresh to get correct order from server
    } catch (err) {
      console.error("Failed to reorder:", err);
      await fetchSliders(); // Revert on error
    } finally {
      setReordering(false);
    }
  };

  // Move slider down
  const moveDown = async (index) => {
    if (index === sliders.length - 1) return;

    setReordering(true);
    const newSliders = [...sliders];
    [newSliders[index + 1], newSliders[index]] = [
      newSliders[index],
      newSliders[index + 1],
    ];
    setSliders(newSliders);

    // Prepare reorder data
    const reorderData = newSliders.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    try {
      await api.reorderHomeSliders(reorderData);
      await fetchSliders(); // Refresh to get correct order from server
    } catch (err) {
      console.error("Failed to reorder:", err);
      await fetchSliders(); // Revert on error
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading sliders...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Home Slider Management
          </h1>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-[#2096D8] hover:bg-[#007bff] text-white px-4 py-2 transition-colors"
          >
            + Add New Slide
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Reordering indicator */}
        {reordering && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded mb-4 text-sm">
            Updating order...
          </div>
        )}

        {/* Sliders Grid */}
        {sliders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No sliders found. Click "Add New Slide" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sliders.map((slider, index) => (
              <div
                key={slider.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
              >
                <div className="flex items-center p-4 gap-4">
                  {/* Order number and reorder buttons */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400 font-medium">
                      #{index + 1}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0 || reordering}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === sliders.length - 1 || reordering}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Image preview */}
                  <div className="w-32 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={slider.imageUrl}
                      alt={`Slide ${slider.displayOrder}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          slider.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {slider.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-gray-400">
                        Order: {slider.displayOrder}
                      </span>
                    </div>
                    {slider.clickUrl && (
                      <p className="text-sm text-gray-600 truncate">
                        URL: {slider.clickUrl}
                      </p>
                    )}
                    {!slider.clickUrl && (
                      <p className="text-sm text-gray-400 italic">
                        No click URL set
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {slider.id} | Created:{" "}
                      {new Date(slider.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(slider)}
                      className="text-blue-600 hover:text-blue-800 p-2 transition-colors"
                      title="Edit"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(slider.id)}
                      className="text-red-600 hover:text-red-800 p-2 transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New Slide</h2>
              <form onSubmit={handleUpload}>
                {/* Image upload */}
                {/* Desktop Image upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desktop Image (required) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {uploadForm.previewUrl ? (
                      <div>
                        <img
                          src={uploadForm.previewUrl}
                          alt="Desktop Preview"
                          className="max-h-48 mx-auto mb-2 rounded"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setUploadForm({
                              ...uploadForm,
                              image: null,
                              previewUrl: null,
                            })
                          }
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleFileSelect(e, "desktop")}
                          className="hidden"
                          id="desktop-image-upload"
                        />
                        <label
                          htmlFor="desktop-image-upload"
                          className="cursor-pointer text-[#e98286] hover:text-[#d47175]"
                        >
                          Click to upload desktop image
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended: 1920x570px
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Image upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Image (optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {uploadForm.mobilePreviewUrl ? (
                      <div>
                        <img
                          src={uploadForm.mobilePreviewUrl}
                          alt="Mobile Preview"
                          className="max-h-48 mx-auto mb-2 rounded"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setUploadForm({
                              ...uploadForm,
                              mobileImage: null,
                              mobilePreviewUrl: null,
                            })
                          }
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleFileSelect(e, "mobile")}
                          className="hidden"
                          id="mobile-image-upload"
                        />
                        <label
                          htmlFor="mobile-image-upload"
                          className="cursor-pointer text-[#e98286] hover:text-[#d47175]"
                        >
                          Click to upload mobile image
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended: 800x400px. If not provided, desktop image
                          will be used.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Click URL */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Click URL (optional)
                  </label>
                  <input
                    type="url"
                    name="clickUrl"
                    value={uploadForm.clickUrl}
                    onChange={handleUploadChange}
                    placeholder="https://example.com/product"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty if you don't want the slide to be clickable.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadForm({
                        image: null,
                        clickUrl: "",
                        previewUrl: null,
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-[#e98286] text-white rounded-lg hover:bg-[#d47175] disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSlider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Slide</h2>
              <form onSubmit={handleEdit}>
                {/* Image preview */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Image
                  </label>
                  <img
                    src={selectedSlider.imageUrl}
                    alt="Current slide"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>

                {/* Click URL */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Click URL (optional)
                  </label>
                  <input
                    type="url"
                    name="clickUrl"
                    value={editForm.clickUrl}
                    onChange={handleEditChange}
                    placeholder="https://example.com/product"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                  />
                </div>

                {/* Active status */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={editForm.isActive}
                      onChange={handleEditChange}
                      className="w-4 h-4 text-[#e98286] focus:ring-[#e98286]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Active (visible on homepage)
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSlider(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-[#e98286] text-white rounded-lg hover:bg-[#d47175] disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Changes"}
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
