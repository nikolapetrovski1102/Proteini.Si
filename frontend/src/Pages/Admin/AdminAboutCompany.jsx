import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function AdminAboutCompany() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sectionType: "paragraph",
    title: "",
    videoUrl: "",
    content: "",
    displayOrder: 0,
    createdBy: "",
  });
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // Fetch all sections on component mount
  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await api.getAllAboutCompanySections();
      setSections(data);
    } catch (error) {
      console.error("Error fetching sections:", error);
      alert("Failed to fetch about company sections");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large. Maximum 5MB allowed.");
        return;
      }

      setSelectedThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
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
      sectionType: "paragraph",
      title: "",
      videoUrl: "",
      content: "",
      displayOrder: 0,
      createdBy: "",
    });
    setSelectedThumbnailFile(null);
    setThumbnailPreview("");
    setEditingSection(null);
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = api.getUser();
      const sectionData = {
        sectionType: formData.sectionType,
        title: formData.title || null,
        videoUrl: formData.videoUrl || null,
        content: formData.content || null,
        displayOrder: formData.displayOrder,
        createdBy: user?.fullName || user?.email || "Admin",
      };

      if (selectedThumbnailFile) {
        sectionData.videoThumbnail = selectedThumbnailFile;
      }

      await api.createAboutCompanySection(sectionData);
      alert("Section created successfully");
      resetForm();
      fetchSections();
    } catch (error) {
      console.error("Error creating section:", error);
      alert("Failed to create section");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = api.getUser();
      const sectionData = {
        id: editingSection.id,
        sectionType: formData.sectionType,
        title: formData.title || null,
        videoUrl: formData.videoUrl || null,
        content: formData.content || null,
        displayOrder: formData.displayOrder,
        isActive: editingSection.isActive,
        updatedBy: user?.fullName || user?.email || "Admin",
      };

      if (selectedThumbnailFile) {
        sectionData.videoThumbnail = selectedThumbnailFile;
      }

      await api.updateAboutCompanySection(sectionData);
      alert("Section updated successfully");
      resetForm();
      fetchSections();
    } catch (error) {
      console.error("Error updating section:", error);
      alert("Failed to update section");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      sectionType: section.sectionType,
      title: section.title || "",
      videoUrl: section.videoUrl || "",
      content: section.content || "",
      displayOrder: section.displayOrder,
      createdBy: "",
    });
    if (section.videoThumbnailPath) {
      setThumbnailPreview(section.videoThumbnailPath);
    }
    setSelectedThumbnailFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?"))
      return;

    setLoading(true);
    try {
      await api.deleteAboutCompanySection(id);
      alert("Section deleted successfully");
      fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (section) => {
    try {
      const user = api.getUser();
      await api.updateAboutCompanySection({
        id: section.id,
        sectionType: section.sectionType,
        title: section.title,
        videoUrl: section.videoUrl,
        content: section.content,
        displayOrder: section.displayOrder,
        isActive: !section.isActive,
        updatedBy: user?.fullName || user?.email || "Admin",
      });
      fetchSections();
    } catch (error) {
      console.error("Error toggling section:", error);
      alert("Failed to update section status");
    }
  };

  const moveUp = async (index) => {
    if (index === 0) return;

    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];

    const reorderData = newSections.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    try {
      await api.reorderAboutCompanySections(reorderData);
      fetchSections();
    } catch (error) {
      console.error("Failed to reorder:", error);
      fetchSections();
    }
  };

  const moveDown = async (index) => {
    if (index === sections.length - 1) return;

    const newSections = [...sections];
    [newSections[index + 1], newSections[index]] = [
      newSections[index],
      newSections[index + 1],
    ];

    const reorderData = newSections.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    try {
      await api.reorderAboutCompanySections(reorderData);
      fetchSections();
    } catch (error) {
      console.error("Failed to reorder:", error);
      fetchSections();
    }
  };

  const getSectionTypeLabel = (type) => {
    switch (type) {
      case "video":
        return "🎬 Video";
      case "title":
        return "📌 Title";
      case "subtitle":
        return "📝 Subtitle";
      case "paragraph":
        return "📄 Paragraph";
      case "award":
        return "🏆 Award";
      case "business-cooperation":
        return "🤝 Business Cooperation";
      default:
        return type;
    }
  };

  const getSectionTypeColor = (type) => {
    switch (type) {
      case "video":
        return "bg-purple-100 text-purple-700";
      case "title":
        return "bg-blue-100 text-blue-700";
      case "subtitle":
        return "bg-green-100 text-green-700";
      case "paragraph":
        return "bg-yellow-100 text-yellow-700";
      case "award":
        return "bg-red-100 text-red-700";
      case "business-cooperation":
        return "bg-cyan-100 text-cyan-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const usesImageUpload =
    formData.sectionType === "video" ||
    formData.sectionType === "business-cooperation";

  if (loading && !sections.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading sections...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            About Company Management
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#e98286] hover:bg-[#d47175] text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Add New Section
          </button>
        </div>

        {/* Sections List */}
        {sections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No sections found. Click "Add New Section" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
                  !section.isActive ? "opacity-60 bg-gray-100" : ""
                }`}
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
                        disabled={index === 0}
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
                        disabled={index === sections.length - 1}
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

                  {/* Type badge */}
                  <div className="flex-shrink-0">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getSectionTypeColor(section.sectionType)}`}
                    >
                      {getSectionTypeLabel(section.sectionType)}
                    </span>
                  </div>

                  {/* Content preview */}
                  <div className="flex-1 min-w-0">
                    {section.title && (
                      <h3 className="font-semibold text-gray-800 truncate">
                        {section.title}
                      </h3>
                    )}
                    {section.content && (
                      <p className="text-sm text-gray-600 truncate">
                        {section.content.substring(0, 100)}
                        {section.content.length > 100 ? "..." : ""}
                      </p>
                    )}
                    {section.videoUrl && (
                      <p className="text-sm text-gray-500 truncate">
                        🎥 {section.videoUrl}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Order: {section.displayOrder} | Created:{" "}
                      {new Date(section.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status toggle */}
                  <button
                    onClick={() => toggleActive(section)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      section.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                    }`}
                  >
                    {section.isActive ? "Active" : "Inactive"}
                  </button>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(section)}
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
                      onClick={() => handleDelete(section.id)}
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingSection ? "Edit Section" : "Add New Section"}
              </h2>
              <form onSubmit={editingSection ? handleUpdate : handleCreate}>
                <div className="space-y-4">
                  {/* Section Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section Type *
                    </label>
                    <select
                      name="sectionType"
                      value={formData.sectionType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                    >
                      <option value="video">🎬 Video</option>
                      <option value="title">📌 Title</option>
                      <option value="subtitle">📝 Subtitle</option>
                      <option value="paragraph">📄 Paragraph</option>
                      <option value="award">🏆 Award</option>
                      <option value="business-cooperation">
                        🤝 Business Cooperation
                      </option>
                    </select>
                  </div>

                  {/* Title (for title, subtitle, video, award types) */}
                  {(formData.sectionType === "title" ||
                    formData.sectionType === "subtitle" ||
                    formData.sectionType === "video" ||
                    formData.sectionType === "award" ||
                    formData.sectionType === "business-cooperation") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title{" "}
                        {formData.sectionType === "video" ? "(Optional)" : "*"}
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required={formData.sectionType !== "video"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                        placeholder="Enter title..."
                      />
                    </div>
                  )}

                  {/* Video URL (for video type only) */}
                  {usesImageUpload && (
                    <>
                      {formData.sectionType === "video" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            YouTube Video URL
                          </label>
                          <input
                            type="url"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                            placeholder="https://www.youtube.com/embed/beU6PhV2fqA"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use embed URL format:
                            https://www.youtube.com/embed/VIDEO_ID
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {formData.sectionType === "business-cooperation"
                            ? "Business Cooperation Image"
                            : "Video Thumbnail (Optional)"}
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {thumbnailPreview ? (
                            <div>
                              <img
                                src={thumbnailPreview}
                                alt="Thumbnail Preview"
                                className="max-h-32 mx-auto mb-2 rounded object-contain"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedThumbnailFile(null);
                                  setThumbnailPreview("");
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
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                onChange={handleThumbnailSelect}
                                className="hidden"
                                id="thumbnail-upload"
                              />
                              <label
                                htmlFor="thumbnail-upload"
                                className="cursor-pointer text-[#e98286] hover:text-[#d47175]"
                              >
                                Click to upload thumbnail
                              </label>
                              <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG, GIF, WEBP. Max 5MB.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Content (for paragraph and award types) */}
                  {(formData.sectionType === "paragraph" ||
                    formData.sectionType === "award" ||
                    formData.sectionType === "business-cooperation") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content *
                      </label>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        required
                        rows="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                        placeholder="Enter content here..."
                      />
                    </div>
                  )}

                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
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
                    className="flex-1 px-4 py-2 bg-[#e98286] text-white rounded-lg hover:bg-[#d47175] disabled:opacity-50"
                  >
                    {uploadingImage
                      ? "Uploading..."
                      : loading
                        ? "Saving..."
                        : editingSection
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
