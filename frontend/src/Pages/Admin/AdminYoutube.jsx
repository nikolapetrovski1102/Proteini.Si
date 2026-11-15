import { useEffect, useState } from "react";
import { FiArrowDown, FiArrowUp, FiEdit2, FiEye, FiHeart, FiPlay, FiPlus, FiTrash2, FiYoutube } from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  ImagePicker,
  Loading,
  Modal,
  VisibilityBadge,
  inputClass,
  textareaClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const emptyForm = { videoUrl: "", title: "", description: "", viewCount: 0, likeCount: 0, displayOrder: 0 };

const getThumbnailUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  if (path.startsWith("/")) return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${path}`;
  return path;
};

/** Accepts any YouTube link (watch, youtu.be, shorts, embed) and returns the embed URL the site needs. */
const toEmbedUrl = (url) => {
  const value = (url || "").trim();
  const match = value.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : value;
};

const adminName = () => {
  const user = api.getUser();
  return user?.fullName || user?.email || "Admin";
};

export default function AdminYoutube() {
  const confirm = useConfirm();
  const toast = useToast();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const fetchVideos = async () => {
    try {
      setVideos(await api.getAllYouTubeVideos());
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load YouTube videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleThumbnailSelect = (file) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Only JPG, PNG, GIF and WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum 5 MB.");
      return;
    }
    setSelectedThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingVideo(null);
    setSelectedThumbnailFile(null);
    setThumbnailPreview("");
  };

  const startNew = () => {
    setEditingVideo(null);
    setFormData({ ...emptyForm, displayOrder: videos.length });
    setSelectedThumbnailFile(null);
    setThumbnailPreview("");
    setShowForm(true);
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
    });
    setThumbnailPreview(getThumbnailUrl(video.thumbnailPath));
    setSelectedThumbnailFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.videoUrl.trim() || !formData.title.trim()) {
      toast.error("Video link and title are required.");
      return;
    }
    if (!editingVideo && !selectedThumbnailFile) {
      toast.error("Please choose a thumbnail image.");
      return;
    }
    setSaving(true);
    try {
      const videoData = {
        videoUrl: toEmbedUrl(formData.videoUrl),
        title: formData.title,
        description: formData.description,
        viewCount: formData.viewCount,
        likeCount: formData.likeCount,
        displayOrder: formData.displayOrder,
      };
      if (selectedThumbnailFile) videoData.thumbnail = selectedThumbnailFile;

      if (editingVideo) {
        await api.updateYouTubeVideo({ ...videoData, id: editingVideo.id, updatedBy: adminName() });
        toast.success("Video updated.");
      } else {
        await api.createYouTubeVideo({ ...videoData, createdBy: adminName() });
        toast.success("Video added.");
      }
      closeForm();
      await fetchVideos();
    } catch (error) {
      console.error("Error saving video:", error);
      toast.error("Failed to save the video.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (video) => {
    const ok = await confirm({
      title: `Remove “${video.title}”?`,
      message: "It will no longer show on the site. The video on YouTube is not affected.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteYouTubeVideo(video.id);
      toast.success("Video removed.");
      await fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to remove the video.");
    }
  };

  const move = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= videos.length) return;
    const next = [...videos];
    [next[index], next[target]] = [next[target], next[index]];
    setVideos(next);
    setReordering(true);
    try {
      await api.reorderYouTubeVideos(next.map((item, idx) => ({ id: item.id, displayOrder: idx })));
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast.error("Couldn't save the new order.");
    } finally {
      await fetchVideos();
      setReordering(false);
    }
  };

  const embed = toEmbedUrl(formData.videoUrl);
  const recognised = /youtube\.com\/embed\/[A-Za-z0-9_-]{11}/.test(embed);

  return (
    <AdminPage
      eyebrow="Content"
      title="YouTube"
      count={loading ? undefined : videos.length}
      description="Videos shown in the video section of the site, in the order below."
      actions={
        <Button icon={FiPlus} onClick={startNew}>
          Add video
        </Button>
      }
    >
      <Card bodyClassName="">
        {loading ? (
          <Loading label="Loading videos…" />
        ) : videos.length === 0 ? (
          <EmptyState
            icon={FiYoutube}
            title="No videos yet"
            text="Paste a YouTube link and upload a thumbnail to add your first video."
            action={<Button icon={FiPlus} onClick={startNew}>Add video</Button>}
          />
        ) : (
          <ol className={`divide-y divide-black/[0.06] ${reordering ? "pointer-events-none opacity-70" : ""}`}>
            {videos.map((video, index) => (
              <li key={video.id} className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
                <div className="flex flex-col items-center">
                  <IconButton icon={FiArrowUp} label="Move up" disabled={index === 0 || reordering} onClick={() => move(index, -1)} />
                  <IconButton icon={FiArrowDown} label="Move down" disabled={index === videos.length - 1 || reordering} onClick={() => move(index, 1)} />
                </div>
                <button type="button" onClick={() => handleEdit(video)} className="group relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-[#f6f5f1] sm:w-44" aria-label={`Edit ${video.title}`}>
                  <img src={getThumbnailUrl(video.thumbnailPath)} alt="" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#141409] shadow">
                      <FiPlay size={14} className="ml-0.5" aria-hidden="true" />
                    </span>
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold text-gray-900">{video.title}</h3>
                    {video.isActive === false && <VisibilityBadge active={false} />}
                  </div>
                  {video.description && <p className="mt-0.5 line-clamp-1 text-sm text-gray-600">{video.description}</p>}
                  <div className="mt-1 flex gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <FiEye size={12} aria-hidden="true" /> {Number(video.viewCount || 0).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FiHeart size={12} aria-hidden="true" /> {Number(video.likeCount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <IconButton icon={FiEdit2} label={`Edit ${video.title}`} onClick={() => handleEdit(video)} />
                  <IconButton icon={FiTrash2} tone="danger" label={`Remove ${video.title}`} onClick={() => handleDelete(video)} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Modal
        open={showForm}
        onClose={closeForm}
        size="lg"
        title={editingVideo ? "Edit video" : "Add video"}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingVideo ? "Save changes" : "Add video"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-4">
            <Field label="Thumbnail" required={!editingVideo}>
              <ImagePicker promptKey="youtubeThumb"
                preview={thumbnailPreview}
                aspect="aspect-video"
                accept={ALLOWED.join(",")}
                hint={editingVideo ? "Leave as is to keep the current thumbnail." : "16:9 image. Max 5 MB."}
                onFile={handleThumbnailSelect}
              />
            </Field>
            {recognised && (
              <div className="overflow-hidden rounded-xl bg-black">
                <iframe title="Video preview" src={embed} className="aspect-video w-full" allow="encrypted-media; picture-in-picture" allowFullScreen />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <Field
              label="YouTube link"
              required
              hint="Paste any YouTube link — it's converted automatically."
              error={formData.videoUrl && !recognised ? "This doesn't look like a YouTube link." : undefined}
            >
              <input data-autofocus className={inputClass} value={formData.videoUrl} onChange={(e) => setField("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
            </Field>
            <Field label="Title" required>
              <input className={inputClass} value={formData.title} onChange={(e) => setField("title", e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea rows={3} className={textareaClass} value={formData.description} onChange={(e) => setField("description", e.target.value)} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Views">
                <input type="number" min="0" className={inputClass} value={formData.viewCount} onChange={(e) => setField("viewCount", parseInt(e.target.value) || 0)} />
              </Field>
              <Field label="Likes">
                <input type="number" min="0" className={inputClass} value={formData.likeCount} onChange={(e) => setField("likeCount", parseInt(e.target.value) || 0)} />
              </Field>
              <Field label="Position">
                <input type="number" min="0" className={inputClass} value={formData.displayOrder} onChange={(e) => setField("displayOrder", parseInt(e.target.value) || 0)} />
              </Field>
            </div>
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
