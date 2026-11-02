import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function AdminYoutube() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    videoUrl: "",
    title: "",
    description: "",
    viewCount: 0,
    likeCount: 0,
    displayOrder: 0,
    createdBy: "",
  });
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // Fetch all videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const data = await api.getAllYouTubeVideos();
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      alert("Failed to fetch YouTube videos");
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
      [name]:
        name === "viewCount" || name === "likeCount" || name === "displayOrder"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      videoUrl: "",
      title: "",
      description: "",
      viewCount: 0,
      likeCount: 0,
      displayOrder: 0,
      createdBy: "",
    });
    setSelectedThumbnailFile(null);
    setThumbnailPreview("");
    setEditingVideo(null);
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!selectedThumbnailFile) {
        alert("Please select a thumbnail image");
        setLoading(false);
        return;
      }

      const user = api.getUser();
      const videoData = {
        videoUrl: formData.videoUrl,
        title: formData.title,
        description: formData.description,
        viewCount: formData.viewCount,
        likeCount: formData.likeCount,
        displayOrder: formData.displayOrder,
        thumbnail: selectedThumbnailFile,
        createdBy: user?.fullName || user?.email || "Admin",
      };
      await api.createYouTubeVideo(videoData);
      alert("Video created successfully");
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error("Error creating video:", error);
      alert("Failed to create video");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = api.getUser();
      const videoData = {
        id: editingVideo.id,
        videoUrl: formData.videoUrl,
        title: formData.title,
        description: formData.description,
        viewCount: formData.viewCount,
        likeCount: formData.likeCount,
        displayOrder: formData.displayOrder,
        updatedBy: user?.fullName || user?.email || "Admin",
      };

      if (selectedThumbnailFile) {
        videoData.thumbnail = selectedThumbnailFile;
      }

      await api.updateYouTubeVideo(videoData);
      alert("Video updated successfully");
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error("Error updating video:", error);
      alert("Failed to update video");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      videoUrl: video.videoUrl,
      title: video.title,
      description: video.description || "",
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      displayOrder: video.displayOrder,
      createdBy: "",
    });
    setThumbnailPreview(video.thumbnailPath);
    setSelectedThumbnailFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    setLoading(true);
    try {
      await api.deleteYouTubeVideo(id);
      alert("Video deleted successfully");
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video");
    } finally {
      setLoading(false);
    }
  };

  const moveUp = async (index) => {
    if (index === 0) return;

    const newVideos = [...videos];
    [newVideos[index - 1], newVideos[index]] = [
      newVideos[index],
      newVideos[index - 1],
    ];

    const reorderData = newVideos.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    try {
      await api.reorderYouTubeVideos(reorderData);
      fetchVideos();
    } catch (error) {
      console.error("Failed to reorder:", error);
      fetchVideos();
    }
  };

  const moveDown = async (index) => {
    if (index === videos.length - 1) return;

    const newVideos = [...videos];
    [newVideos[index + 1], newVideos[index]] = [
      newVideos[index],
      newVideos[index + 1],
    ];

    const reorderData = newVideos.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    try {
      await api.reorderYouTubeVideos(reorderData);
      fetchVideos();
    } catch (error) {
      console.error("Failed to reorder:", error);
      fetchVideos();
    }
  };

  const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    if (thumbnailPath.startsWith("http")) return thumbnailPath;
    if (thumbnailPath.startsWith("/")) {
      return `https://proteini.mk${thumbnailPath}`;
    }
    return thumbnailPath;
  };

  if (loading && !videos.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading YouTube videos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            YouTube Videos Management
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#2096D8] hover:bg-[#007bff] text-white px-4 py-2 transition-colors"
          >
            + Add New Video
          </button>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No YouTube videos found. Click "Add New Video" to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gray-100 group overflow-hidden">
                  <img
                    src={getThumbnailUrl(video.thumbnailPath)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'%3E%3C/rect%3E%3Cpath d='M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5'%3E%3C/path%3E%3C/svg%3E";
                      e.target.onerror = null;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 15l5-3-5-3v6zm9-3c0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8 8 3.59 8 8z" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {video.title}
                    </h3>
                    <span className="text-xs text-gray-400">
                      Order: {video.displayOrder}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {video.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <div className="flex gap-2">
                      <span>👁️ {video.viewCount.toLocaleString()}</span>
                      <span>❤️ {video.likeCount.toLocaleString()}</span>
                    </div>
                    <span>{video.isActive ? "Active" : "Inactive"}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="flex-1 px-3 py-1.5 bg-[#2096D8] text-white hover:bg-[#007bff] text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="flex-1 px-3 py-1.5 bg-red-500 text-white hover:bg-red-600 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Reorder buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="flex-1 px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ↑ Move Up
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === videos.length - 1}
                      className="flex-1 px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ↓ Move Down
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
                {editingVideo ? "Edit Video" : "Add New Video"}
              </h2>
              <form onSubmit={editingVideo ? handleUpdate : handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube Video URL *
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                      placeholder="https://www.youtube.com/embed/q_B6h1hAoJo"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use embed URL format:
                      https://www.youtube.com/embed/VIDEO_ID
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                      placeholder="Video title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thumbnail Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {thumbnailPreview ? (
                        <div>
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail Preview"
                            className="max-h-48 mx-auto mb-2 rounded"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                      placeholder="Video description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        View Count
                      </label>
                      <input
                        type="number"
                        name="viewCount"
                        value={formData.viewCount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Like Count
                      </label>
                      <input
                        type="number"
                        name="likeCount"
                        value={formData.likeCount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                        min="0"
                      />
                    </div>
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
                    disabled={loading || uploadingThumbnail}
                    className="flex-1 px-4 py-2 bg-[#e98286] text-white rounded-lg hover:bg-[#d47175] disabled:opacity-50"
                  >
                    {uploadingThumbnail
                      ? "Uploading Thumbnail..."
                      : loading
                        ? "Saving..."
                        : editingVideo
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
