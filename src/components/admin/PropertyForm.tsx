"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyCard, ListingType, PropertyType } from "@/types/property";
import Link from "next/link";
import { MapPin, AlertTriangle } from "lucide-react";
import { compressAndConvertToWebp } from "@/lib/image-optimizer";

type FormState = Omit<PropertyCard, "id" | "createdAt">;

const EMPTY: FormState = {
  slug: "", name: "", description: "",
  listingType: "rent", propertyType: "condo",
  priceTHB: 0, priceUSD: undefined, priceLabel: "/month",
  bedrooms: 1, bathrooms: 1, sqm: undefined,
  area: "", district: "",
  coverImage: "", images: [], videoUrl: "",
  likes: 0, saves: 0, clicks: 0,
  featured: false, hasVideo: false, petFriendly: false, nearBts: false,
  verificationBadge: false, expiryDate: "",
  amenities: [], features: [], schools: [], transit: [], neighborhood: "",
};

const POPULAR_AMENITIES = [
  "24h Security", "Rooftop Pool", "Fitness Center", "Concierge",
  "Covered Parking", "1Gbps Fibre WiFi", "Smart Climate", "Skyline Views",
  "Pet Friendly", "Smart Home", "On-site Laundry", "Storage Room",
  "Sauna", "Jacuzzi", "Garden", "Co-working Space"
];

function toSlug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function PropertyForm({ initial, isNew }: { initial?: PropertyCard; isNew: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(initial
    ? {
        slug: initial.slug, name: initial.name, description: initial.description,
        listingType: initial.listingType, propertyType: initial.propertyType,
        priceTHB: Number(initial.priceTHB), priceUSD: initial.priceUSD ? Number(initial.priceUSD) : undefined, priceLabel: initial.priceLabel ?? "",
        bedrooms: initial.bedrooms, bathrooms: initial.bathrooms, sqm: initial.sqm,
        area: initial.area, district: initial.district ?? "",
        coverImage: initial.coverImage ?? "", images: initial.images ?? [], videoUrl: initial.videoUrl ?? "",
        likes: initial.likes, saves: initial.saves, clicks: initial.clicks ?? 0,
        featured: initial.featured, hasVideo: initial.hasVideo,
        petFriendly: initial.petFriendly, nearBts: initial.nearBts,
        verificationBadge: initial.verificationBadge ?? false,
        expiryDate: initial.expiryDate ? initial.expiryDate.split("T")[0] : "",
        amenities: initial.amenities ?? [],
        features: initial.features ?? [],
        schools: initial.schools ?? [],
        transit: initial.transit ?? [],
        neighborhood: initial.neighborhood ?? "",
      }
    : EMPTY
  );

  const [imagesText, setImagesText] = useState((initial?.images ?? []).join("\n"));
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join("\n"));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // For dynamic schools & transit entry
  const [schoolName, setSchoolName] = useState("");
  const [schoolCurriculum, setSchoolCurriculum] = useState("British");
  const [schoolDist, setSchoolDist] = useState("");

  const [transitStation, setTransitStation] = useState("");
  const [transitDist, setTransitDist] = useState("");

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "coverImage" | "images" | "videoUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);

    try {
      const optimizedFile = await compressAndConvertToWebp(file);

      const formData = new FormData();
      formData.append("file", optimizedFile);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (field === "coverImage") {
        setField("coverImage", data.url);
      } else if (field === "videoUrl") {
        setField("videoUrl", data.url);
        setField("hasVideo", true);
      } else if (field === "images") {
        setImagesText((prev) => (prev ? prev + "\n" + data.url : data.url));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  const toggleAmenity = (amenity: string) => {
    const current = state.amenities ?? [];
    if (current.includes(amenity)) {
      setField("amenities", current.filter((a) => a !== amenity));
    } else {
      setField("amenities", [...current, amenity]);
    }
  };

  const addSchool = () => {
    if (!schoolName || !schoolDist) return;
    const entry = `${schoolName} · ${schoolDist} · ${schoolCurriculum}`;
    setField("schools", [...(state.schools ?? []), entry]);
    setSchoolName("");
    setSchoolDist("");
  };

  const removeSchool = (idx: number) => {
    setField("schools", (state.schools ?? []).filter((_, i) => i !== idx));
  };

  const addTransit = () => {
    if (!transitStation || !transitDist) return;
    const entry = `${transitStation} · ${transitDist}`;
    setField("transit", [...(state.transit ?? []), entry]);
    setTransitStation("");
    setTransitDist("");
  };

  const removeTransit = (idx: number) => {
    setField("transit", (state.transit ?? []).filter((_, i) => i !== idx));
  };

  const generateMockCoordinates = () => {
    // Generate realistic coordinates centered near Sukhumvit Road Bangkok
    const lat = (13.72 + Math.random() * 0.02).toFixed(6);
    const lng = (100.55 + Math.random() * 0.03).toFixed(6);
    // Directly update elements or values
    const latField = document.getElementById("property_lat") as HTMLInputElement;
    const lngField = document.getElementById("property_lng") as HTMLInputElement;
    if (latField) latField.value = lat;
    if (lngField) lngField.value = lng;
    
    // Save to state
    setField("latitude", lat);
    setField("longitude", lng);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    // Parse lat/lng if set on elements
    const latField = document.getElementById("property_lat") as HTMLInputElement;
    const lngField = document.getElementById("property_lng") as HTMLInputElement;
    const finalLat = latField ? latField.value : "";
    const finalLng = lngField ? lngField.value : "";

    const payload = {
      ...state,
      latitude: finalLat || undefined,
      longitude: finalLng || undefined,
      images: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
      features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
      priceLabel: state.listingType === "sale" ? "" : (state.priceLabel || "/month"),
      expiryDate: state.expiryDate || undefined,
    };

    const url    = isNew ? "/api/admin/properties" : `/api/admin/properties/${initial!.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.errors ?? { _form: data.error ?? "Save failed." });
        setSubmitting(false);
        return;
      }
      router.push("/admin/properties");
      router.refresh();
    } catch (err) {
      setErrors({ _form: err instanceof Error ? err.message : "Unknown error" });
      setSubmitting(false);
    }
  };

  const inputCls = "w-full rounded-xl px-4 py-3 text-[13px] outline-none transition-all";
  const inputStyle: React.CSSProperties = {
    border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit",
  };
  const sectionCls = "rounded-2xl p-5 border";
  const sectionStyle = { background: "#FFFFFF", borderColor: "#E5E0D8" };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Columns (Main fields) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Basics */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Basics</h3>
          <div className="flex flex-col gap-4">
            <Field label="Name" error={errors.name}>
              <input
                className={inputCls}
                style={inputStyle}
                value={state.name}
                onChange={(e) => {
                  setField("name", e.target.value);
                  if (isNew && !state.slug) setField("slug", toSlug(e.target.value));
                }}
                placeholder="e.g. Life One Wireless"
                required
              />
            </Field>
            <Field label="Slug (URL)" error={errors.slug} hint="Lowercase, numbers and dashes. Used in public URL structure.">
              <input className={inputCls} style={inputStyle} value={state.slug} onChange={(e) => setField("slug", e.target.value)} required />
            </Field>
            <Field label="Description" error={errors.description}>
              <textarea
                className={`${inputCls} resize-y`}
                style={{ ...inputStyle, minHeight: 120 }}
                value={state.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Detailed property description..."
                required
              />
            </Field>
          </div>
        </div>

        {/* SEO Google Search Snippet Preview Widget */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-3" style={{ color: "#1C3A2F" }}>Google SEO Search Snippet Preview</h3>
          <div className="rounded-xl p-4 border" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
            <div className="text-[12px] text-[#202124] mb-1 font-sans truncate">
              https://nhp-bangkok.com/property/<span className="font-semibold">{state.slug || "slug"}</span>
            </div>
            <div className="text-[17px] text-[#1a0dab] font-sans hover:underline cursor-pointer font-medium leading-[1.3] truncate">
              {state.name || "Untitled Property"} — Premium Bangkok Listing | NHP
            </div>
            <div className="text-[13px] text-[#4d5156] font-sans leading-[1.4] mt-1 line-clamp-2">
              {state.description || "Enter a description above to see a preview of how this property listing will be rendered in search engine results."}
            </div>
          </div>
        </div>

        {/* Specs & Pricing */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Pricing & Specifications</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Listing Type" error={errors.listingType}>
                <select className={inputCls} style={inputStyle} value={state.listingType} onChange={(e) => setField("listingType", e.target.value as ListingType)}>
                  <option value="sale">For Sale</option>
                  <option value="rent">Long Rent</option>
                  <option value="short_stay">Short Stay</option>
                </select>
              </Field>
              <Field label="Property Type" error={errors.propertyType}>
                <select className={inputCls} style={inputStyle} value={state.propertyType} onChange={(e) => setField("propertyType", e.target.value as PropertyType)}>
                  <option value="condo">Condo</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="apartment">Apartment</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label={state.listingType === "sale" ? "Sale Price (THB)" : "Rental Price (THB)"} error={errors.priceTHB}>
                <input type="number" min={0} className={inputCls} style={inputStyle} value={state.priceTHB || ""} onChange={(e) => setField("priceTHB", e.target.value ? Number(e.target.value) : 0)} required />
              </Field>
              <Field label={state.listingType === "sale" ? "Sale Price (USD, Optional)" : "Rental Price (USD, Optional)"}>
                <input type="number" min={0} className={inputCls} style={inputStyle} value={state.priceUSD ?? ""} onChange={(e) => setField("priceUSD", e.target.value ? Number(e.target.value) : undefined)} />
              </Field>
              <Field label="Price Label">
                <select className={inputCls} style={inputStyle} value={state.priceLabel ?? ""} onChange={(e) => setField("priceLabel", e.target.value)}>
                  <option value="">(none — for sale)</option>
                  <option value="/month">/month</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Bedrooms (0 = Studio)" error={errors.bedrooms}>
                <input type="number" min={0} className={inputCls} style={inputStyle} value={state.bedrooms} onChange={(e) => setField("bedrooms", Number(e.target.value))} required />
              </Field>
              <Field label="Bathrooms" error={errors.bathrooms}>
                <input type="number" min={0} className={inputCls} style={inputStyle} value={state.bathrooms} onChange={(e) => setField("bathrooms", Number(e.target.value))} required />
              </Field>
              <Field label="Floor Area (sqm)">
                <input type="number" min={0} className={inputCls} style={inputStyle} value={state.sqm ?? ""} onChange={(e) => setField("sqm", e.target.value ? Number(e.target.value) : undefined)} />
              </Field>
            </div>
          </div>
        </div>

        {/* Image & Video Uploads */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Media & Assets</h3>
          <div className="flex flex-col gap-4">
            
            {/* Cover Image */}
            <div>
              <Field label="Cover Image URL">
                <div className="flex gap-2">
                  <input className={inputCls} style={inputStyle} value={state.coverImage ?? ""} onChange={(e) => setField("coverImage", e.target.value)} placeholder="https://..." />
                  <label className="flex-shrink-0 px-4 py-3 rounded-xl text-[12px] font-semibold cursor-pointer text-white flex items-center justify-center min-w-[110px]" style={{ background: "#1C3A2F" }}>
                    {uploadingField === "coverImage" ? "Uploading..." : "Upload File"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "coverImage")} disabled={uploadingField !== null} />
                  </label>
                </div>
              </Field>
              {state.coverImage && (
                <img src={state.coverImage} alt="Cover Preview" className="mt-2 h-20 rounded-lg border object-cover" />
              )}
            </div>

            {/* Gallery Images */}
            <div>
              <Field label="Gallery Image URLs (One URL per line)" hint="Paste URLs directly or click upload to append new images.">
                <div className="flex flex-col gap-2">
                  <textarea
                    className={`${inputCls} resize-y`}
                    style={{ ...inputStyle, minHeight: 90, fontFamily: "monospace", fontSize: 11 }}
                    value={imagesText}
                    onChange={(e) => setImagesText(e.target.value)}
                    placeholder="https://.../img1.jpg&#10;https://.../img2.jpg"
                  />
                  <label className="self-end px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer text-white text-center" style={{ background: "#1C3A2F" }}>
                    {uploadingField === "images" ? "Uploading Image..." : "Upload Gallery Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "images")} disabled={uploadingField !== null} />
                  </label>
                </div>
              </Field>
            </div>

          </div>
        </div>

        {/* Location & Interactive Coordinates Mock Picker */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Location Coordinates</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Area" error={errors.area}>
                <input className={inputCls} style={inputStyle} value={state.area} onChange={(e) => setField("area", e.target.value)} placeholder="Sukhumvit" required />
              </Field>
              <Field label="District / Sub-area">
                <input className={inputCls} style={inputStyle} value={state.district ?? ""} onChange={(e) => setField("district", e.target.value)} placeholder="Thong Lo" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <input id="property_lat" className={inputCls} style={inputStyle} defaultValue={initial?.latitude ?? ""} placeholder="e.g. 13.729" />
              </Field>
              <Field label="Longitude">
                <input id="property_lng" className={inputCls} style={inputStyle} defaultValue={initial?.longitude ?? ""} placeholder="e.g. 100.568" />
              </Field>
            </div>
            <button
              type="button"
              onClick={generateMockCoordinates}
              className="py-2.5 px-4 rounded-xl text-[12px] font-semibold cursor-pointer border border-[#E5E0D8] text-[#1C3A2F] hover:bg-[#FAF8F3] transition-all self-start"
              style={{ background: "transparent" }}
            >
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Mock Bangkok Coordinates Picker</span>
            </button>
          </div>
        </div>

        {/* Amenities Checklist */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Property Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {POPULAR_AMENITIES.map((amenity) => {
              const isChecked = (state.amenities ?? []).includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border text-left text-[12px] font-medium transition-all"
                  style={{
                    background: isChecked ? "rgba(28,58,47,0.06)" : "#FFFFFF",
                    borderColor: isChecked ? "#1C3A2F" : "#EDE8DF",
                    color: isChecked ? "#1C3A2F" : "#444",
                  }}
                >
                  <input type="checkbox" checked={isChecked} readOnly className="pointer-events-none" />
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        {/* Neighborhood Schools & Transit */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Neighborhood Infrastructure</h3>
          
          {/* Schools Section */}
          <div className="mb-6">
            <h4 className="text-[12px] font-semibold mb-2 text-[#666]">Nearby Schools</h4>
            <div className="flex gap-2 mb-3">
              <input className={inputCls} style={{ ...inputStyle, flex: 2 }} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="School Name (e.g. NIST)" />
              <input className={inputCls} style={{ ...inputStyle, flex: 1 }} value={schoolDist} onChange={(e) => setSchoolDist(e.target.value)} placeholder="Distance (e.g. 4.2 km)" />
              <select className={inputCls} style={{ ...inputStyle, flex: 1 }} value={schoolCurriculum} onChange={(e) => setSchoolCurriculum(e.target.value)}>
                <option value="British">British</option>
                <option value="IB">IB</option>
                <option value="American">American</option>
                <option value="Thai">Thai</option>
              </select>
              <button type="button" onClick={addSchool} className="px-4 rounded-xl text-white font-semibold text-[13px]" style={{ background: "#1C3A2F" }}>Add</button>
            </div>
            <div className="flex flex-col gap-2">
              {(state.schools ?? []).map((s, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2 rounded-xl text-[12px] border" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                  <span>{s}</span>
                  <button type="button" onClick={() => removeSchool(i)} className="text-[11px] text-red-500 hover:underline">Remove</button>
                </div>
              ))}
            </div>
          </div>

          {/* Transit Section */}
          <div>
            <h4 className="text-[12px] font-semibold mb-2 text-[#666]">Nearby Transit (BTS/MRT)</h4>
            <div className="flex gap-2 mb-3">
              <input className={inputCls} style={{ ...inputStyle, flex: 2 }} value={transitStation} onChange={(e) => setTransitStation(e.target.value)} placeholder="Station (e.g. BTS Thong Lo)" />
              <input className={inputCls} style={{ ...inputStyle, flex: 1 }} value={transitDist} onChange={(e) => setTransitDist(e.target.value)} placeholder="Dist (e.g. 5 min walk)" />
              <button type="button" onClick={addTransit} className="px-4 rounded-xl text-white font-semibold text-[13px]" style={{ background: "#1C3A2F" }}>Add</button>
            </div>
            <div className="flex flex-col gap-2">
              {(state.transit ?? []).map((t, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2 rounded-xl text-[12px] border" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                  <span>{t}</span>
                  <button type="button" onClick={() => removeTransit(i)} className="text-[11px] text-red-500 hover:underline">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features & Neighborhood Summary Text */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Special Features & Area Description</h3>
          <div className="flex flex-col gap-4">
            <Field label="Key Unique Features (One per line)">
              <textarea
                className={`${inputCls} resize-y`}
                style={{ ...inputStyle, minHeight: 80, fontFamily: "monospace" }}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder="High Floor&#10;Fully Furnished&#10;Balcony with Skyline View"
              />
            </Field>
            <Field label="Neighborhood Summary / Area Guide">
              <textarea
                className={`${inputCls} resize-y`}
                style={{ ...inputStyle, minHeight: 90 }}
                value={state.neighborhood}
                onChange={(e) => setField("neighborhood", e.target.value)}
                placeholder="Describe the vibe, nearby malls, conveniences in this area..."
              />
            </Field>
          </div>
        </div>

      </div>

      {/* Right Sidebar: Flags & Action buttons */}
      <div className="flex flex-col gap-6">
        
        {/* Flags */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Visibility & Verification Flags</h3>
          <div className="flex flex-col gap-3">
            <FlagToggle label="Featured Listing" hint="Promotes property on homepage" checked={state.featured} onChange={(v) => setField("featured", v)} />
            <FlagToggle label="Pet Friendly" checked={state.petFriendly} onChange={(v) => setField("petFriendly", v)} />
            <FlagToggle label="Near BTS / MRT" checked={state.nearBts} onChange={(v) => setField("nearBts", v)} />
            <FlagToggle label="Verified Listing Badge" hint="Indicates title deed verified" checked={state.verificationBadge ?? false} onChange={(v) => setField("verificationBadge", v)} />
          </div>
        </div>

        {/* Expiry Date */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-3" style={{ color: "#1C3A2F" }}>Listing Expiration</h3>
          <Field label="Expiry Date (Auto-archiving)" hint="Optional. Listing will draft automatically after this date.">
            <input type="date" className={inputCls} style={inputStyle} value={state.expiryDate} onChange={(e) => setField("expiryDate", e.target.value)} />
          </Field>
        </div>

        {/* Form Actions */}
        {errors._form && (
          <p className="text-[12px] px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: "rgba(224,82,82,0.1)", color: "#E05252" }}>
            <AlertTriangle className="w-3.5 h-3.5" /> {errors._form}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button type="submit" disabled={submitting}
            className="w-full py-4 rounded-xl text-[14px] font-semibold cursor-pointer border-none disabled:opacity-60 text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: "#1C3A2F", fontFamily: "inherit" }}>
            {submitting ? "Saving Listing..." : isNew ? "Publish Listing" : "Save Changes"}
          </button>
          <Link href="/admin/properties" className="text-center w-full py-3.5 rounded-xl text-[13px] font-semibold no-underline border transition-all hover:bg-[#FAF8F3]"
            style={{ background: "transparent", borderColor: "#E5E0D8", color: "#555" }}>
            Cancel
          </Link>
        </div>

      </div>
    </form>
  );
}

/* ─── UI Helper Primitives ─── */

function Field({ label, children, error, hint }: { label: string; children: React.ReactNode; error?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[1px] mb-1.5" style={{ color: "#999" }}>{label}</label>
      {children}
      {hint  && !error && <p className="text-[11px] mt-1" style={{ color: "#999" }}>{hint}</p>}
      {error && <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "#E05252" }}><AlertTriangle className="w-3 h-3" /> {error}</p>}
    </div>
  );
}

function FlagToggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer border transition-all"
      style={{
        background:  checked ? "rgba(28,58,47,0.06)" : "#FAF8F3",
        borderColor: checked ? "#1C3A2F" : "#EDE8DF",
        fontFamily:  "inherit",
        textAlign:   "left",
      }}>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold" style={{ color: "#1A1A1A" }}>{label}</div>
        {hint && <div className="text-[11px] mt-0.5" style={{ color: "#999" }}>{hint}</div>}
      </div>
      <div className="w-9 h-5 rounded-full flex-shrink-0 relative transition-all" style={{ background: checked ? "#1C3A2F" : "#D5CDBE" }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{ background: "#FFFFFF", left: checked ? 18 : 2 }} />
      </div>
    </button>
  );
}
