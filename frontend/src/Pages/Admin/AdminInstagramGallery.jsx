import { useEffect, useState } from "react";
import { FiEdit2, FiExternalLink, FiHeart, FiInstagram, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";
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
  Notice,
  inputClass,
  textareaClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";
import { formatDate, formatDateTime } from "./adminUtils";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const emptyForm = { postUrl: "", imagePath: "", description: "", likeCount: 0, postedBy: "", postedDate: "" };

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) return imagePath;
  if (imagePath.startsWith("/")) return `${import.meta.env.VITE_IMAGE_BASE_URL || "https://proteini.mk"}${imagePath}`;
  return imagePath;
};

const adminName = () => {
  const user = api.getUser();
  return user?.fullName || user?.email || "Admin";
};

export default function AdminInstagramGallery() {
  const confirm = useConfirm();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [missing, setMissing] = useState(() => new Set());
  const [sync, setSync] = useState(null); // { configured, last }
  const [syncing, setSyncing] = useState(false);

  const fetchPosts = async () => {
    try {
      setPosts(await api.getInstagramPosts());
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load Instagram posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getInstagramSyncStatus().then(setSync).catch(() => setSync(null));
  }, []);

  const syncNow = async () => {
    setSyncing(true);
    try {
      const result = await api.syncInstagramPosts();
      setSync({ configured: result.configured, last: result });
      if (!result.configured) toast.error("Instagram sync is not set up on the server yet.");
      else if (!result.success) toast.error(result.error || "Instagram sync failed.");
      else {
        toast.success(`Synced ${result.fetched} posts: ${result.added} new, ${result.updated} updated.`);
        setMissing(new Set());
        await fetchPosts();
      }
    } catch (error) {
      toast.error(error.message || "Instagram sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleImageSelect = (file) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Only JPG, PNG, GIF and WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum 5 MB.");
      return;
    }
    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setField("imagePath", "");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setSelectedImageFile(null);
    setImagePreview("");
  };

  const startNew = () => {
    setEditingPost(null);
    setFormData(emptyForm);
    setSelectedImageFile(null);
    setImagePreview("");
    setShowForm(true);
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
    });
    setImagePreview(getImageUrl(post.imagePath));
    setSelectedImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.postUrl.trim()) {
      toast.error("Paste the link to the Instagram post.");
      return;
    }
    if (!selectedImageFile && !formData.imagePath) {
      toast.error("Upload an image or paste an image address.");
      return;
    }
    setSaving(true);
    try {
      let finalImagePath = formData.imagePath;
      if (selectedImageFile) {
        const result = await api.uploadInstagramImage(selectedImageFile);
        if (!result?.imagePath) throw new Error("Image upload failed");
        finalImagePath = result.imagePath;
        if (editingPost) setMissing((prev) => { const next = new Set(prev); next.delete(editingPost.id); return next; });
      }
      const postData = {
        postUrl: formData.postUrl,
        imagePath: finalImagePath,
        description: formData.description,
        likeCount: formData.likeCount,
        postedBy: formData.postedBy,
        postedDate: formData.postedDate,
      };
      if (editingPost) {
        await api.updateInstagramPost({ ...postData, id: editingPost.id, updatedBy: adminName() });
        toast.success("Post updated.");
      } else {
        await api.createInstagramPost({ ...postData, createdBy: adminName() });
        toast.success("Post added to the gallery.");
      }
      closeForm();
      await fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error(error.message || "Failed to save the post.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post) => {
    const ok = await confirm({
      title: "Remove this post?",
      message: "It will no longer show in the Instagram gallery on the site. The post on Instagram is not affected.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteInstagramPost(post.id);
      toast.success("Post removed.");
      await fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to remove the post.");
    }
  };

  return (
    <AdminPage
      eyebrow="Content"
      title="Instagram"
      count={loading ? undefined : posts.length}
      description="Posts shown in the Instagram gallery on the site. Each one links to the original post."
      actions={
        <div className="flex flex-wrap gap-2">
          {sync?.configured && (
            <Button variant="secondary" icon={FiRefreshCw} loading={syncing} onClick={syncNow}>
              Sync from Instagram
            </Button>
          )}
          <Button icon={FiPlus} onClick={startNew}>
            Add post
          </Button>
        </div>
      }
    >
      {sync && !sync.configured && (
        <Notice tone="info" title="Automatic sync is off" className="mb-4">
          Set <code>Instagram__AccessToken</code> on the server and new posts, pictures and likes will be pulled from Instagram every hour.
        </Notice>
      )}
      {sync?.configured && sync.last && (
        <Notice tone={sync.last.success ? "success" : "error"} className="mb-4">
          {sync.last.success
            ? `Synced automatically from Instagram ${formatDateTime(sync.last.finishedAt)} (${sync.last.fetched} posts).`
            : `Last Instagram sync failed: ${sync.last.error}`}
        </Notice>
      )}
      {loading ? (
        <Card>
          <Loading label="Loading posts…" />
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <EmptyState
            icon={FiInstagram}
            title="No posts yet"
            text="Add a post by pasting its link and uploading the picture."
            action={<Button icon={FiPlus} onClick={startNew}>Add post</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <article key={post.id} className="group overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06]">
              <button type="button" onClick={() => handleEdit(post)} className="relative block aspect-square w-full overflow-hidden bg-[#f6f5f1]" aria-label="Edit post">
                {missing.has(post.id) ? (
                  <span className="flex h-full w-full flex-col items-center justify-center gap-1 p-3 text-center text-xs font-semibold text-red-600">
                    <FiInstagram size={20} aria-hidden="true" />
                    Picture missing — click to upload it again
                  </span>
                ) : (
                  <img
                    src={getImageUrl(post.imagePath)}
                    alt=""
                    onError={() => setMissing((prev) => new Set(prev).add(post.id))}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                )}
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur">
                  <FiHeart size={11} aria-hidden="true" /> {Number(post.likeCount || 0).toLocaleString()}
                </span>
              </button>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-gray-900">{post.postedBy || "—"}</p>
                <p className="mt-0.5 line-clamp-2 min-h-[2.5em] text-xs text-gray-500">{post.description || "No caption"}</p>
                <div className="mt-2 flex items-center justify-between gap-1">
                  <span className="text-[11px] text-gray-400">{post.postedDate ? formatDate(post.postedDate) : ""}</span>
                  <div className="flex">
                    <a href={post.postUrl} target="_blank" rel="noreferrer" title="Open on Instagram" aria-label="Open on Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-black/[0.06] hover:text-gray-900">
                      <FiExternalLink size={16} aria-hidden="true" />
                    </a>
                    <IconButton icon={FiEdit2} label="Edit post" onClick={() => handleEdit(post)} />
                    <IconButton icon={FiTrash2} tone="danger" label="Remove post" onClick={() => handleDelete(post)} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={closeForm}
        size="lg"
        title={editingPost ? "Edit post" : "Add Instagram post"}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {saving && selectedImageFile ? "Uploading…" : editingPost ? "Save changes" : "Add post"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-3">
            <ImagePicker promptKey="instagram"
              preview={imagePreview}
              aspect="aspect-square"
              accept={ALLOWED.join(",")}
              label="Upload picture"
              hint="Square works best. Max 5 MB."
              onFile={handleImageSelect}
              onClear={() => {
                setSelectedImageFile(null);
                setImagePreview("");
                setField("imagePath", "");
              }}
            />
            {!selectedImageFile && (
              <Field label="…or image address" hint="Paste a direct link to an image instead of uploading.">
                <input
                  className={inputClass}
                  value={formData.imagePath}
                  onChange={(e) => {
                    setField("imagePath", e.target.value);
                    setImagePreview(e.target.value ? getImageUrl(e.target.value) : "");
                  }}
                  placeholder="https://…/image.jpg"
                />
              </Field>
            )}
          </div>
          <div className="space-y-4">
            <Field label="Link to the post" required>
              <input data-autofocus type="url" className={inputClass} value={formData.postUrl} onChange={(e) => setField("postUrl", e.target.value)} placeholder="https://www.instagram.com/p/…" />
            </Field>
            <Field label="Caption">
              <textarea rows={3} className={textareaClass} value={formData.description} onChange={(e) => setField("description", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Account">
                <input className={inputClass} value={formData.postedBy} onChange={(e) => setField("postedBy", e.target.value)} placeholder="@proteini.si" />
              </Field>
              <Field label="Likes">
                <input type="number" min="0" className={inputClass} value={formData.likeCount} onChange={(e) => setField("likeCount", parseInt(e.target.value) || 0)} />
              </Field>
            </div>
            <Field label="Posted on">
              <input type="date" className={inputClass} value={formData.postedDate} onChange={(e) => setField("postedDate", e.target.value)} />
            </Field>
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
