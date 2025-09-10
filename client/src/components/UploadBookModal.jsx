import React, { useRef, useState } from "react";
import { api } from "../lib/api";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function UploadBookModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [condition, setCondition] = useState("good");
  const [type, setType] = useState("exchange");
  const [description, setDescription] = useState("");

  // image upload is paused for now (Cloudinary later)
  const [coverPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const dropRef = useRef(null);

  // (kept for later Cloudinary integration; not used now)
  function onDragOver(e) {
    e.preventDefault();
    dropRef.current?.classList.add("ring-2", "ring-[#1F2421]/20");
  }
  function onDragLeave() {
    dropRef.current?.classList.remove("ring-2", "ring-[#1F2421]/20");
  }
  function onDrop(e) {
    e.preventDefault();
    dropRef.current?.classList.remove("ring-2", "ring-[#1F2421]/20");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const allowedTypes = ["exchange", "giveaway"];
    const allowedConds = ["like_new", "good", "fair"];

    if (!title.trim() || !author.trim()) {
      setErr("Title and author are required.");
      return;
    }
    if (!allowedTypes.includes(type)) {
      setErr("Listing type must be exchange or giveaway.");
      return;
    }
    if (!allowedConds.includes(condition)) {
      setErr("Condition must be Like New, Good, or Fair.");
      return;
    }

    try {
      setSubmitting(true);
      setErr("");

      // ✅ send JSON (no FormData, since no image now)
      const payload = {
        title: title.trim(),
        author: author.trim(),
        condition,
        type, // exchange | giveaway
        description: description.trim(),
      };


       await api.post("/books", payload);

      onSuccess?.(); // e.g. refetch list or close modal from parent

      // reset
      setTitle("");
      setAuthor("");
      setCondition("good");
      setType("exchange");
      setDescription("");
    } catch (e2) {
      setErr(e2.message || "Failed to submit book");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1F2421]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 max-w-xl mx-auto mt-16 sm:mt-24 rounded-2xl border border-[#1F2421]/10 shadow-[0_8px_30px_rgba(31,36,33,0.15)] overflow-hidden"
        style={{ background: "#FCFBF9" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
      >
        {/* thin top rule */}
        <div className="h-[3px] w-full bg-[#E8E4DC]" />

        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <h3 id="upload-modal-title" className="text-xl font-serif font-semibold text-[#1F2421]">
              Submit a Book (Admin Review)
            </h3>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#1F2421]/10 text-[#1F2421] hover:shadow-sm"
            >
              Close
            </button>
          </div>

          <p className="mt-2 text-sm text-[#1F2421]/70">
            Your submission will be reviewed by an admin. Once accepted, it’ll appear publicly.
          </p>

          {err && (
            <div className="mt-3 text-sm text-[#7a2e2e] bg-[#F8EDEE] border border-[#E7C8CB] rounded-lg p-3">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Title + Author */}
            <div className="grid sm:grid-cols-2 gap-3">
              <LabeledInput
                label="Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Book title"
              />
              <LabeledInput
                label="Author *"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
              />
            </div>

            {/* Cover uploader paused (kept visually, disabled) */}
            <div
              ref={dropRef}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className="rounded-xl border border-dashed border-[#1F2421]/15 bg-white p-4 flex items-center justify-between gap-4 transition opacity-60 cursor-not-allowed"
              aria-label="Drag and drop book cover image (disabled)"
              title="Cover upload will be enabled later"
            >
              <div>
                <p className="text-sm text-[#1F2421]/80">Cover upload coming soon</p>
                <p className="text-xs text-[#1F2421]/60">We’ll enable Cloudinary later.</p>
              </div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F2421]/50 text-[#F7F5F2]">
                <FaCloudUploadAlt />
                Disabled
              </span>
            </div>

            {coverPreview && (
              <div className="mt-2">
                <img
                  src={coverPreview}
                  alt="cover preview"
                  className="w-32 h-44 object-cover rounded-lg border border-[#1F2421]/10 bg-white"
                />
              </div>
            )}

            {/* Condition + Type */}
            <div className="grid sm:grid-cols-2 gap-3">
              <LabeledSelect
                label="Condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                options={[
                  { value: "like_new", label: "Like New" },
                  { value: "good", label: "Good" },
                  { value: "fair", label: "Fair" },
                ]}
              />
              <LabeledSelect
                label="Listing Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: "exchange", label: "Exchange" },
                  { value: "giveaway", label: "Giveaway" },
                ]}
              />
            </div>

            {/* Description */}
            <LabeledTextarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short notes about the book"
              rows={3}
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border border-[#1F2421]/10 text-[#1F2421] hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F2421] text-[#F7F5F2] hover:bg-[#1F2421]/90 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#F7F5F2]/40 border-top-[#F7F5F2] rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCloudUploadAlt /> Submit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* --- tiny inputs (neutral theme) --- */
function LabeledInput({ label, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1 text-[#1F2421]/80">{label}</span>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-white border border-[#1F2421]/10 focus:outline-none focus:ring-2 focus:ring-[#1F2421]/20"
      />
    </label>
  );
}

function LabeledTextarea({ label, rows = 3, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1 text-[#1F2421]/80">{label}</span>
      <textarea
        rows={rows}
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-white border border-[#1F2421]/10 focus:outline-none focus:ring-2 focus:ring-[#1F2421]/20"
      />
    </label>
  );
}

function LabeledSelect({ label, options, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1 text-[#1F2421]/80">{label}</span>
      <select
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-white border border-[#1F2421]/10 focus:outline-none focus:ring-2 focus:ring-[#1F2421]/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
