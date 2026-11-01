import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function AdminInstagramGallery() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    postUrl: "",
    imagePath: "",
    description: "",
    likeCount: 0,
    postedBy: "",
    postedDate: "",
    createdBy: "",
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Fetch all posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getInstagramPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      alert("Failed to fetch Instagram posts");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
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

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large. Maximum 5MB allowed.");
        return;
      }

      setSelectedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Clear any existing image path
      setFormData((prev) => ({ ...prev, imagePath: "" }));
    }
  };

  const uploadImage = async () => {
    if (!selectedImageFile) return null;

    setUploadingImage(true);
    try {
      const result = await api.uploadInstagramImage(selectedImageFile);
      if (result && result.imagePath) {
        return result.imagePath;
      }
      return null;
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "likeCount" ? parseInt(value) || 0 : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      postUrl: "",
      imagePath: "",
      description: "",
      likeCount: 0,
      postedBy: "",
      postedDate: "",
      createdBy: "",
    });
    setSelectedImageFile(null);
    setImagePreview("");
    setEditingPost(null);
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImagePath = formData.imagePath;

      // Upload image if selected
      if (selectedImageFile) {
        const uploadedPath = await uploadImage();
        if (uploadedPath) {
          finalImagePath = uploadedPath;
        } else {
          setLoading(false);
          return;
        }
      }

      if (!finalImagePath) {
        alert("Please select an image or provide an image URL");
        setLoading(false);
        return;
      }

      const user = api.getUser();
      const postData = {
        postUrl: formData.postUrl,
        imagePath: finalImagePath,
        description: formData.description,
        likeCount: formData.likeCount,
        postedBy: formData.postedBy,
        postedDate: formData.postedDate,
        createdBy: user?.fullName || user?.email || "Admin",
      };
      await api.createInstagramPost(postData);
      alert("Post created successfully");
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImagePath = formData.imagePath;

      // Upload new image if selected
      if (selectedImageFile) {
        const uploadedPath = await uploadImage();
        if (uploadedPath) {
          finalImagePath = uploadedPath;
        } else {
          setLoading(false);
          return;
        }
      }

      const user = api.getUser();
      const postData = {
        id: editingPost.id,
        postUrl: formData.postUrl,
        imagePath: finalImagePath,
        description: formData.description,
        likeCount: formData.likeCount,
        postedBy: formData.postedBy,
        postedDate: formData.postedDate,
        updatedBy: user?.fullName || user?.email || "Admin",
      };
      await api.updateInstagramPost(postData);
      alert("Post updated successfully");
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      postUrl: post.postUrl,
      imagePath: post.imagePath,
      description: post.description || "",
      likeCount: post.likeCount,
      postedBy: post.postedBy || "",
      postedDate: post.postedDate ? post.postedDate.split("T")[0] : "",
      createdBy: "",
    });
    setImagePreview(post.imagePath);
    setSelectedImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setLoading(true);
    try {
      await api.deleteInstagramPost(id);
      alert("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    } finally {
      setLoading(false);
    }
  };

  const openInstagramLink = (url) => {
    window.open(url, "_blank");
  };

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL or starts with http, return as is
    if (imagePath.startsWith("http")) return imagePath;
    // If it's a relative path, prepend the base URL
    if (imagePath.startsWith("/")) {
      // Use your production URL
      return `https://proteini.mk${imagePath}`;
    }
    return imagePath;
  };

  if (loading && !posts.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading Instagram posts...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Instagram Gallery Management
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#2096D8] hover:bg-[#007bff] text-white px-4 py-2 transition-colors"
          >
            + Add New Post
          </button>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No Instagram posts found. Click "Add New Post" to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Image */}
                <div
                  className="relative h-64 bg-gray-100 cursor-pointer group overflow-hidden"
                  onClick={() => openInstagramLink(post.postUrl)}
                >
                  <img
                    src={getImageUrl(post.imagePath)}
                    alt={post.description || "Instagram post"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'%3E%3C/rect%3E%3Cpath d='M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5'%3E%3C/path%3E%3C/svg%3E";
                      e.target.onerror = null;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.31.976.976 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.31 3.608-.976.976-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.31-.976-.976-1.248-2.242-1.31-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.334-2.633 1.31-3.608.976-.976 2.242-1.248 3.608-1.31 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.358.062-2.763.374-3.836 1.447-1.073 1.073-1.385 2.478-1.447 3.836-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.062 1.358.374 2.763 1.447 3.836 1.073 1.073 2.478 1.385 3.836 1.447 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.358-.062 2.763-.374 3.836-1.447 1.073-1.073 1.385-2.478 1.447-3.836.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.062-1.358-.374-2.763-1.447-3.836-1.073-1.073-2.478-1.385-3.836-1.447-1.28-.058-1.688-.072-4.947-.072z" />
                      <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z" />
                      <circle cx="18.406" cy="5.594" r="1.44" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {post.postedBy || "Unknown"}
                    </span>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-red-500 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="text-sm text-gray-500">
                        {post.likeCount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>
                      Added: {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.postedDate && (
                      <span>
                        Posted: {new Date(post.postedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="flex-1 px-3 py-1.5 bg-blue-500 text-white hover:bg-blue-600 text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="flex-1 px-3 py-1.5 bg-red-500 text-white hover:bg-red-600 text-sm transition-colors"
                    >
                      Delete
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
                {editingPost ? "Edit Post" : "Add New Post"}
              </h2>
              <form onSubmit={editingPost ? handleUpdate : handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram Post URL *
                    </label>
                    <input
                      type="url"
                      name="postUrl"
                      value={formData.postUrl}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                      placeholder="https://www.instagram.com/p/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {imagePreview ? (
                        <div>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 mx-auto mb-2 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImageFile(null);
                              setImagePreview("");
                              setFormData((prev) => ({
                                ...prev,
                                imagePath: "",
                              }));
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
                            onChange={handleImageSelect}
                            className="hidden"
                            id="instagram-image-upload"
                          />
                          <label
                            htmlFor="instagram-image-upload"
                            className="cursor-pointer text-[#e98286] hover:text-[#d47175]"
                          >
                            Click to upload image
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, GIF, WEBP. Max 5MB.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OR Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Or Paste Image URL
                    </label>
                    <input
                      type="text"
                      name="imagePath"
                      value={formData.imagePath}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                      placeholder="https://example.com/image.jpg"
                      disabled={!!selectedImageFile}
                    />
                    {selectedImageFile && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Clear selected image above to use URL instead
                      </p>
                    )}
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
                      placeholder="Post description..."
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posted By (Instagram username)
                    </label>
                    <input
                      type="text"
                      name="postedBy"
                      value={formData.postedBy}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posted Date
                    </label>
                    <input
                      type="date"
                      name="postedDate"
                      value={formData.postedDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e98286]"
                    />
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
                      ? "Uploading Image..."
                      : loading
                        ? "Saving..."
                        : editingPost
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
