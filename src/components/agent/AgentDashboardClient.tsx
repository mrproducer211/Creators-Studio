"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
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
  Settings,
  UploadCloud,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  FileText,
  ShieldAlert,
  Calendar,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

interface AgentDashboardClientProps {
  agent: {
    id: string;
    name: string;
    email: string;
    agentStatus?: "pending" | "approved" | "rejected";
    createdAt: string;
    postingRestricted?: boolean;
    requireVerification?: boolean;
  };
  initialProperties: any[];
}

export default function AgentDashboardClient({ agent, initialProperties }: AgentDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"listings" | "leads" | "bookings" | "upload" | "settings">("listings");
  const [properties, setProperties] = useState<any[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (agent.postingRestricted && activeTab === "upload") {
      setActiveTab("listings");
    }
  }, [agent.postingRestricted, activeTab]);

  // Leads & Bookings states
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const res = await fetch("/api/agent/leads");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLeadsLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch("/api/agent/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleUpdateLeadStatus = async (id: number | string, newStatus: string) => {
    try {
      const res = await fetch("/api/agent/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setEnquiries(enquiries.map((e) => e.id === id ? { ...e, status: newStatus } : e));
      } else {
        alert("Failed to update lead status.");
      }
    } catch (err) {
      console.error("Error updating lead status:", err);
    }
  };

  const handleUpdateBookingStatus = async (id: number | string, newStatus: string) => {
    try {
      const res = await fetch("/api/agent/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setAppointments(appointments.map((a) => a.id === id ? { ...a, status: newStatus } : a));
      } else {
        alert("Failed to update booking status.");
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "leads") {
      fetchLeads();
    } else if (activeTab === "bookings") {
      fetchBookings();
    }
  }, [activeTab]);

  const getPropertyName = (item: any) => {
    const prop = properties.find(
      (p) => p.id === item.propertyId || p.slug === item.propertySlug
    );
    return prop ? prop.name : item.propertyName || "Unknown Property";
  };
  
  // Listing Upload Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceTHB, setPriceTHB] = useState("");
  const [listingType, setListingType] = useState<"sale" | "rent" | "short_stay">("rent");
  const [propertyType, setPropertyType] = useState<"condo" | "apartment" | "house" | "villa" | "townhouse">("condo");
  const [area, setArea] = useState("Sukhumvit");
  const [customArea, setCustomArea] = useState("");
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
  const [furnishing, setFurnishing] = useState<"furnished" | "partially_furnished" | "unfurnished">("furnished");
  
  // Wizard steps state: 1 = Basic, 2 = Specs & Media, 3 = Review
  const [uploadStep, setUploadStep] = useState<1 | 2 | 3>(1);
  
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

  const handleUploadSubmit = async (submitStatus: "active" | "unlisted") => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const finalArea = area === "Other" ? customArea.trim() : area;

    if (!name.trim() || !priceTHB || !finalArea) {
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
          area: finalArea,
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
          furnishing,
          status: submitStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload listing.");

      setSuccessMsg(
        data.property?.pendingVerification
          ? "Property listing submitted for administrator verification!"
          : submitStatus === "unlisted"
          ? "Property listing saved as draft successfully!"
          : "Property listing published successfully!"
      );
      
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
      setFurnishing("furnished");
      setCustomArea("");
      setUploadStep(1);

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
        const data = await res.json();
        const updatedProp = data.property || { ...properties.find((p) => p.id === id), status: nextStatus };
        setProperties(properties.map((p) => p.id === id ? updatedProp : p));
        if (updatedProp.pendingVerification) {
          alert("Publishing this listing requires administrator verification. It has been submitted for review.");
        }
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update property listing status.");
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

  const handleRenewProperty = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/properties/${id}/renew`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh listings
        const fetchListings = await fetch("/api/agent/properties");
        if (fetchListings.ok) {
          const listData = await fetchListings.json();
          setProperties(listData.properties || []);
        }
        alert(data.property?.pendingVerification 
          ? "Property submitted for verification!" 
          : "Property successfully republished!");
      } else {
        alert(data.error || "Failed to renew property.");
      }
    } catch (err) {
      alert("Error renewing property.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismissExpiryPrompt = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/agent/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiryDate: null }),
      });
      if (res.ok) {
        setProperties(properties.map((p) => p.id === id ? { ...p, expiryDate: undefined } : p));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to dismiss prompt.");
      }
    } catch {
      alert("Error dismissing prompt.");
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

  const validateStep1 = () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter a property name.");
      return false;
    }
    if (!priceTHB || Number(priceTHB) <= 0) {
      setError("Please enter a valid price in THB.");
      return false;
    }
    const finalArea = area === "Other" ? customArea.trim() : area;
    if (!finalArea) {
      setError("Please select or specify a neighborhood area.");
      return false;
    }
    return true;
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setUploadStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStep2Next = () => {
    setError("");
    if (!coverImage) {
      setError("Please upload a cover image to continue.");
      return;
    }
    setUploadStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="min-h-screen flex flex-col lg:flex-row pb-20 lg:pb-0" style={{ background: "#F7F3EC" }}>
      {/* Sidebar Panel - Custom Responsive Layout */}
      <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col p-4 lg:p-6 text-white lg:min-h-screen" style={{ background: "#1C3A2F" }}>
        {/* Desktop Logo Header */}
        <div className="hidden lg:block">
          <Link href="/" className="flex items-center gap-3 no-underline mb-8">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm bg-[#C9A84C] text-[#1C3A2F]">NHP</div>
            <div>
              <div className="text-[14px] font-semibold text-white">Agent Workspace</div>
              <div className="text-[10px] text-white/45">Bangkok, TH</div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        {status === "approved" && (
          <nav className="hidden lg:flex flex-col gap-1 flex-1">
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
              onClick={() => setActiveTab("leads")}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-left border-none cursor-pointer transition-all"
              style={{
                background: activeTab === "leads" ? "rgba(201,168,76,0.18)" : "transparent",
                color: activeTab === "leads" ? "#E2C97E" : "rgba(255,255,255,0.65)",
              }}
            >
              <MessageSquare size={16} /> Leads & Enquiries
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-left border-none cursor-pointer transition-all"
              style={{
                background: activeTab === "bookings" ? "rgba(201,168,76,0.18)" : "transparent",
                color: activeTab === "bookings" ? "#E2C97E" : "rgba(255,255,255,0.65)",
              }}
            >
              <Calendar size={16} /> Bookings & Tours
            </button>
            {!agent.postingRestricted && (
              <button
                onClick={() => {
                  setActiveTab("upload");
                  setUploadStep(1);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-left border-none cursor-pointer transition-all"
                style={{
                  background: activeTab === "upload" ? "rgba(201,168,76,0.18)" : "transparent",
                  color: activeTab === "upload" ? "#E2C97E" : "rgba(255,255,255,0.65)",
                }}
              >
                <Plus size={16} /> Upload Property
              </button>
            )}
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

        {/* Mobile Top compact header */}
        <div className="flex lg:hidden items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2 no-underline text-white">
            <div className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs bg-[#C9A84C] text-[#1C3A2F]">NHP</div>
            <span className="text-[13px] font-semibold">Agent Partner</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/70 truncate max-w-[120px] font-light">{agent.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-2.5 py-1 rounded text-[10px] font-medium border-none cursor-pointer text-white bg-white/10"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Desktop Profile Status Footer */}
        <div className="hidden lg:block mt-auto pt-6 border-t border-white/8">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-4" style={{ background: "rgba(0,0,0,0.2)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold bg-[#C9A84C] text-[#1C3A2F]">
              {agent.name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold truncate text-white">{agent.name}</div>
              <div className="text-[10px] uppercase tracking-[0.5px]" style={{ color: "#C9A84C" }}>Agent</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Tab Bar Navigation */}
      {status === "approved" && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1C3A2F] border-t border-white/10 h-16 flex items-center justify-around z-50 text-white shadow-lg">
          <button
            onClick={() => setActiveTab("listings")}
            className="flex flex-col items-center justify-center gap-1 bg-transparent border-none text-white cursor-pointer flex-1"
            style={{ color: activeTab === "listings" ? "#E2C97E" : "rgba(255,255,255,0.55)" }}
          >
            <FolderOpen size={18} />
            <span className="text-[9px] font-medium">Listings</span>
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className="flex flex-col items-center justify-center gap-1 bg-transparent border-none text-white cursor-pointer flex-1"
            style={{ color: activeTab === "leads" ? "#E2C97E" : "rgba(255,255,255,0.55)" }}
          >
            <MessageSquare size={18} />
            <span className="text-[9px] font-medium">Leads</span>
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className="flex flex-col items-center justify-center gap-1 bg-transparent border-none text-white cursor-pointer flex-1"
            style={{ color: activeTab === "bookings" ? "#E2C97E" : "rgba(255,255,255,0.55)" }}
          >
            <Calendar size={18} />
            <span className="text-[9px] font-medium">Bookings</span>
          </button>
          {!agent.postingRestricted && (
            <button
              onClick={() => {
                setActiveTab("upload");
                setUploadStep(1);
              }}
              className="flex flex-col items-center justify-center gap-1 bg-transparent border-none text-white cursor-pointer flex-1"
              style={{ color: activeTab === "upload" ? "#E2C97E" : "rgba(255,255,255,0.55)" }}
            >
              <Plus size={18} />
              <span className="text-[9px] font-medium">Upload</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("settings")}
            className="flex flex-col items-center justify-center gap-1 bg-transparent border-none text-white cursor-pointer flex-1"
            style={{ color: activeTab === "settings" ? "#E2C97E" : "rgba(255,255,255,0.55)" }}
          >
            <Settings size={18} />
            <span className="text-[9px] font-medium">Settings</span>
          </button>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-10 max-w-5xl">
        {/* Status Banners */}
        {status === "pending" && (
          <div className="p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-4 mb-8 bg-white" style={{ borderColor: "#E5E0D8" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-50 text-amber-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#1C3A2F] mb-0.5">Verification Pending</h2>
              <p className="text-[13px] font-light leading-relaxed text-[#666]">
                Welcome, <strong>{agent.name}</strong>! Your application is currently in queue for admin verification. 
                You will receive full posting permissions as soon as an administrator approves your account.
              </p>
            </div>
          </div>
        )}

        {status === "rejected" && (
          <div className="p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-4 mb-8 bg-white" style={{ borderColor: "#E5E0D8" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-red-50 text-red-600">
              <XCircle size={24} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-red-700 mb-0.5">Application Rejected</h2>
              <p className="text-[13px] font-light leading-relaxed text-[#666]">
                We regret to inform you that your registration request as an agent partner was not approved. 
                Please contact support at <strong>admin@nhp-bangkok.com</strong> for assistance.
              </p>
            </div>
          </div>
        )}

        {/* Tab contents */}
        {status === "approved" && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <div>
                <h1 className="text-[20px] lg:text-[24px] font-bold text-[#1A1A1A] tracking-[-0.5px]">
                  {activeTab === "listings" 
                    ? "My Property Listings" 
                    : activeTab === "leads" 
                    ? "Leads & Enquiries" 
                    : activeTab === "bookings" 
                    ? "Bookings & Tours" 
                    : activeTab === "upload" 
                    ? "Upload New Property" 
                    : "Profile & Settings"}
                </h1>
                <p className="text-[12px] lg:text-[13px] text-[#999] font-light mt-0.5">
                  {activeTab === "listings" 
                    ? `Manage your portfolio of ${properties.length} listings in Bangkok.` 
                    : activeTab === "leads" 
                    ? "Direct client enquiries submitted for your listings." 
                    : activeTab === "bookings" 
                    ? "Scheduled virtual or physical home viewing tours." 
                    : activeTab === "upload" 
                    ? `Step ${uploadStep} of 3: ${uploadStep === 1 ? "Basic Details" : uploadStep === 2 ? "Media & Amenities" : "Review & Publish"}` 
                    : "Update your workspace profile and password credentials."}
                </p>
              </div>
              {activeTab === "listings" && !agent.postingRestricted && (
                <button
                  onClick={() => {
                    setActiveTab("upload");
                    setUploadStep(1);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border-none cursor-pointer text-white transition-opacity hover:opacity-95 bg-[#1C3A2F]"
                >
                  <Plus size={14} /> Add Property
                </button>
              )}
            </div>

            {/* Quick Analytics Stats cards (shown on My Listings tab) */}
            {activeTab === "listings" && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
                <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#E5E0D8" }}>
                  <div className="text-[9px] lg:text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-400">Total Listings</div>
                  <div className="text-[20px] lg:text-[24px] font-bold text-[#1C3A2F] mt-0.5">{totalListingsCount}</div>
                </div>
                <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#E5E0D8" }}>
                  <div className="text-[9px] lg:text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-400">Active Listed</div>
                  <div className="text-[20px] lg:text-[24px] font-bold text-[#2E7D4F] mt-0.5">{activeListingsCount}</div>
                </div>
                <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#E5E0D8" }}>
                  <div className="text-[9px] lg:text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-400">Draft / Unlisted</div>
                  <div className="text-[20px] lg:text-[24px] font-bold text-[#8B6914] mt-0.5">{unlistedListingsCount}</div>
                </div>
                <div className="p-4 rounded-xl border bg-white" style={{ borderColor: "#E5E0D8" }}>
                  <div className="text-[9px] lg:text-[10px] font-semibold uppercase tracking-[0.8px] text-gray-400">Engagement</div>
                  <div className="text-[18px] lg:text-[22px] font-bold text-[#C9A84C] mt-0.5 truncate">{totalViewsCount} v / {totalClicksCount} c</div>
                </div>
              </div>
            )}

            {/* TAB: LISTINGS */}
            {activeTab === "listings" && (
              <>
                {/* Desktop view table */}
                <div className="hidden md:block overflow-x-auto rounded-2xl bg-white" style={{ border: borderStyle }}>
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
                        const isExpired = prop.status === "unlisted" && prop.expiryDate && new Date() > new Date(prop.expiryDate);
                        return (
                          <React.Fragment key={prop.id}>
                            <tr style={{ borderBottom: isExpired ? "none" : "1px solid #F0EAE0" }}>
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
                                <div className="text-[10px] text-gray-400 mt-0.5 capitalize">{prop.furnishing || "Furnished"}</div>
                              </td>
                              <td className="px-4 py-4 text-[13px] font-bold text-[#1C3A2F]">
                                ฿{prop.priceTHB.toLocaleString()}{prop.priceLabel || (prop.listingType === "sale" ? "" : "/month")}
                              </td>
                              <td className="px-4 py-4 text-center">
                                {prop.pendingVerification ? (
                                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-blue-200">
                                    <AlertCircle size={10} /> Pending Verify
                                  </span>
                                ) : isExpired ? (
                                  <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-red-200 animate-pulse">
                                    <AlertCircle size={10} /> Expired
                                  </span>
                                ) : isUnlisted ? (
                                  <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-amber-200">
                                    <EyeOff size={10} /> Draft (Unlisted)
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
                                    disabled={actionLoading === prop.id || !!prop.pendingVerification || isExpired}
                                    className="px-2.5 py-1.5 rounded text-[11px] font-bold border cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                      background: isUnlisted ? "#1C3A2F" : "#FFFFFF",
                                      color: isUnlisted ? "#FFFFFF" : "#1C3A2F",
                                      borderColor: "#1C3A2F"
                                    }}
                                    title={prop.pendingVerification ? "Pending Admin Approval" : isExpired ? "Expired Listing" : isUnlisted ? "Publish Listing" : "Unlist Listing"}
                                  >
                                    {prop.pendingVerification ? "Pending" : isUnlisted ? "Publish" : "Unlist"}
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
                            {isExpired && (
                              <tr style={{ borderBottom: "1px solid #F0EAE0", background: "#FFFBEB" }}>
                                <td colSpan={6} className="px-4 py-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[12px] text-amber-800 font-semibold">
                                      <AlertCircle size={14} className="text-amber-600" />
                                      <span>Is this property still available?</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleRenewProperty(prop.id)}
                                        disabled={actionLoading === prop.id}
                                        className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#1C3A2F] text-white border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                                      >
                                        Yes, Republish
                                      </button>
                                      <button
                                        onClick={() => handleDismissExpiryPrompt(prop.id)}
                                        disabled={actionLoading === prop.id}
                                        className="px-3.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white text-gray-600 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50"
                                      >
                                        No
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {properties.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-gray-400 text-[13px]">
                            No listings posted yet. Click &quot;+ Add Property&quot; to upload your first listing!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view listing cards */}
                <div className="md:hidden flex flex-col gap-3">
                  {properties.map((prop) => {
                    const isUnlisted = prop.status === "unlisted";
                    const isExpired = prop.status === "unlisted" && prop.expiryDate && new Date() > new Date(prop.expiryDate);
                    return (
                      <div key={prop.id} className="p-4 rounded-2xl border bg-white flex flex-col gap-4 shadow-sm relative overflow-hidden" style={{ borderColor: isExpired ? "#C9A84C" : "#E5E0D8" }}>
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-xl bg-cover bg-center bg-[#EDE8DF] flex-shrink-0" style={{ backgroundImage: `url(${prop.coverImage || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&auto=format&q=80"})` }} />
                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-bold text-[#1A1A1A] truncate">{prop.name}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{prop.area} · {prop.propertyType}</div>
                            <div className="text-[13px] font-bold text-[#1C3A2F] mt-1">
                              ฿{prop.priceTHB.toLocaleString()}{prop.priceLabel || (prop.listingType === "sale" ? "" : "/month")}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-b py-2.5" style={{ borderColor: "#F0EAE0" }}>
                          <div className="text-[11px] text-gray-600">
                            <div>{prop.bedrooms} Bed · {prop.bathrooms} Bath · {prop.sqm ? `${prop.sqm}m²` : "—"}</div>
                            <div className="text-[10px] text-gray-400 capitalize mt-0.5">{prop.furnishing || "Furnished"}</div>
                          </div>
                          
                          <div>
                            {prop.pendingVerification ? (
                              <span className="text-[9px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-blue-200">
                                <AlertCircle size={8} /> Pending
                              </span>
                            ) : isExpired ? (
                              <span className="text-[9px] font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-red-200">
                                <AlertCircle size={8} /> Expired
                              </span>
                            ) : isUnlisted ? (
                              <span className="text-[9px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-200">
                                <EyeOff size={8} /> Draft
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-200">
                                <CheckCircle2 size={8} /> Listed
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <div className="flex gap-3">
                            <span className="flex items-center gap-1"><Eye size={12} /> {prop.viewCount || 0} views</span>
                            <span className="flex items-center gap-1"><MousePointerClick size={12} /> {prop.clicks || 0} clicks</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(prop.id, prop.status || "active")}
                              disabled={actionLoading === prop.id || !!prop.pendingVerification || isExpired}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: isUnlisted ? "#1C3A2F" : "#FFFFFF",
                                color: isUnlisted ? "#FFFFFF" : "#1C3A2F",
                                borderColor: "#1C3A2F"
                              }}
                            >
                              {prop.pendingVerification ? "Pending" : isUnlisted ? "Publish" : "Unlist"}
                            </button>
                            <button
                              onClick={() => handleDelete(prop.id)}
                              disabled={actionLoading === prop.id}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 bg-transparent border border-red-100 cursor-pointer rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {isExpired && (
                          <div className="p-3 -mx-4 -mb-4 bg-[#FFFBEB] border-t border-amber-200 flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 text-[12px] text-amber-800 font-semibold">
                              <AlertCircle size={14} className="text-amber-600" />
                              <span>Is this property still available?</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => handleRenewProperty(prop.id)}
                                disabled={actionLoading === prop.id}
                                className="flex-1 py-1.5 rounded-lg text-[11px] font-bold bg-[#1C3A2F] text-white border-none cursor-pointer disabled:opacity-50"
                              >
                                Yes, Republish
                              </button>
                              <button
                                onClick={() => handleDismissExpiryPrompt(prop.id)}
                                disabled={actionLoading === prop.id}
                                className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold bg-white text-gray-600 border border-gray-200 cursor-pointer disabled:opacity-50"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {properties.length === 0 && (
                    <div className="text-center py-16 text-gray-400 text-[12px] bg-white rounded-2xl border" style={{ borderColor: "#E5E0D8" }}>
                      No listings posted yet. Tap &quot;Add Property&quot; to start.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB: LEADS */}
            {activeTab === "leads" && (
              <>
                {leadsLoading ? (
                  <div className="text-center py-12 text-[#999] text-[13px]">Loading leads...</div>
                ) : (
                  <>
                    {/* Desktop view table */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl bg-white" style={{ border: borderStyle }}>
                      <table className="w-full">
                        <thead>
                          <tr style={{ background: "#FAF8F3", borderBottom: borderStyle }}>
                            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Property</th>
                            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Visitor</th>
                            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Contact / Method</th>
                            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Message</th>
                            <th className="text-center text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Status</th>
                            <th className="text-right text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enquiries.map((enq) => {
                            return (
                              <tr key={enq.id} style={{ borderBottom: "1px solid #F0EAE0" }}>
                                <td className="px-4 py-4 min-w-[150px]">
                                  <span className="text-[13px] font-bold text-[#1A1A1A] block truncate max-w-[180px]" title={getPropertyName(enq)}>
                                    {getPropertyName(enq)}
                                  </span>
                                  <span className="text-[10px] text-gray-400 block mt-0.5">
                                    {new Date(enq.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-[13px] font-semibold text-gray-700">
                                  {enq.name}
                                </td>
                                <td className="px-4 py-4 text-[12px] text-gray-600">
                                  <div className="font-medium">{enq.contact}</div>
                                  <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-[0.5px]">via {enq.method}</div>
                                </td>
                                <td className="px-4 py-4 text-[12px] text-gray-500 max-w-[200px] truncate" title={enq.message}>
                                  {enq.message || <span className="text-gray-300 italic">No message</span>}
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 border ${
                                    enq.status === "new" 
                                      ? "bg-blue-50 text-blue-700 border-blue-200" 
                                      : enq.status === "responded" || enq.status === "contacted"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-gray-50 text-gray-700 border-gray-200"
                                  }`}>
                                    {enq.status}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <select
                                    value={enq.status}
                                    onChange={(e) => handleUpdateLeadStatus(enq.id, e.target.value)}
                                    className="px-2 py-1 rounded text-[11px] font-semibold bg-white border border-[#E5E0D8] text-gray-700 outline-none cursor-pointer"
                                  >
                                    <option value="new">New</option>
                                    <option value="responded">Responded</option>
                                    <option value="archived">Archived</option>
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                          {enquiries.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-16 text-gray-400 text-[13px]">
                                No enquiries received yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile view cards */}
                    <div className="md:hidden flex flex-col gap-3">
                      {enquiries.map((enq) => (
                        <div key={enq.id} className="p-4 rounded-2xl border bg-white flex flex-col gap-3 shadow-sm" style={{ borderColor: "#E5E0D8" }}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-[11px] text-gray-400">Property</div>
                              <div className="text-[13px] font-bold text-[#1C3A2F] truncate max-w-[200px]" title={getPropertyName(enq)}>
                                {getPropertyName(enq)}
                              </div>
                            </div>
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                              enq.status === "new" 
                                ? "bg-blue-50 text-blue-700 border-blue-200" 
                                : enq.status === "responded" || enq.status === "contacted"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}>
                              {enq.status}
                            </span>
                          </div>

                          <div className="border-t border-b py-2 flex flex-col gap-1.5" style={{ borderColor: "#F0EAE0" }}>
                            <div className="text-[12px] text-gray-600">
                              <span className="font-bold text-gray-800">From:</span> {enq.name}
                            </div>
                            <div className="text-[12px] text-gray-600">
                              <span className="font-bold text-gray-800">Contact:</span> {enq.contact} ({enq.method})
                            </div>
                            {enq.message && (
                              <div className="text-[12px] text-gray-500 bg-[#FAF8F3] p-2 rounded-lg mt-1 border border-[#EDE8DF] italic">
                                &quot;{enq.message}&quot;
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-gray-400 font-light">
                            <span>{new Date(enq.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-gray-500">Update:</span>
                              <select
                                value={enq.status}
                                onChange={(e) => handleUpdateLeadStatus(enq.id, e.target.value)}
                                className="px-2 py-1 rounded text-[10px] font-semibold bg-white border border-[#E5E0D8] text-gray-700 outline-none cursor-pointer"
                              >
                                <option value="new">New</option>
                                <option value="responded">Responded</option>
                                <option value="archived">Archived</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                      {enquiries.length === 0 && (
                        <div className="text-center py-16 text-gray-400 text-[12px] bg-white rounded-2xl border" style={{ borderColor: "#E5E0D8" }}>
                          No enquiries received yet.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB: BOOKINGS */}
            {activeTab === "bookings" && (
              <>
                {bookingsLoading ? (
                  <div className="text-center py-12 text-[#999] text-[13px]">Loading bookings...</div>
                ) : (
                  <>
                    {/* Desktop view table */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl bg-white" style={{ border: borderStyle }}>
                      <table className="w-full">
                        <thead>
                          <tr style={{ background: "#FAF8F3", borderBottom: borderStyle }}>
                            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Property</th>
                            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Visitor</th>
                            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Tour Date / Time</th>
                            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Message</th>
                            <th className="text-center text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Status</th>
                            <th className="text-right text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5 text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((appt) => {
                            return (
                              <tr key={appt.id} style={{ borderBottom: "1px solid #F0EAE0" }}>
                                <td className="px-4 py-4 min-w-[150px]">
                                  <span className="text-[13px] font-bold text-[#1A1A1A] block truncate max-w-[180px]" title={getPropertyName(appt)}>
                                    {getPropertyName(appt)}
                                  </span>
                                  <span className="text-[10px] text-gray-400 block mt-0.5">
                                    Request: {new Date(appt.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-[13px] font-semibold text-gray-700">
                                  <div>{appt.name}</div>
                                  <div className="text-[10px] text-gray-400 font-normal mt-0.5">{appt.email} · {appt.phone}</div>
                                </td>
                                <td className="px-4 py-4 text-[12px] text-gray-600">
                                  <div className="font-bold text-[#1C3A2F]">{appt.date}</div>
                                  <div className="text-[10px] text-gray-400 mt-0.5">{appt.timeSlot}</div>
                                </td>
                                <td className="px-4 py-4 text-[12px] text-gray-500 max-w-[200px] truncate" title={appt.message}>
                                  {appt.message || <span className="text-gray-300 italic">No notes</span>}
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 border ${
                                    appt.status === "confirmed" 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                      : appt.status === "cancelled"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}>
                                    {appt.status}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {appt.status !== "confirmed" && (
                                      <button
                                        onClick={() => handleUpdateBookingStatus(appt.id, "confirmed")}
                                        className="px-2.5 py-1.5 rounded text-[10px] font-bold bg-[#1C3A2F] text-white border-none cursor-pointer hover:opacity-90"
                                      >
                                        Confirm
                                      </button>
                                    )}
                                    {appt.status !== "cancelled" && (
                                      <button
                                        onClick={() => handleUpdateBookingStatus(appt.id, "cancelled")}
                                        className="px-2.5 py-1.5 rounded text-[10px] font-bold bg-white text-red-600 border border-red-200 cursor-pointer hover:bg-red-50"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {appointments.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-16 text-gray-400 text-[13px]">
                                No viewings scheduled yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile view cards */}
                    <div className="md:hidden flex flex-col gap-3">
                      {appointments.map((appt) => (
                        <div key={appt.id} className="p-4 rounded-2xl border bg-white flex flex-col gap-3 shadow-sm" style={{ borderColor: "#E5E0D8" }}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-[11px] text-gray-400">Property</div>
                              <div className="text-[13px] font-bold text-[#1C3A2F] truncate max-w-[200px]" title={getPropertyName(appt)}>
                                {getPropertyName(appt)}
                              </div>
                            </div>
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                              appt.status === "confirmed" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : appt.status === "cancelled"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {appt.status}
                            </span>
                          </div>

                          <div className="border-t border-b py-2 flex flex-col gap-1.5" style={{ borderColor: "#F0EAE0" }}>
                            <div className="text-[12px] text-gray-600">
                              <span className="font-bold text-gray-800">Visitor:</span> {appt.name}
                            </div>
                            <div className="text-[12px] text-gray-600">
                              <span className="font-bold text-gray-800">Contact:</span> {appt.email} · {appt.phone}
                            </div>
                            <div className="text-[12px] text-[#1C3A2F] font-bold">
                              🚆 Tour: {appt.date} @ {appt.timeSlot}
                            </div>
                            {appt.message && (
                              <div className="text-[12px] text-gray-500 bg-[#FAF8F3] p-2 rounded-lg mt-1 border border-[#EDE8DF] italic">
                                &quot;{appt.message}&quot;
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-gray-400 font-light">
                              Req: {new Date(appt.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {appt.status !== "confirmed" && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(appt.id, "confirmed")}
                                  className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-[#1C3A2F] text-white border-none cursor-pointer"
                                >
                                  Confirm
                                </button>
                              )}
                              {appt.status !== "cancelled" && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(appt.id, "cancelled")}
                                  className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-white text-red-600 border border-red-200 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {appointments.length === 0 && (
                        <div className="text-center py-16 text-gray-400 text-[12px] bg-white rounded-2xl border" style={{ borderColor: "#E5E0D8" }}>
                          No viewings scheduled yet.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB: UPLOAD WIZARD FORM */}
            {activeTab === "upload" && (
              <div className="p-4 lg:p-6 rounded-2xl border bg-white" style={{ borderColor: "#E5E0D8" }}>
                {/* Steps Header indicator */}
                <div className="flex items-center justify-between mb-6 border-b pb-4" style={{ borderColor: "#FAF8F3" }}>
                  <div className="flex items-center gap-2 lg:gap-3 w-full max-w-md mx-auto">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex-1 flex items-center gap-1.5">
                        <div
                          className="w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center text-[10px] lg:text-[11px] font-bold transition-all"
                          style={{
                            background: uploadStep === s ? "#1C3A2F" : uploadStep > s ? "#C9A84C" : "#F0EAE0",
                            color: uploadStep >= s ? "#FFFFFF" : "#999",
                          }}
                        >
                          {uploadStep > s ? "✓" : s}
                        </div>
                        <span className="text-[10px] lg:text-[11px] font-semibold hidden sm:inline" style={{ color: uploadStep === s ? "#1C3A2F" : "#999" }}>
                          {s === 1 ? "Basic Details" : s === 2 ? "Specs & Media" : "Confirm"}
                        </span>
                        {s < 3 && <div className="h-[2px] flex-1 bg-gray-200 hidden sm:block"></div>}
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl text-[12px] lg:text-[13px] mb-5 border font-medium bg-red-50 border-red-200 text-red-700">
                    ⚠️ {error}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3.5 rounded-xl text-[12px] lg:text-[13px] mb-5 border font-medium bg-emerald-50 border-emerald-200 text-emerald-700">
                    ✅ {successMsg}
                  </div>
                )}

                {/* STEP 1: BASIC DETAILS */}
                {uploadStep === 1 && (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Property Name / Title *</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Noble Solo Thonglor Luxury Penthouse"
                          className="w-full px-4.5 py-3.5 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Price (THB) *</label>
                        <input
                          type="number"
                          value={priceTHB}
                          onChange={(e) => setPriceTHB(e.target.value)}
                          placeholder="e.g. 45000"
                          className="w-full px-4.5 py-3.5 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Listing Type *</label>
                        <select
                          value={listingType}
                          onChange={(e) => handleListingTypeChange(e.target.value as any)}
                          className="w-full px-4.5 py-3.5 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                          style={inputStyle}
                        >
                          <option value="rent">Rent / Long Lease</option>
                          <option value="short_stay">Short Rent / Vacation</option>
                          <option value="sale">For Sale</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Property Type *</label>
                        <select
                          value={propertyType}
                          onChange={(e) => setPropertyType(e.target.value as any)}
                          className="w-full px-4.5 py-3.5 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
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
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Furnishing Status *</label>
                        <select
                          value={furnishing}
                          onChange={(e) => setFurnishing(e.target.value as any)}
                          className="w-full px-4.5 py-3.5 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                          style={inputStyle}
                        >
                          <option value="furnished">Fully Furnished</option>
                          <option value="partially_furnished">Partially Furnished</option>
                          <option value="unfurnished">Unfurnished</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Neighborhood Area *</label>
                        <select
                          value={["Sukhumvit", "Sathorn", "Thong Lo", "Asok", "Silom", "On Nut", "Ekkamai", "Ari", "Rama 9", "Bang Na", "Huai Khwang", "Phaya Thai"].includes(area) ? area : "Other"}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "Other") {
                              setArea("Other");
                            } else {
                              setArea(val);
                            }
                          }}
                          className="w-full px-4.5 py-3.5 rounded-xl text-[14px] focus:outline-none focus:border-[#C9A84C]"
                          style={inputStyle}
                        >
                          {["Sukhumvit", "Sathorn", "Thong Lo", "Asok", "Silom", "On Nut", "Ekkamai", "Ari", "Rama 9", "Bang Na", "Huai Khwang", "Phaya Thai"].map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                          <option value="Other">Other Bangkok Area (Specify...)</option>
                        </select>
                        {area === "Other" && (
                          <input
                            type="text"
                            value={customArea}
                            onChange={(e) => setCustomArea(e.target.value)}
                            placeholder="Specify Bangkok area (e.g. Samsen, Ladprao)"
                            className="w-full px-4.5 py-3.5 rounded-xl text-[14px] mt-2 focus:outline-none focus:border-[#C9A84C]"
                            style={inputStyle}
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">District (Optional)</label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="e.g. Khlong Toei"
                          className="w-full px-4.5 py-3.5 rounded-xl text-[14px]"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Bedrooms</label>
                        <select
                          value={bedrooms}
                          onChange={(e) => setBedrooms(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl text-[13px]"
                          style={inputStyle}
                        >
                          {["0 (Studio)", "1", "2", "3", "4", "5+"].map((v, idx) => (
                            <option key={idx} value={idx}>{v}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Bathrooms</label>
                        <select
                          value={bathrooms}
                          onChange={(e) => setBathrooms(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl text-[13px]"
                          style={inputStyle}
                        >
                          {["1", "2", "3", "4+"].map((v, idx) => (
                            <option key={idx} value={idx + 1}>{v}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Sqm Size</label>
                        <input
                          type="number"
                          value={sqm}
                          onChange={(e) => setSqm(e.target.value)}
                          placeholder="e.g. 52"
                          className="w-full px-4 py-3 rounded-xl text-[13px]"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t" style={{ borderColor: "#FAF8F3" }}>
                      <button
                        type="button"
                        onClick={handleStep1Next}
                        className="flex items-center gap-1.5 px-6 py-3 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white bg-[#1C3A2F] transition-opacity hover:opacity-95"
                      >
                        Next: Media & Specs <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: MEDIA & SPECIFICATIONS */}
                {uploadStep === 2 && (
                  <div className="flex flex-col gap-6">
                    {/* Short Term Lease Selector (Conditional) */}
                    {listingType === "short_stay" && (
                      <div className="p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Short Term Lease Duration *</label>
                          <select
                            value={leaseTerms}
                            onChange={(e) => setLeaseTerms(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-[14px]"
                            style={inputStyle}
                          >
                            <option value="1 month rent">1 Month Rent</option>
                            <option value="2 months rent">2 Months Rent</option>
                            <option value="3 months to 6 months rent">3 Months to 6 Months</option>
                          </select>
                        </div>
                        <div className="text-[11px] text-gray-400 font-light max-w-sm">
                          Select the minimum required stay duration for short term lease.
                        </div>
                      </div>
                    )}

                    {/* Floors & Available From */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Property Floor Number</label>
                        <input
                          type="number"
                          value={floor}
                          onChange={(e) => setFloor(e.target.value)}
                          placeholder="e.g. 14"
                          className="w-full px-4.5 py-3 rounded-xl text-[14px]"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Total Building Floors</label>
                        <input
                          type="number"
                          value={totalFloors}
                          onChange={(e) => setTotalFloors(e.target.value)}
                          placeholder="e.g. 32"
                          className="w-full px-4.5 py-3 rounded-xl text-[14px]"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Date Available From</label>
                        <input
                          type="date"
                          value={availableFrom}
                          onChange={(e) => setAvailableFrom(e.target.value)}
                          className="w-full px-4.5 py-3 rounded-xl text-[14px]"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Description Textarea */}
                    <div>
                      <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Description Details</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a details summary about view, furniture, orientation..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-[14px]"
                        style={{ ...inputStyle, resize: "none" }}
                      />
                    </div>

                    {/* Amenities Checklist */}
                    <div className="p-4 rounded-xl border bg-[#FAF8F3]" style={{ borderColor: "#EDE8DF" }}>
                      <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1.5px] text-[#C9A84C] mb-3">Select Amenities Available</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ALL_AMENITIES.map((amenity) => (
                          <label key={amenity} className="flex items-center gap-2 text-[12px] text-gray-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={selectedAmenities.includes(amenity)}
                              onChange={() => handleAmenityToggle(amenity)}
                              className="w-4 h-4 accent-[#1C3A2F] cursor-pointer"
                            />
                            <span>{amenity}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Image uploads dropzone grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Cover Photo */}
                      <div className="p-4 rounded-xl border bg-[#FAF8F3]" style={{ borderColor: "#EDE8DF" }}>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-[#1C3A2F] mb-2">Cover Image *</label>
                        <div className="border border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden h-[120px] bg-white hover:border-[#C9A84C]" style={{ borderColor: "#E5E0D8" }}>
                          {coverImage ? (
                            <>
                              <img src={coverImage} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <button type="button" onClick={() => setCoverImage("")} className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold rounded cursor-pointer border-none">Remove</button>
                              </div>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="text-[#C9A84C] mb-1.5" size={28} />
                              <div className="text-[11px] font-bold text-gray-700">Upload Cover Image</div>
                              <input type="file" accept="image/*" onChange={handleCoverUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </>
                          )}
                          {uploadingCover && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[11px] font-semibold text-[#1C3A2F]">Uploading Cover...</div>}
                        </div>
                      </div>

                      {/* Extra images */}
                      <div className="p-4 rounded-xl border bg-[#FAF8F3]" style={{ borderColor: "#EDE8DF" }}>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-[#1C3A2F] mb-2">Gallery Images (Max 5)</label>
                        <div className="border border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden h-[70px] bg-white hover:border-[#C9A84C]" style={{ borderColor: "#E5E0D8" }}>
                          <UploadCloud className="text-[#C9A84C] mb-1" size={20} />
                          <div className="text-[10px] font-bold text-gray-600">Select Gallery Images</div>
                          <input type="file" multiple accept="image/*" onChange={handleExtraImagesUpload} disabled={extraImages.length >= 5} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                          {uploadingExtra && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[11px] font-semibold text-[#1C3A2F]">Uploading Gallery...</div>}
                        </div>
                        {extraImages.length > 0 && (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {extraImages.map((img, i) => (
                              <div key={i} className="w-10 h-10 rounded border overflow-hidden relative">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setExtraImages(extraImages.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-600 text-white rounded-bl border-none cursor-pointer p-0.5 text-[8px]">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BTS station & tags */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] lg:text-[11px] font-bold uppercase tracking-[1px] text-gray-500 mb-1.5">Nearest BTS/MRT Station</label>
                        <input
                          type="text"
                          value={btsStation}
                          onChange={(e) => setBtsStation(e.target.value)}
                          placeholder="e.g. Thong Lo BTS"
                          className="w-full px-4.5 py-3 rounded-xl text-[14px]"
                          style={inputStyle}
                        />
                      </div>

                      <div className="flex items-center gap-6 sm:pt-6">
                        <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={petFriendly}
                            onChange={(e) => setPetFriendly(e.target.checked)}
                            className="w-4 h-4 accent-[#1C3A2F]"
                          />
                          Pet Friendly
                        </label>

                        <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={nearBts}
                            onChange={(e) => setNearBts(e.target.checked)}
                            className="w-4 h-4 accent-[#1C3A2F]"
                          />
                          Near Transit
                        </label>
                      </div>
                    </div>

                    {/* Back / Next buttons */}
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "#FAF8F3" }}>
                      <button
                        type="button"
                        onClick={() => setUploadStep(1)}
                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold border bg-transparent cursor-pointer hover:bg-gray-50"
                        style={{ borderColor: "#E5E0D8", color: "#1A1A1A" }}
                      >
                        <ChevronLeft size={14} /> Back
                      </button>

                      <button
                        type="button"
                        onClick={handleStep2Next}
                        className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white bg-[#1C3A2F] transition-opacity hover:opacity-95"
                      >
                        Next: Review <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: REVIEW & PUBLISH */}
                {uploadStep === 3 && (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.8fr] gap-6">
                      {/* Left preview card */}
                      <div className="rounded-2xl border p-4 bg-[#FAF8F3] shadow-inner" style={{ borderColor: "#EDE8DF" }}>
                        <h4 className="text-[11px] font-bold uppercase tracking-[1px] text-gray-400 mb-3">Live Listing Preview</h4>
                        
                        <div className="rounded-xl overflow-hidden bg-white border shadow-sm">
                          <div className="aspect-video w-full bg-gray-100 bg-cover bg-center relative" style={{ backgroundImage: `url(${coverImage})` }}>
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[8px] font-bold bg-[#1C3A2F] text-[#E2C97E]">
                              {listingType === "sale" ? "For Sale" : listingType === "short_stay" ? "Short Rent" : "Long Rent"}
                            </span>
                          </div>

                          <div className="p-3.5">
                            <h3 className="text-[14px] font-bold text-[#1A1A1A] truncate">{name || "Property Title"}</h3>
                            <div className="text-[10px] text-gray-400 mt-0.5">{area} · {propertyType}</div>
                            
                            <div className="text-[14px] font-bold text-[#1C3A2F] mt-2">
                              ฿{Number(priceTHB || 0).toLocaleString()}{listingType === "sale" ? "" : "/month"}
                            </div>

                            <div className="flex gap-3 text-[11px] text-gray-500 mt-2 border-t pt-2 border-gray-100">
                              <span>{bedrooms} Bed</span>
                              <span>{bathrooms} Bath</span>
                              {sqm && <span>{sqm} m²</span>}
                            </div>

                            <div className="text-[10px] text-gray-400 mt-1 border-t pt-2 border-gray-100 capitalize">
                              Furnishing: {furnishing}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right details summary */}
                      <div className="flex flex-col gap-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-[1px] text-gray-400">Specifications Summary</h4>
                        
                        <div className="flex flex-col gap-2.5 text-[13px] text-[#1A1A1A]">
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-400">Neighborhood</span>
                            <span className="font-semibold">{area} {district ? `· ${district}` : ""}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-400">Price Details</span>
                            <span className="font-bold text-[#1C3A2F]">฿{Number(priceTHB || 0).toLocaleString()} THB</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-400">Property Floor</span>
                            <span className="font-medium">{floor ? `Floor ${floor}` : "Not Specified"}{totalFloors ? ` of ${totalFloors}` : ""}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-400">Availability</span>
                            <span className="font-medium">{availableFrom || "Available Now"}</span>
                          </div>
                          {listingType === "short_stay" && (
                            <div className="flex justify-between py-1 border-b border-gray-100">
                              <span className="text-gray-400">Min. Short Rent</span>
                              <span className="font-bold text-amber-700">{leaseTerms}</span>
                            </div>
                          )}
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-400">Nearest Station</span>
                            <span className="font-semibold">{btsStation || "None"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-400">Pet Policy</span>
                            <span className="font-semibold">{petFriendly ? "Pet Friendly Building" : "No Pets Allowed"}</span>
                          </div>
                        </div>

                        {selectedAmenities.length > 0 && (
                          <div className="mt-2">
                            <span className="text-[10px] font-bold uppercase tracking-[1px] text-gray-400 block mb-1">Selected Amenities</span>
                            <div className="flex flex-wrap gap-1">
                              {selectedAmenities.map((amenity) => (
                                <span key={amenity} className="text-[10px] bg-white border border-[#E5E0D8] px-2 py-0.5 rounded-full text-gray-700">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons (Publish / Save Draft / Back) */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t" style={{ borderColor: "#FAF8F3" }}>
                      <button
                        type="button"
                        onClick={() => setUploadStep(2)}
                        className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold border bg-transparent cursor-pointer hover:bg-gray-50"
                        style={{ borderColor: "#E5E0D8", color: "#1A1A1A" }}
                      >
                        <ChevronLeft size={14} /> Back to specs
                      </button>

                      <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleUploadSubmit("unlisted")}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl text-[13px] font-bold border cursor-pointer bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                          style={{ borderColor: "#E5E0D8" }}
                        >
                          Save as Draft
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleUploadSubmit("active")}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white disabled:opacity-60 transition-opacity hover:opacity-95 bg-[#1C3A2F]"
                        >
                          Publish Listing
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFILE & SETTINGS */}
            {activeTab === "settings" && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-6">
                {/* Left col: Account card */}
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

                {/* Right col: Settings Edit */}
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
                        className="px-6 py-3 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white disabled:opacity-60 transition-opacity hover:opacity-95 bg-[#1C3A2F]"
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
