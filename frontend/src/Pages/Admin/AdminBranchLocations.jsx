import { useEffect, useState } from "react";
import { FiClock, FiEdit2, FiMapPin, FiPhone, FiPlus, FiTrash2 } from "react-icons/fi";
import { api } from "../../services/api";
import {
  AdminPage,
  Button,
  Card,
  EmptyState,
  Field,
  FormSection,
  IconButton,
  Loading,
  Modal,
  Segmented,
  Toggle,
  VisibilityBadge,
  inputClass,
  textareaClass,
} from "./AdminKit";
import { useConfirm, useToast } from "./adminFeedback";

const emptyForm = {
  id: 0,
  type: "shop",
  name: "",
  city: "",
  address: "",
  phone: "",
  email: "info@proteini.mk",
  workingHoursMonFri: "10:00 - 22:00",
  workingHoursSat: "Closed",
  workingHoursSun: "Closed",
  coordinates: "",
  displayOrder: 0,
  isActive: true,
};

const TYPES = { shop: "Our stores", gym: "Partner gyms" };

export default function AdminBranchLocations() {
  const confirm = useConfirm();
  const toast = useToast();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("shop");
  const [formData, setFormData] = useState(emptyForm);

  const fetchLocations = async () => {
    try {
      const response = await api.getAllBranchLocations();
      setLocations(response.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key, value) => setFormData((current) => ({ ...current, [key]: value }));

  const startNew = () => {
    setEditing(null);
    setFormData({ ...emptyForm, type, displayOrder: locations.filter((l) => l.type === type).length });
    setOpen(true);
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
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error("Name and address are required.");
      return;
    }
    setSaving(true);
    try {
      if (editing) await api.updateBranchLocation(formData);
      else await api.createBranchLocation(formData);
      toast.success(editing ? "Location updated." : "Location added.");
      setOpen(false);
      setType(formData.type);
      await fetchLocations();
    } catch (error) {
      toast.error(error.message || "Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (location) => {
    const ok = await confirm({
      title: `Delete “${location.name}”?`,
      message: "It will be removed from the stores page. To hide it temporarily, turn off “Show on website” instead.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteBranchLocation(location.id);
      toast.success("Location deleted.");
      await fetchLocations();
    } catch (error) {
      toast.error(error.message || "Failed to delete location");
    }
  };

  const current = locations.filter((location) => location.type === type);

  return (
    <AdminPage
      eyebrow="Content"
      title="Stores"
      description="Your own stores and partner gyms, shown on the stores page with address, phone and opening hours."
      actions={
        <Button icon={FiPlus} onClick={startNew}>
          New location
        </Button>
      }
    >
      <Segmented
        value={type}
        onChange={setType}
        options={Object.entries(TYPES).map(([value, label]) => ({
          value,
          label,
          count: loading ? undefined : locations.filter((l) => l.type === value).length,
        }))}
      />

      <Card bodyClassName="">
        {loading ? (
          <Loading label="Loading locations…" />
        ) : current.length === 0 ? (
          <EmptyState
            icon={FiMapPin}
            title={`No ${type === "shop" ? "stores" : "partners"} yet`}
            text="Add a location and it will appear on the website."
            action={<Button icon={FiPlus} onClick={startNew}>New location</Button>}
          />
        ) : (
          <ul className="divide-y divide-black/[0.06]">
            {current.map((location) => (
              <li key={location.id} className={`flex flex-wrap items-start gap-4 px-5 py-4 sm:flex-nowrap ${location.isActive ? "" : "opacity-60"}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f6f5f1] text-gray-700">
                  <FiMapPin size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-900">{location.name}</h3>
                    <VisibilityBadge active={location.isActive} />
                  </div>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {location.address}
                    {location.city ? `, ${location.city}` : ""}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {location.phone && (
                      <span className="inline-flex items-center gap-1">
                        <FiPhone size={12} aria-hidden="true" /> {location.phone}
                      </span>
                    )}
                    {location.workingHoursMonFri && (
                      <span className="inline-flex items-center gap-1">
                        <FiClock size={12} aria-hidden="true" /> Mon–Fri {location.workingHoursMonFri}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <IconButton icon={FiEdit2} label={`Edit ${location.name}`} onClick={() => handleEdit(location)} />
                  <IconButton icon={FiTrash2} tone="danger" label={`Delete ${location.name}`} onClick={() => handleDelete(location)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title={editing ? "Edit location" : "New location"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? "Save changes" : "Add location"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Basics">
            <Field label="Type">
              <Segmented value={formData.type} onChange={(v) => setField("type", v)} options={Object.entries(TYPES).map(([value, label]) => ({ value, label }))} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required>
                <input data-autofocus className={inputClass} value={formData.name} onChange={(e) => setField("name", e.target.value)} placeholder="Proteini.si Centar" />
              </Field>
              <Field label="City">
                <input className={inputClass} value={formData.city} onChange={(e) => setField("city", e.target.value)} placeholder="Skopje" />
              </Field>
            </div>
            <Field label="Address" required>
              <textarea rows={2} className={textareaClass} value={formData.address} onChange={(e) => setField("address", e.target.value)} />
            </Field>
            <Field label="Map location" hint="Coordinates (41.99, 21.43) or a search text like “Proteini Skopje”. Used for the map pin.">
              <input className={inputClass} value={formData.coordinates} onChange={(e) => setField("coordinates", e.target.value)} />
            </Field>
          </FormSection>

          <FormSection title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <input type="tel" className={inputClass} value={formData.phone} onChange={(e) => setField("phone", e.target.value)} />
              </Field>
              <Field label="Email">
                <input type="email" className={inputClass} value={formData.email} onChange={(e) => setField("email", e.target.value)} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Opening hours" description="Write “Closed” for days you are not open.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Monday – Friday">
                <input className={inputClass} value={formData.workingHoursMonFri} onChange={(e) => setField("workingHoursMonFri", e.target.value)} />
              </Field>
              <Field label="Saturday">
                <input className={inputClass} value={formData.workingHoursSat} onChange={(e) => setField("workingHoursSat", e.target.value)} />
              </Field>
              <Field label="Sunday">
                <input className={inputClass} value={formData.workingHoursSun} onChange={(e) => setField("workingHoursSun", e.target.value)} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Display">
            <Field label="Position" hint="Lower numbers are shown first.">
              <input type="number" min="0" className={`${inputClass} max-w-[140px]`} value={formData.displayOrder} onChange={(e) => setField("displayOrder", Number(e.target.value))} />
            </Field>
            <Toggle checked={formData.isActive} onChange={(v) => setField("isActive", v)} label="Show on website" description="Turn off to hide this location without deleting it." />
          </FormSection>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </AdminPage>
  );
}
