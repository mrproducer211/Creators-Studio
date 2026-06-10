"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  Building2, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Eye, 
  MousePointerClick, 
  Heart, 
  User, 
  LogOut,
  FolderOpen,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface AgentDashboardClientProps {
  agent: {
    id: string;
    name: string;
    email: string;
    agentStatus?: "pending" | "approved" | "rejected";
    createdAt: string;
  };
  initialProperties: any[];
}

export default function AgentDashboardClient({ agent, initialProperties }: AgentDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"listings" | "upload" | "account">("listings");
  const [properties, setProperties] = useState<any[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceTHB, setPriceTHB] = useState("");
  const [listingType, setListingType] = useState<"sale" | "rent" | "short_stay">("rent");
  const [propertyType, setPropertyType] = useState<"condo" | "apartment" | "house" | "villa" | "townhouse">("condo");
  const [area, setArea] = useState("Sukhumvit");
  const [district, setDistrict] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [sqm, setSqm] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [btsStation, setBtsStation] = useState("");
  const [petFriendly, setPetFriendly] = useState(false);
  const [nearBts, setNearBts] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (!name.trim() || !priceTHB || !area) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/agent/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          listingType,
          propertyType,
          priceTHB: Number(priceTHB),
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          sqm: sqm ? Number(sqm) : undefined,
          area,
          district: district || undefined,
          coverImage: coverImage || undefined,
          btsStation: btsStation || undefined,
          petFriendly,
          nearBts,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload listing.");

      setSuccessMsg("Property listing uploaded successfully!");
      // Reset form
      setName("");
      setDescription("");
      setPriceTHB("");
      setSqm("");
      setCoverImage("");
      setBtsStation("");
      setDistrict("");
      setPetFriendly(false);
      setNearBts(false);

      // Refresh properties list
      const fetchListings = await fetch("/api/agent/properties");
      if (fetchListings.ok) {
        const listData = await fetchListings.json();
        setProperties(listData.properties || []);
      }

      setTimeout(() => {
        setActiveTab("listings");
        setSuccessMsg("");
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating property.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this property? This cannot be undone.")) return;
    setActionLoading(id);

    try {
      const res = await fetch(`/api/agent/properties/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProperties(properties.filter((p) => p.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete property.");
      }
    } catch {
      alert("Error deleting property.");
    } finally {
      setActionLoading(null);
    }
  };

  const status = agent.agentStatus || "pending";
  const borderStyle = "1px solid #E5E0D8";
  const inputStyle = {
    border: "1.5px solid #E5E0D8",
    background: "#FFFFFF",
    color: "#1A1A1A",
    fontFamily: "inherit",
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#F7F3EC" }}>
      {/* Sidebar Panel */}
      <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col p-6 text-white" style={{ background: "#1C3A2F" }}>
        <Link href="/" className="flex items-center gap-3 no-underline mb-8">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: "#C9A84C", color: "#1C3A2F" }}>NHP</div>
          <div>
            <div className="text-[14px] font-semibold text-white">Agent Workspace</div>
            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>Bangkok, TH</div>
          </div>
        </Link>

        {status === "approved" && (
          <nav className="flex flex-col gap-1 flex-1">
            <button
              onClick={() => setActiveTab("listings")}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-left border-none cursor-pointer transition-all"
              style={{
                background: activeTab === "listings" ? "rgba(201,168,76,0.18)" : "transparent",
                color: activeTab === "listings" ? "#E2C97E" : "rgba(255,255,255,0.65)",
              }}
            >
              <FolderOpen size={16} /> My Listings
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-left border-none cursor-pointer transition-all"
              style={{
                background: activeTab === "upload" ? "rgba(201,168,76,0.18)" : "transparent",
                color: activeTab === "upload" ? "#E2C97E" : "rgba(255,255,255,0.65)",
              }}
            >
              <Plus size={16} /> Upload Property
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-left border-none cursor-pointer transition-all"
              style={{
                background: activeTab === "account" ? "rgba(201,168,76,0.18)" : "transparent",
                color: activeTab === "account" ? "#E2C97E" : "rgba(255,255,255,0.65)",
              }}
            >
              <User size={16} /> Account Status
            </button>
          </nav>
        )}

        {status !== "approved" && (
          <div className="flex-1 flex flex-col justify-center text-center p-4 rounded-2xl mb-6" style={{ background: "rgba(0,0,0,0.15)", border: "1px dashed rgba(255,255,255,0.15)" }}>
            <AlertCircle className="mx-auto mb-2 text-[#C9A84C]" size={28} />
            <div className="text-[12px] font-medium text-white mb-1">Awaiting Approval</div>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>Verification is pending. Once approved, tabs will activate.</p>
          </div>
        )}

        <div className="mt-auto pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-4" style={{ background: "rgba(0,0,0,0.2)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold bg-[#C9A84C] text-[#1C3A2F]">
              {agent.name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold truncate text-white">{agent.name}</div>
              <div className="text-[10px] uppercase tracking-[0.5px]" style={{ color: "#C9A84C" }}>Agent</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium border-none cursor-pointer transition-all hover:opacity-85 text-white"
            style={{ background: "rgba(255,255,255,0.06)", fontFamily: "inherit" }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-5xl">
        {/* Status Banners */}
        {status === "pending" && (
          <div className="p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-4 mb-8" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-50 text-amber-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#1C3A2F] mb-0.5">Verification Pending</h2>
              <p className="text-[13px] font-light leading-relaxed text-[#666]">
                Welcome, <strong>{agent.name}</strong>! Your application is currently in queue for admin verification. 
                You will receive a notification and full dashboard functionality to post properties as soon as an administrator approves your account.
              </p>
            </div>
          </div>
        )}

        {status === "rejected" && (
          <div className="p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-4 mb-8" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-red-50 text-red-600">
              <XCircle size={24} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-red-700 mb-0.5">Application Rejected</h2>
              <p className="text-[13px] font-light leading-relaxed text-[#666]">
                We regret to inform you that your registration request as an agent partner was not approved. 
                Please contact support at <strong>admin@nhp-bangkok.com</strong> for assistance or if you believe this is an error.
              </p>
            </div>
          </div>
        )}

        {/* Tab contents */}
        {status === "approved" && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-[24px] font-bold text-[#1A1A1A] tracking-[-0.5px]">
                  {activeTab === "listings" ? "My Property Listings" : activeTab === "upload" ? "Upload New Property" : "Account Status"}
                </h1>
                <p className="text-[13px] text-[#999] font-light mt-0.5">
                  {activeTab === "listings" 
                    ? `Manage your portfolio of ${properties.length} active listings in Bangkok.` 
                    : activeTab === "upload" 
                    ? "Enter listing specs below. Once posted, listings are active immediately." 
                    : "Review your agent credentials and verification status."}
                </p>
              </div>
              {activeTab === "listings" && (
                <button
                  onClick={() => setActiveTab("upload")}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold border-none cursor-pointer text-white"
                  style={{ background: "#1C3A2F" }}
                >
                  <Plus size={14} /> Add Property
                </button>
              )}
            </div>

            {/* TAB: LISTINGS */}
            {activeTab === "listings" && (
              <div className="overflow-x-auto rounded-2xl" style={{ background: "#FFFFFF", border: borderStyle }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#FAF8F3", borderBottom: borderStyle }}>
                      <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Property</th>
                      <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Details</th>
                      <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Price</th>
                      <th className="text-center text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Analytics</th>
                      <th className="text-center text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Verification</th>
                      <th className="text-right text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => (
                      <tr key={prop.id} style={{ borderBottom: "1px solid #F0EAE0" }}>
                        <td className="px-4 py-4 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-cover bg-center bg-[#EDE8DF]" style={{ backgroundImage: `url(${prop.coverImage})` }} />
                            <div className="min-w-0">
                              <div className="text-[13px] font-bold text-[#1A1A1A] truncate">{prop.name}</div>
                              <div className="text-[11px] text-gray-400 mt-0.5 truncate">{prop.area} · {prop.propertyType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[12px] text-gray-600">
                          {prop.bedrooms} Bed · {prop.bathrooms} Bath · {prop.sqm ? `${prop.sqm} sqm` : "N/A"}
                        </td>
                        <td className="px-4 py-4 text-[13px] font-bold text-[#1C3A2F]">
                          ฿{prop.priceTHB.toLocaleString()}{prop.priceLabel || "/month"}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-3 text-[12px] text-gray-500">
                            <span className="flex items-center gap-1"><Eye size={12} /> {prop.viewCount || 0}</span>
                            <span className="flex items-center gap-1"><MousePointerClick size={12} /> {prop.clicks || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {prop.verificationBadge ? (
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 size={10} /> Verified
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <AlertCircle size={10} /> Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleDelete(prop.id)}
                            disabled={actionLoading === prop.id}
                            className="p-2 text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {properties.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-gray-400 text-[13px]">
                          No listings posted yet. Click "+ Add Property" to upload your first listing!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: UPLOAD FORM */}
            {activeTab === "upload" && (
              <div className="p-6 rounded-2xl border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
                {error && (
                  <div className="p-4 rounded-xl text-[13px] mb-5 border font-medium bg-red-50 border-red-200 text-red-700">
                    ⚠️ {error}
                  </div>
                )}
                {successMsg && (
                  <div className="p-4 rounded-xl text-[13px] mb-5 border font-medium bg-emerald-50 border-emerald-200 text-emerald-700">
                    ✅ {successMsg}
                  </div>
                )}

                <form onSubmit={handleUpload} className="flex flex-col gap-6">
                  {/* Grid Rows */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Property Name / Title *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Noble Solo Thonglor Luxury Penthouse"
                        required
                        className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Price (THB) *</label>
                      <input
                        type="number"
                        value={priceTHB}
                        onChange={(e) => setPriceTHB(e.target.value)}
                        placeholder="e.g. 45000"
                        required
                        className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Listing Type *</label>
                      <select
                        value={listingType}
                        onChange={(e) => setListingType(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                        style={inputStyle}
                      >
                        <option value="rent">Rent / Long Lease</option>
                        <option value="short_stay">Short Rent / Vacation</option>
                        <option value="sale">For Sale</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Property Type *</label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                        style={inputStyle}
                      >
                        <option value="condo">Condominium</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="villa">Luxury Villa</option>
                        <option value="townhouse">Townhouse</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Neighborhood Area *</label>
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                        style={inputStyle}
                      >
                        {["Sukhumvit", "Sathorn", "Thong Lo", "Asok", "Silom", "On Nut", "Ekkamai", "Ari", "Rama 9", "Bang Na", "Huai Khwang", "Phaya Thai"].map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Bedrooms</label>
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-[14px]"
                        style={inputStyle}
                      >
                        {["0 (Studio)", "1", "2", "3", "4", "5+"].map((v, idx) => (
                          <option key={idx} value={idx}>{v}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Bathrooms</label>
                      <select
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-[14px]"
                        style={inputStyle}
                      >
                        {["1", "2", "3", "4+"].map((v, idx) => (
                          <option key={idx} value={idx + 1}>{v}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Sqm Size</label>
                      <input
                        type="number"
                        value={sqm}
                        onChange={(e) => setSqm(e.target.value)}
                        placeholder="e.g. 52"
                        className="w-full px-4 py-3 rounded-xl text-[14px]"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">District</label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Khlong Toei"
                        className="w-full px-4 py-3 rounded-xl text-[14px]"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a detailed description about the listing, amenities, lease terms..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                      style={{ ...inputStyle, resize: "none" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Cover Image URL</label>
                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/..."
                        className="w-full px-4 py-3 rounded-xl text-[14px]"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Nearest BTS/MRT Station</label>
                      <input
                        type="text"
                        value={btsStation}
                        onChange={(e) => setBtsStation(e.target.value)}
                        placeholder="e.g. Thong Lo BTS"
                        className="w-full px-4 py-3 rounded-xl text-[14px]"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 py-2">
                    <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={petFriendly}
                        onChange={(e) => setPetFriendly(e.target.checked)}
                        className="w-4 h-4 accent-[#1C3A2F]"
                      />
                      Pet Friendly Building
                    </label>

                    <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nearBts}
                        onChange={(e) => setNearBts(e.target.checked)}
                        className="w-4 h-4 accent-[#1C3A2F]"
                      />
                      Within walking distance to BTS/MRT
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setActiveTab("listings")}
                      className="px-6 py-3 rounded-xl text-[13px] font-semibold border bg-transparent cursor-pointer hover:bg-gray-50"
                      style={{ borderColor: "#E5E0D8", color: "#1A1A1A" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white disabled:opacity-60"
                      style={{ background: "#1C3A2F" }}
                    >
                      {loading ? "Posting..." : "Post Listing"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: ACCOUNT STATUS */}
            {activeTab === "account" && (
              <div className="p-6 rounded-2xl border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
                <div className="flex items-center gap-4 p-5 rounded-2xl border mb-6" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#C9A84C] text-[#1C3A2F] text-lg font-bold">
                    {agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1C3A2F]">{agent.name}</h3>
                    <p className="text-[12px] text-gray-400 font-light mt-0.5">{agent.email} · Partner ID: {agent.id}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between py-3 border-b text-[13px]">
                    <span className="text-gray-500">Account Type</span>
                    <span className="font-semibold text-[#1A1A1A]">Agent Partner</span>
                  </div>
                  <div className="flex justify-between py-3 border-b text-[13px]">
                    <span className="text-gray-500">Registration Date</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {new Date(agent.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b text-[13px]">
                    <span className="text-gray-500">Verification State</span>
                    <span className="font-bold uppercase tracking-[0.5px]" style={{ color: "#2E7D4F" }}>
                      {status}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 text-[13px]">
                    <span className="text-gray-500">Upload Permissions</span>
                    <span className="font-semibold text-[#2E7D4F]">Active (Approved to Post)</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
