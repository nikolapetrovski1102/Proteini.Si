import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { TfiClose } from "react-icons/tfi";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

export default function DynamicContentManager() {
  const [activePage, setActivePage] = useState("terms-of-service");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [formData, setFormData] = useState({
    page_Type: "terms-of-service",
    section_Type: "paragraph",
    title_Text: "",
    content_Text: "",
    display_Order: 0,
    isActive: true,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    text_Align: "left",
    font_Size: "normal",
    text_Color: "",
    margin_Top: 0,
    margin_Bottom: 15,
    padding_Top: 0,
    padding_Bottom: 0,
    custom_CSS_Class: "",
  });

  useEffect(() => {
    fetchSections();
  }, [activePage]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await api.getAllDynamicSectionsForAdmin(activePage);
      setSections(data);
    } catch (error) {
      console.error("Error fetching sections:", error);
      alert("Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const resetForm = () => {
    setEditingSection(null);
    setFormData({
      page_Type: activePage,
      section_Type: "paragraph",
      title_Text: "",
      content_Text: "",
      display_Order: sections.length,
      isActive: true,
      isBold: false,
      isItalic: false,
      isUnderline: false,
      text_Align: "left",
      font_Size: "normal",
      text_Color: "",
      margin_Top: 0,
      margin_Bottom: 15,
      padding_Top: 0,
      padding_Bottom: 0,
      custom_CSS_Class: "",
    });
  };

  const openEditModal = (section) => {
    setEditingSection(section);
    setFormData({
      page_Type: section.page_Type,
      section_Type: section.section_Type,
      title_Text: section.title_Text || "",
      content_Text: section.content_Text || "",
      display_Order: section.display_Order,
      isActive: section.isActive,
      isBold: section.isBold,
      isItalic: section.isItalic,
      isUnderline: section.isUnderline,
      text_Align: section.text_Align || "left",
      font_Size: section.font_Size || "normal",
      text_Color: section.text_Color || "",
      margin_Top: section.margin_Top || 0,
      margin_Bottom: section.margin_Bottom || 15,
      padding_Top: section.padding_Top || 0,
      padding_Bottom: section.padding_Bottom || 0,
      custom_CSS_Class: section.custom_CSS_Class || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingSection) {
        await api.updateDynamicSection({
          section_Id: editingSection.section_Id,
          ...formData,
        });
        alert("Section updated successfully!");
      } else {
        await api.createDynamicSection(formData);
        alert("Section created successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      fetchSections();
    } catch (error) {
      console.error("Error saving section:", error);
      alert("Failed to save section");
    }
  };

  const handleDelete = async (sectionId) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      await api.deleteDynamicSection(sectionId);
      alert("Section deleted successfully!");
      fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section");
    }
  };

  const moveSectionUp = async (index) => {
    if (index === 0) return;

    setReordering(true);
    const reorderedSections = [...sections];
    const temp = reorderedSections[index];
    reorderedSections[index] = reorderedSections[index - 1];
    reorderedSections[index - 1] = temp;

    // Update display orders
    const updatedSections = reorderedSections.map((section, idx) => ({
      section_Id: section.section_Id,
      display_Order: idx,
    }));

    setSections(reorderedSections);

    try {
      await api.reorderDynamicSections(updatedSections);
      fetchSections(); // Refresh to get updated orders from server
    } catch (error) {
      console.error("Error reordering sections:", error);
      alert("Failed to reorder sections");
      fetchSections(); // Reload to revert changes
    } finally {
      setReordering(false);
    }
  };

  const moveSectionDown = async (index) => {
    if (index === sections.length - 1) return;

    setReordering(true);
    const reorderedSections = [...sections];
    const temp = reorderedSections[index];
    reorderedSections[index] = reorderedSections[index + 1];
    reorderedSections[index + 1] = temp;

    // Update display orders
    const updatedSections = reorderedSections.map((section, idx) => ({
      section_Id: section.section_Id,
      display_Order: idx,
    }));

    setSections(reorderedSections);

    try {
      await api.reorderDynamicSections(updatedSections);
      fetchSections(); // Refresh to get updated orders from server
    } catch (error) {
      console.error("Error reordering sections:", error);
      alert("Failed to reorder sections");
      fetchSections(); // Reload to revert changes
    } finally {
      setReordering(false);
    }
  };

  const getSectionTypeLabel = (type) => {
    const types = {
      title: "Title",
      subtitle: "Subtitle",
      paragraph: "Paragraph",
      award: "Award",
      spacer: "Spacer",
    };
    return types[type] || type;
  };

  const getSectionTypeColor = (type) => {
    const colors = {
      title: "bg-purple-100 text-purple-700",
      subtitle: "bg-blue-100 text-blue-700",
      paragraph: "bg-gray-100 text-gray-700",
      award: "bg-yellow-100 text-yellow-700",
      spacer: "bg-orange-100 text-orange-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2096D8]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Dynamic Content Manager</h2>

        {/* Page Tabs */}
        <div className="flex gap-2 border-b mb-6">
          <button
            onClick={() => setActivePage("terms-of-service")}
            className={`px-4 py-2 font-medium transition-colors ${
              activePage === "terms-of-service"
                ? "text-[#2096D8] border-b-2 border-[#2096D8]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActivePage("general-provisions")}
            className={`px-4 py-2 font-medium transition-colors ${
              activePage === "general-provisions"
                ? "text-[#2096D8] border-b-2 border-[#2096D8]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            General Provisions
          </button>
        </div>

        {/* Add Section Button */}
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-[#2096D8] text-white px-4 py-2 hover:bg-[#1a7ab3] transition-colors"
          disabled={reordering}
        >
          + Add New Section
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={section.section_Id}
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveSectionUp(index)}
                      disabled={index === 0 || reordering}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <FiArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => moveSectionDown(index)}
                      disabled={index === sections.length - 1 || reordering}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <FiArrowDown size={16} />
                    </button>
                  </div>

                  {/* Section Type Badge */}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getSectionTypeColor(section.section_Type)} ${
                      !section.isActive ? "opacity-50" : ""
                    }`}
                  >
                    {getSectionTypeLabel(section.section_Type)}
                  </span>

                  {/* Order Number */}
                  <span className="text-xs text-gray-400">#{index + 1}</span>

                  {/* Title Preview */}
                  {section.title_Text && (
                    <span className="text-sm font-medium text-gray-700">
                      {section.title_Text}
                    </span>
                  )}
                </div>

                {/* Content Preview */}
                {section.content_Text && (
                  <p className="text-sm text-gray-600 ml-12 line-clamp-2">
                    {section.content_Text}
                  </p>
                )}

                {/* Styling Indicators */}
                <div className="flex gap-2 mt-2 ml-12">
                  {section.isBold && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      Bold
                    </span>
                  )}
                  {section.isItalic && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      Italic
                    </span>
                  )}
                  {section.isUnderline && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      Underline
                    </span>
                  )}
                  {section.text_Align !== "left" && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      Align: {section.text_Align}
                    </span>
                  )}
                  {!section.isActive && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(section)}
                  className="text-[#2096D8] hover:text-[#1a7ab3] text-sm px-3 py-1"
                  disabled={reordering}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(section.section_Id)}
                  className="text-red-500 hover:text-red-700 text-sm px-3 py-1"
                  disabled={reordering}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No sections added yet. Click "Add New Section" to get started.
        </div>
      )}

      {/* Modal for Add/Edit Section */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingSection ? "Edit Section" : "Add New Section"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <TfiClose size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Section Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Section Type *
                </label>
                <select
                  name="section_Type"
                  value={formData.section_Type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 outline-none focus:border-[#2096D8]"
                >
                  <option value="title">Title</option>
                  <option value="subtitle">Subtitle</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="award">Award</option>
                  <option value="spacer">Spacer</option>
                </select>
              </div>

              {/* Title Text (for title, subtitle, award) */}
              {(formData.section_Type === "title" ||
                formData.section_Type === "subtitle" ||
                formData.section_Type === "award") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Title Text *
                  </label>
                  <input
                    type="text"
                    name="title_Text"
                    value={formData.title_Text}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 outline-none focus:border-[#2096D8]"
                    placeholder="Enter title here..."
                  />
                </div>
              )}

              {/* Content Text (for paragraph, award) */}
              {(formData.section_Type === "paragraph" ||
                formData.section_Type === "award") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Content Text *
                  </label>
                  <textarea
                    name="content_Text"
                    value={formData.content_Text}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full border border-gray-300 p-2 outline-none focus:border-[#2096D8]"
                    placeholder="Enter content here..."
                  />
                </div>
              )}

              {/* Spacer Size */}
              {formData.section_Type === "spacer" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Spacer Height (px)
                  </label>
                  <input
                    type="number"
                    name="margin_Top"
                    value={formData.margin_Top}
                    onChange={handleNumberChange}
                    className="w-full border border-gray-300 p-2 outline-none focus:border-[#2096D8]"
                  />
                </div>
              )}

              {/* Styling Options */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Text Formatting
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isBold"
                      checked={formData.isBold}
                      onChange={handleInputChange}
                    />
                    <span className="text-sm">Bold</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isItalic"
                      checked={formData.isItalic}
                      onChange={handleInputChange}
                    />
                    <span className="text-sm">Italic</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isUnderline"
                      checked={formData.isUnderline}
                      onChange={handleInputChange}
                    />
                    <span className="text-sm">Underline</span>
                  </label>
                </div>
              </div>

              {/* Alignment and Font Size */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Text Alignment
                  </label>
                  <select
                    name="text_Align"
                    value={formData.text_Align}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 outline-none focus:border-[#2096D8]"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Font Size
                  </label>
                  <select
                    name="font_Size"
                    value={formData.font_Size}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 outline-none focus:border-[#2096D8]"
                  >
                    <option value="small">Small</option>
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                    <option value="xlarge">Extra Large</option>
                  </select>
                </div>
              </div>

              {/* Spacing Controls */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Margin Top (px)
                  </label>
                  <input
                    type="number"
                    name="margin_Top"
                    value={formData.margin_Top}
                    onChange={handleNumberChange}
                    className="w-full border border-gray-300 p-2 outline-none focus:border-[#2096D8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Margin Bottom (px)
                  </label>
                  <input
                    type="number"
                    name="margin_Bottom"
                    value={formData.margin_Bottom}
                    onChange={handleNumberChange}
                    className="w-full border border-gray-300 p-2 outline-none focus:border-[#2096D8]"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm">Active (visible on website)</span>
                </label>
              </div>

              {/* Custom CSS Class */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Custom CSS Class (optional)
                </label>
                <input
                  type="text"
                  name="custom_CSS_Class"
                  value={formData.custom_CSS_Class}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 outline-none focus:border-[#2096D8]"
                  placeholder="my-custom-class"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#2096D8] text-white hover:bg-[#1a7ab3]"
              >
                {editingSection ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
