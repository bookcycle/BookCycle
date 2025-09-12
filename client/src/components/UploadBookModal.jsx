// client/src/components/UploadBookModal.jsx
import React, { useRef, useState } from "react";
import { api } from "../lib/api";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function UploadBookModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [condition, setCondition] = useState("good");
  const [type, setType] = useState("exchange");
  const [description, setDescription] = useState("");

  const [coverUrl, setCoverUrl] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const inputRef = useRef(null);
  const dropRef = useRef(null);

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
    handleFiles(e.dataTransfer.files);
  }

  async function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr("Image must be ≤ 5 MB.");
      return;
    }

    setErr("");
    setUploading(true);
    setCoverPreview(URL.createObjectURL(file));

    try {
      const sig = await api.post("/uploads/sign", { folder: "ptb/books" });
      const { cloudName, apiKey, timestamp, signature, folder } = sig;

      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      form.append("timestamp", timestamp);
      form.append("api_key", apiKey);
      form.append("signature", signature);

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const res = await fetch(url, { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      setCoverUrl(data.secure_url);
    } catch (e) {
      setErr(e.message || "Upload failed");
      setCoverPreview("");
      setCoverUrl("");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || uploading) return;

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

      const payload = {
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim() || undefined,
        condition,
        type,
        description: description.trim(),
        coverUrl: coverUrl || undefined,
      };

      await api.post("/books", payload);
      onSuccess?.();

      // reset
      setTitle("");
      setAuthor("");
      setGenre("");
      setCondition("good");
      setType("exchange");
      setDescription("");
      setCoverUrl("");
      setCoverPreview("");
    } catch (e2) {
      setErr(e2.message || "Failed to submit book");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // OUTER fixed container that centers the modal
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-[#1F2421]/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Centering wrapper + padding; content can grow */}
      <div className="relative z-10 flex min-h-full items-start sm:items-center justify-center p-4 sm:p-6">
        {/* Modal card with its own scroll */}
        <div
          className="w-full max-w-xl rounded-2xl border border-[#1F2421]/10 shadow-[0_8px_30px_rgba(31,36,33,0.15)]"
          style={{ background: "#FCFBF9" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
        >
          {/* top accent */}
          <div className="h-[3px] w-full bg-[#E8E4DC]" />

          {/* make the INSIDE scroll if tall */}
          <div className="max-h-[85vh] overflow-y-auto">
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

                {/* Genre */}
                <LabeledSelect
                  label="Genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  options={[
                    { value: "", label: "Select genre (optional)" },
                    { value: "Fiction", label: "Fiction" },
                    { value: "Non-Fiction", label: "Non-Fiction" },
                    { value: "Fantasy", label: "Fantasy" },
                    { value: "Sci-Fi", label: "Sci-Fi" },
                    { value: "Romance", label: "Romance" },
                    { value: "Thriller", label: "Thriller" },
                    { value: "Mystery", label: "Mystery" },
                    { value: "Biography", label: "Biography" },
                    { value: "History", label: "History" },
                    { value: "Self-Help", label: "Self-Help" },
                    { value: "Children", label: "Children" },
                    { value: "Comics", label: "Comics" },
                  ]}
                />

                {/* Cover uploader */}
                <div
                  ref={dropRef}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className="rounded-xl border border-dashed border-[#1F2421]/15 bg-white p-4 transition"
                  aria-label="Drag and drop book cover image"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-[#1F2421]/80">Upload a cover image</p>
                      <p className="text-xs text-[#1F2421]/60">JPG/PNG, up to 5 MB</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F2421] text-[#F7F5F2] hover:bg-[#1F2421]/90 disabled:opacity-60"
                        disabled={uploading}
                      >
                        <FaCloudUploadAlt />
                        {uploading ? "Uploading…" : "Choose file"}
                      </button>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                      />
                    </div>
                  </div>

                  {(coverPreview || coverUrl) && (
                    <div className="mt-3">
                      <img
                        src={coverUrl || coverPreview}
                        alt="cover preview"
                        className="w-32 h-44 object-cover rounded-lg border border-[#1F2421]/10 bg-white"
                      />
                    </div>
                  )}
                </div>

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
                    disabled={submitting || uploading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F2421] text-[#F7F5F2] hover:bg-[#1F2421]/90 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#F7F5F2]/40 border-t-[#F7F5F2] rounded-full animate-spin" />
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
