import { useEffect, useState } from "react";
import { FiArrowDown, FiArrowUp, FiEdit2, FiImage, FiLink, FiMonitor, FiPlus, FiSmartphone, FiTrash2 } from "react-icons/fi";
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
  Toggle,
  VisibilityBadge,
  inputClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";
import { formatDate } from "./adminUtils";

const emptyUpload = { image: null, mobileImage: null, clickUrl: "", previewUrl: null, mobilePreviewUrl: null };

export default function AdminGallery() {
  const confirm = useConfirm();
  const toast = useToast();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);
  const [uploadForm, setUploadForm] = useState(emptyUpload);
  const [editForm, setEditForm] = useState({ clickUrl: "", isActive: true });
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [reordering, setReordering] = useState(false);

  const fetchSliders = async () => {
    try {
      const data = await api.getAllHomeSliders();
      setSliders([...data].sort((a, b) => a.displayOrder - b.displayOrder));
      setError(null);
    } catch (err) {
      setError("Failed to load banners");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const closeUpload = () => {
    setShowUploadModal(false);
    setUploadForm(emptyUpload);
  };

  const handleUpload = async (e) => {
    e?.preventDefault();
    if (!uploadForm.image) {
      toast.error("Please choose a desktop image.");
      return;
    }
    setUploading(true);
    try {
      await api.uploadHomeSlider(uploadForm.image, uploadForm.mobileImage || null, uploadForm.clickUrl || null);
      await fetchSliders();
      closeUpload();
      toast.success("Banner added. It's now live at the end of the slider.");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (slider) => {
    setSelectedSlider(slider);
    setEditForm({ clickUrl: slider.clickUrl || "", isActive: slider.isActive });
  };

  const handleEdit = async (e) => {
    e?.preventDefault();
    setUpdating(true);
    try {
      await api.updateHomeSlider(selectedSlider.id, {
        clickUrl: editForm.clickUrl,
        title: selectedSlider.title,
        isActive: editForm.isActive,
      });
      await fetchSliders();
      setSelectedSlider(null);
      toast.success("Banner updated.");
    } catch (err) {
      toast.error("Update failed: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (slider) => {
    const ok = await confirm({
      title: "Delete this banner?",
      message: "It will be removed from the homepage slider. This can't be undone — to hide it temporarily, turn off “Show on homepage” instead.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteHomeSlider(slider.id);
      await fetchSliders();
      toast.success("Banner deleted.");
    } catch (err) {
      toast.error("Delete failed: " + err.message);
    }
  };

  const move = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= sliders.length) return;
    setReordering(true);
    const next = [...sliders];
    [next[index], next[target]] = [next[target], next[index]];
    setSliders(next);
    try {
      await api.reorderHomeSliders(next.map((item, idx) => ({ id: item.id, displayOrder: idx })));
    } catch (err) {
      toast.error("Couldn't save the new order: " + err.message);
    } finally {
      await fetchSliders();
      setReordering(false);
    }
  };

  const activeCount = sliders.filter((s) => s.isActive).length;

  return (
    <AdminPage
      eyebrow="Homepage"
      title="Banners"
      count={loading ? undefined : sliders.length}
      description="The large rotating images at the top of the homepage. They play in the order shown here — use the arrows to reorder."
      actions={
        <Button icon={FiPlus} onClick={() => setShowUploadModal(true)}>
          New banner
        </Button>
      }
    >
      {error && <Notice tone="error">{error}</Notice>}
      {!loading && sliders.length > 0 && activeCount === 0 && (
        <Notice tone="warning">All banners are hidden, so the homepage slider is empty.</Notice>
      )}

      <Card bodyClassName="">
        {loading ? (
          <Loading label="Loading banners…" />
        ) : sliders.length === 0 ? (
          <EmptyState
            icon={FiImage}
            title="No banners yet"
            text="Upload a wide image (2400 × 800 px) to show at the top of the homepage."
            action={<Button icon={FiPlus} onClick={() => setShowUploadModal(true)}>New banner</Button>}
          />
        ) : (
          <ol className={`divide-y divide-black/[0.06] ${reordering ? "pointer-events-none opacity-70" : ""}`}>
            {sliders.map((slider, index) => (
              <li key={slider.id} className={`flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 ${slider.isActive ? "" : "bg-[#faf9f6]"}`}>
                <div className="flex flex-col items-center">
                  <IconButton icon={FiArrowUp} label="Move up" disabled={index === 0 || reordering} onClick={() => move(index, -1)} className="h-8 w-8" />
                  <span className="font-display text-sm font-bold tabular-nums text-gray-400">{index + 1}</span>
                  <IconButton icon={FiArrowDown} label="Move down" disabled={index === sliders.length - 1 || reordering} onClick={() => move(index, 1)} className="h-8 w-8" />
                </div>
                <button
                  type="button"
                  onClick={() => openEditModal(slider)}
                  className={`relative aspect-[3/1] w-36 shrink-0 overflow-hidden rounded-lg bg-[#f6f5f1] sm:w-56 ${slider.isActive ? "" : "opacity-50 grayscale"}`}
                  aria-label={`Edit banner ${index + 1}`}
                >
                  <img src={slider.imageUrl} alt="" className="h-full w-full object-cover" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <VisibilityBadge active={slider.isActive} />
                    {slider.mobileImageUrl && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <FiSmartphone size={12} aria-hidden="true" /> Mobile image
                      </span>
                    )}
                  </div>
                  <p className={`mt-1 flex items-center gap-1.5 truncate text-sm ${slider.clickUrl ? "text-gray-700" : "italic text-gray-400"}`}>
                    <FiLink size={13} className="shrink-0" aria-hidden="true" />
                    <span className="truncate">{slider.clickUrl || "Not clickable"}</span>
                  </p>
                  {slider.createdAt && <p className="mt-0.5 text-xs text-gray-400">Added {formatDate(slider.createdAt)}</p>}
                </div>
                <div className="flex gap-1">
                  <IconButton icon={FiEdit2} label="Edit banner" onClick={() => openEditModal(slider)} />
                  <IconButton icon={FiTrash2} tone="danger" label="Delete banner" onClick={() => handleDelete(slider)} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <p className="text-xs text-gray-500">
        Still seeing an old banner on the site after saving? Use <span className="font-semibold">Refresh live site</span> in the menu.
      </p>

      {/* upload */}
      <Modal
        open={showUploadModal}
        onClose={closeUpload}
        size="lg"
        title="New banner"
        description="Upload the wide desktop image. A separate mobile image is optional but looks much better on phones."
        footer={
          <>
            <Button variant="secondary" onClick={closeUpload}>
              Cancel
            </Button>
            <Button onClick={handleUpload} loading={uploading} disabled={!uploadForm.image}>
              {uploading ? "Uploading…" : "Upload banner"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpload} className="space-y-5">
          <Field label={<span className="inline-flex items-center gap-1.5"><FiMonitor size={14} /> Desktop image</span>} required>
            <ImagePicker
              preview={uploadForm.previewUrl}
              aspect="aspect-[3/1]"
              accept="image/jpeg,image/png,image/webp"
              label="Choose desktop image"
              hint="JPG, PNG or WebP."
              promptKey="bannerDesktop"
              onFile={(file) => setUploadForm((f) => ({ ...f, image: file, previewUrl: URL.createObjectURL(file) }))}
              onClear={() => setUploadForm((f) => ({ ...f, image: null, previewUrl: null }))}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-[200px_minmax(0,1fr)]">
            <Field label={<span className="inline-flex items-center gap-1.5"><FiSmartphone size={14} /> Mobile image</span>}>
              <ImagePicker
                preview={uploadForm.mobilePreviewUrl}
                aspect="aspect-square"
                accept="image/jpeg,image/png,image/webp"
                label="Optional"
                hint="Optional."
                promptKey="bannerMobile"
                onFile={(file) => setUploadForm((f) => ({ ...f, mobileImage: file, mobilePreviewUrl: URL.createObjectURL(file) }))}
                onClear={() => setUploadForm((f) => ({ ...f, mobileImage: null, mobilePreviewUrl: null }))}
              />
            </Field>
            <Field label="Link when clicked" hint="Optional. A page on the shop (/products?search=whey) or a full web address. Leave empty to make the banner not clickable.">
              <input className={inputClass} value={uploadForm.clickUrl} onChange={(e) => setUploadForm((f) => ({ ...f, clickUrl: e.target.value }))} placeholder="/products?search=whey" />
            </Field>
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      {/* edit */}
      <Modal
        open={Boolean(selectedSlider)}
        onClose={() => setSelectedSlider(null)}
        size="md"
        title="Edit banner"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedSlider(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} loading={updating}>
              Save changes
            </Button>
          </>
        }
      >
        {selectedSlider && (
          <form onSubmit={handleEdit} className="space-y-4">
            <img src={selectedSlider.imageUrl} alt="" className="aspect-[3/1] w-full rounded-xl bg-[#f6f5f1] object-cover" />
            <p className="text-xs text-gray-500">To change the image, upload a new banner and delete this one.</p>
            <Field label="Link when clicked" hint="Leave empty to make the banner not clickable.">
              <input data-autofocus className={inputClass} value={editForm.clickUrl} onChange={(e) => setEditForm((f) => ({ ...f, clickUrl: e.target.value }))} placeholder="/products?search=whey" />
            </Field>
            <Toggle checked={editForm.isActive} onChange={(v) => setEditForm((f) => ({ ...f, isActive: v }))} label="Show on homepage" description="Turn off to hide the banner without deleting it." />
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>
    </AdminPage>
  );
}
