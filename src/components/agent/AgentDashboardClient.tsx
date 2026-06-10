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
  User, 
  LogOut,
  FolderOpen,
  ArrowLeft,
  Settings,
  UploadCloud,
  ListFilter,
  EyeOff,
  Unlock,
  Check
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
  const [activeTab, setActiveTab] = useState<"listings" | "upload" | "settings">("listings");
  const [properties, setProperties] = useState<any[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Listing Upload Form State
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
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [btsStation, setBtsStation] = useState("");
  const [petFriendly, setPetFriendly] = useState(false);
  const [nearBts, setNearBts] = useState(false);
  
  // New Specification Fields
  const [floor, setFloor] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [leaseTerms, setLeaseTerms] = useState("12 months");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Image Upload states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  
  // Notification states
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Agent Settings Form State
  const [agentName, setAgentName] = useState(agent.name);
  const [agentPassword, setAgentPassword] = useState("");
  const [agentPasswordConfirm, setAgentPasswordConfirm] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Amenities checklist defined in PropertyDetail.tsx
  const ALL_AMENITIES = [
    "Swimming Pool",
    "Fitness Center",
    "Garden",
    "Co-working Space",
    "Sauna",
    "24h Security",
    "Parking",
    "Keycard Access"
  ];

  // Quick stats calculations
  const totalListingsCount = properties.length;
  const activeListingsCount = properties.filter((p) => p.status !== "unlisted").length;
  const unlistedListingsCount = properties.filter((p) => p.status === "unlisted").length;
  const totalViewsCount = properties.reduce((acc, p) => acc + (p.viewCount || 0), 0);
  const totalClicksCount = properties.reduce((acc, p) => acc + (p.clicks || 0), 0);

  const handleListingTypeChange = (type: "sale" | "rent" | "short_stay") => {
    setListingType(type);
    if (type === "short_stay") {
      setLeaseTerms("1 month");
    } else if (type === "rent") {
      setLeaseTerms("12 months");
    } else {
      setLeaseTerms("");
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Cover image exceeds the 3MB size limit.");
      return;
    }

    setUploadingCover(true);
    setError("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/agent/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image.");

      setCoverImage(data.url);
      setSuccessMsg("Cover image uploaded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading cover image.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleExtraImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (extraImages.length + files.length > 5) {
      setError("Maximum of 5 additional images allowed.");
      return;
    }

    setUploadingExtra(true);
    setError("");
    setSuccessMsg("");

    const uploadedUrls = [...extraImages];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 3 * 1024 * 1024) {
          setError(`File "${file.name}" exceeds 3MB limit and was skipped.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/agent/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed.");

        uploadedUrls.push(data.url);
      }
      setExtraImages(uploadedUrls);
      setSuccessMsg("Additional images uploaded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading additional images.");
    } finally {
      setUploadingExtra(false);
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

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
          floor: floor ? Number(floor) : undefined,
          totalFloors: totalFloors ? Number(totalFloors) : undefined,
          availableFrom: availableFrom || undefined,
          leaseTerms: leaseTerms || undefined,
          amenities: selectedAmenities,
          images: extraImages,
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
      setExtraImages([]);
      setBtsStation("");
      setDistrict("");
      setFloor("");
      setTotalFloors("");
      setAvailableFrom("");
      setSelectedAmenities([]);
      setPetFriendly(false);
      setNearBts(false);

      // Refresh listings
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

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "unlisted" ? "active" : "unlisted";
    setActionLoading(id);

    try {
      const res = await fetch(`/api/agent/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setProperties(properties.map((p) => p.id === id ? { ...p, status: nextStatus } : p));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to toggle property listing status.");
      }
    } catch {
      alert("Error updating property status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this property? This action is permanent and cannot be undone.")) return;
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");
    setSettingsLoading(true);

    if (agentPassword && agentPassword !== agentPasswordConfirm) {
      setSettingsError("Passwords do not match.");
      setSettingsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/agent/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName,
          password: agentPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      setSettingsSuccess("Profile settings updated successfully!");
      setAgentPassword("");
      setAgentPasswordConfirm("");
      router.refresh();
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : "Error updating settings.");
    } finally {
      setSettingsLoading(false);
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
              onClick={() => setActiveTab("settings")}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-left border-none cursor-pointer transition-all"
              style={{
                background: activeTab === "settings" ? "rgba(201,168,76,0.18)" : "transparent",
                color: activeTab === "settings" ? "#E2C97E" : "rgba(255,255,255,0.65)",
              }}
            >
              <Settings size={16} /> Profile & Settings
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
                  {activeTab === "listings" ? "My Property Listings" : activeTab === "upload" ? "Upload New Property" : "Profile & Settings"}
                </h1>
                <p className="text-[13px] text-[#999] font-light mt-0.5">
                  {activeTab === "listings" 
                    ? `Manage your portfolio of ${properties.length} active listings in Bangkok.` 
                    : activeTab === "upload" 
                    ? "Enter listing specs below. Once posted, listings are active immediately." 
                    : "Update your workspace profile and password credentials."}
                </p>
              </div>
              {activeTab === "listings" && (
                <button
                  onClick={() => setActiveTab("upload")}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold border-none cursor-pointer text-white transition-opacity hover:opacity-95"
                  style={{ background: "#1C3A2F" }}
                >
                  <Plus size={14} /> Add Property
                </button>
              )}
            </div>

            {/* Quick Analytics Stats cards (shown on My Listings tab) */}
            {activeTab === "listings" && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-5 rounded-2xl border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-gray-400">Total Listings</div>
                  <div className="text-[24px] font-bold text-[#1C3A2F] mt-1">{totalListingsCount}</div>
                </div>
                <div className="p-5 rounded-2xl border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-gray-400">Active Listed</div>
                  <div className="text-[24px] font-bold text-[#2E7D4F] mt-1">{activeListingsCount}</div>
                </div>
                <div className="p-5 rounded-2xl border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-gray-400">Draft / Unlisted</div>
                  <div className="text-[24px] font-bold text-[#8B6914] mt-1">{unlistedListingsCount}</div>
                </div>
                <div className="p-5 rounded-2xl border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-gray-400">Total Views / Clicks</div>
                  <div className="text-[24px] font-bold text-[#C9A84C] mt-1">{totalViewsCount} / {totalClicksCount}</div>
                </div>
              </div>
            )}

            {/* TAB: LISTINGS */}
            {activeTab === "listings" && (
              <div className="overflow-x-auto rounded-2xl" style={{ background: "#FFFFFF", border: borderStyle }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#FAF8F3", borderBottom: borderStyle }}>
                      <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Property</th>
                      <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Specs</th>
                      <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Price</th>
                      <th className="text-center text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Status</th>
                      <th className="text-center text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Engagement</th>
                      <th className="text-right text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => {
                      const isUnlisted = prop.status === "unlisted";
                      return (
                        <tr key={prop.id} style={{ borderBottom: "1px solid #F0EAE0" }}>
                          <td className="px-4 py-4 min-w-[200px]">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-cover bg-center bg-[#EDE8DF]" style={{ backgroundImage: `url(${prop.coverImage || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&auto=format&q=80"})` }} />
                              <div className="min-w-0">
                                <div className="text-[13px] font-bold text-[#1A1A1A] truncate">{prop.name}</div>
                                <div className="text-[11px] text-gray-400 mt-0.5 truncate">{prop.area} · {prop.propertyType}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[12px] text-gray-600">
                            <div>{prop.bedrooms} Bed · {prop.bathrooms} Bath</div>
                            {prop.floor && <div className="text-[10px] text-gray-400 mt-0.5">Floor: {prop.floor} / {prop.totalFloors || "—"}</div>}
                          </td>
                          <td className="px-4 py-4 text-[13px] font-bold text-[#1C3A2F]">
                            ฿{prop.priceTHB.toLocaleString()}{prop.priceLabel || (prop.listingType === "sale" ? "" : "/month")}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {isUnlisted ? (
                              <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-amber-200">
                                <EyeOff size={10} /> Unlisted
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-emerald-200">
                                <CheckCircle2 size={10} /> Listed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-3 text-[12px] text-gray-500">
                              <span className="flex items-center gap-1" title="Views"><Eye size={12} /> {prop.viewCount || 0}</span>
                              <span className="flex items-center gap-1" title="Clicks"><MousePointerClick size={12} /> {prop.clicks || 0}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleToggleStatus(prop.id, prop.status || "active")}
                                disabled={actionLoading === prop.id}
                                className="px-2 py-1.5 rounded text-[11px] font-bold border cursor-pointer transition-colors"
                                style={{
                                  background: isUnlisted ? "#1C3A2F" : "#FFFFFF",
                                  color: isUnlisted ? "#FFFFFF" : "#1C3A2F",
                                  borderColor: "#1C3A2F"
                                }}
                                title={isUnlisted ? "Make listing public" : "Unlist listing"}
                              >
                                {isUnlisted ? "Publish" : "Unlist"}
                              </button>
                              <button
                                onClick={() => handleDelete(prop.id)}
                                disabled={actionLoading === prop.id}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 bg-transparent border-none cursor-pointer rounded transition-colors"
                                title="Delete Listing"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                  {/* Title & Price */}
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

                  {/* Listing Type, Property Type & Neighborhood */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Listing Type *</label>
                      <select
                        value={listingType}
                        onChange={(e) => handleListingTypeChange(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                        style={inputStyle}
                      >
                        <option value="rent">Rent / Long Lease</option>
                        <option value="short_stay">Short Rent / Short Stay</option>
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

                  {/* Lease Terms (Conditional for Short Stay) */}
                  {listingType === "short_stay" && (
                    <div className="p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Short Term Rental Duration *</label>
                        <select
                          value={leaseTerms}
                          onChange={(e) => setLeaseTerms(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                          style={inputStyle}
                        >
                          <option value="1 month rent">1 Month Rent</option>
                          <option value="2 months rent">2 Months Rent</option>
                          <option value="3 months to 6 months rent">3 Months to 6 Months</option>
                        </select>
                      </div>
                      <div className="text-[12px] text-gray-500 font-light mt-4 md:mt-0 max-w-sm">
                        Specify the minimum duration the tenant can stay for this short-stay vacation or sub-let property.
                      </div>
                    </div>
                  )}

                  {/* Basic Specifications: Beds, Baths, Sqm, District */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                  {/* Floor and Availability Specifications */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Property Floor Number</label>
                      <input
                        type="number"
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        placeholder="e.g. 14"
                        className="w-full px-4 py-3 rounded-xl text-[14px]"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Total Building Floors</label>
                      <input
                        type="number"
                        value={totalFloors}
                        onChange={(e) => setTotalFloors(e.target.value)}
                        placeholder="e.g. 32"
                        className="w-full px-4 py-3 rounded-xl text-[14px]"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Date Available From</label>
                      <input
                        type="date"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-[14px]"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a detailed description about the listing, furnishings, orientation, view..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                      style={{ ...inputStyle, resize: "none" }}
                    />
                  </div>

                  {/* Amenities Checklist */}
                  <div className="p-5 rounded-2xl border" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <label className="block text-[11px] font-bold uppercase tracking-[1.5px] text-[#C9A84C] mb-4">Select Amenities Available</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {ALL_AMENITIES.map((amenity) => {
                        const checked = selectedAmenities.includes(amenity);
                        return (
                          <label key={amenity} className="flex items-center gap-2.5 text-[13px] text-gray-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleAmenityToggle(amenity)}
                              className="w-4.5 h-4.5 accent-[#1C3A2F] rounded cursor-pointer"
                            />
                            <span>{amenity}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Image Upload Area */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl border" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    {/* Cover Image Upload */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1C3A2F] mb-2">Cover Image *</label>
                      <div
                        className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden h-[180px] bg-white hover:border-[#C9A84C]"
                        style={{ borderColor: "#E5E0D8" }}
                      >
                        {coverImage ? (
                          <>
                            <img src={coverImage} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => setCoverImage("")}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg border-none cursor-pointer"
                              >
                                Replace Photo
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="text-[#C9A84C] mb-2" size={36} />
                            <div className="text-[12px] font-bold text-gray-700">Upload Cover Photo</div>
                            <div className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 3MB limit</div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </>
                        )}
                        {uploadingCover && (
                          <div className="absolute inset-0 bg-white/85 flex items-center justify-center text-[12px] font-semibold text-[#1C3A2F]">
                            Uploading Cover...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Images Upload */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#1C3A2F] mb-2">Additional Gallery Images (Max 5)</label>
                      <div
                        className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden h-[100px] bg-white hover:border-[#C9A84C]"
                        style={{ borderColor: "#E5E0D8" }}
                      >
                        <UploadCloud className="text-[#C9A84C] mb-1" size={24} />
                        <div className="text-[11px] font-bold text-gray-700">Select Gallery Photos</div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleExtraImagesUpload}
                          disabled={extraImages.length >= 5}
                          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        {uploadingExtra && (
                          <div className="absolute inset-0 bg-white/85 flex items-center justify-center text-[12px] font-semibold text-[#1C3A2F]">
                            Uploading Gallery...
                          </div>
                        )}
                      </div>

                      {/* Extra images preview strip */}
                      {extraImages.length > 0 && (
                        <div className="flex gap-2.5 mt-3 flex-wrap">
                          {extraImages.map((imgUrl, idx) => (
                            <div key={idx} className="w-14 h-14 rounded-lg relative overflow-hidden border bg-[#F0EAE0]">
                              <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setExtraImages(extraImages.filter((_, i) => i !== idx))}
                                className="absolute top-0 right-0 p-1 bg-red-600 hover:bg-red-700 text-white rounded-bl border-none cursor-pointer"
                                title="Remove Image"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BTS and Walkable checkmarks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="flex items-center gap-6 md:pt-6">
                      <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={petFriendly}
                          onChange={(e) => setPetFriendly(e.target.checked)}
                          className="w-4.5 h-4.5 accent-[#1C3A2F]"
                        />
                        Pet Friendly Building
                      </label>

                      <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={nearBts}
                          onChange={(e) => setNearBts(e.target.checked)}
                          className="w-4.5 h-4.5 accent-[#1C3A2F]"
                        />
                        Walking Distance to BTS/MRT
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "#E5E0D8" }}>
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
                      className="px-6 py-3 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white disabled:opacity-60 transition-opacity hover:opacity-95"
                      style={{ background: "#1C3A2F" }}
                    >
                      {loading ? "Posting..." : "Post Listing"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: PROFILE & SETTINGS */}
            {activeTab === "settings" && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-6">
                {/* Left col: account overview summary */}
                <div className="p-6 rounded-2xl border flex flex-col gap-5 bg-white" style={{ borderColor: "#E5E0D8" }}>
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#FAF8F3" }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#C9A84C] text-[#1C3A2F] text-lg font-bold">
                      {agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-[#1C3A2F]">{agentName}</h3>
                      <p className="text-[12px] text-gray-400 font-light mt-0.5 truncate max-w-[150px]">{agent.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5 text-[13px]">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-400">Account Role</span>
                      <span className="font-semibold text-[#1A1A1A]">Agent Partner</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-400">Registration Date</span>
                      <span className="font-medium text-[#1A1A1A]">
                        {new Date(agent.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-400">Verification State</span>
                      <span className="font-bold text-emerald-700 uppercase tracking-[0.5px]">active</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Permissions</span>
                      <span className="font-semibold text-emerald-700">Full Upload Access</span>
                    </div>
                  </div>
                </div>

                {/* Right col: settings update form */}
                <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "#E5E0D8" }}>
                  <h3 className="text-[16px] font-bold text-[#1C3A2F] mb-6">Update Profile Credentials</h3>
                  
                  {settingsError && (
                    <div className="p-4 rounded-xl text-[13px] mb-5 border font-medium bg-red-50 border-red-200 text-red-700">
                      ⚠️ {settingsError}
                    </div>
                  )}
                  {settingsSuccess && (
                    <div className="p-4 rounded-xl text-[13px] mb-5 border font-medium bg-emerald-50 border-emerald-200 text-emerald-700">
                      ✅ {settingsSuccess}
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="flex flex-col gap-5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Agent Display Name *</label>
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Change Password (Optional)</label>
                      <input
                        type="password"
                        value={agentPassword}
                        onChange={(e) => setAgentPassword(e.target.value)}
                        placeholder="Enter new password (min. 6 characters)"
                        className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        value={agentPasswordConfirm}
                        onChange={(e) => setAgentPasswordConfirm(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                        style={inputStyle}
                      />
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        disabled={settingsLoading}
                        className="px-6 py-3 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white disabled:opacity-60 transition-opacity hover:opacity-95"
                        style={{ background: "#1C3A2F" }}
                      >
                        {settingsLoading ? "Saving Changes..." : "Save Settings"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
