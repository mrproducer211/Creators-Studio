"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PropertyCard } from "@/types/property";
import { useSaved } from "@/contexts/SavedContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import ExplorePropertyCard from "@/components/explore/ExplorePropertyCard";
import { NEIGHBORHOODS } from "@/data/neighborhoods";
import {
  Bookmark,
  Heart,
  MapPin,
  Car,
  Search,
  Trash2,
  Loader2,
  Compass,
  MessageSquare,
  Send,
  Users,
  Eye,
  Sliders,
  AlertCircle,
  Settings,
  TrainFront,
  Footprints
} from "lucide-react";

interface DashboardClientProps {
  allProperties: PropertyCard[];
  session: any;
}

// Preset hubs in Bangkok
const PRESET_HUBS = [
  { name: "Sathorn Square", address: "North Sathorn Rd, Silom, Bang Rak", lat: 13.7226, lng: 100.5293 },
  { name: "EM Quartier", address: "Sukhumvit Rd, Phrom Phong, Khlong Toei", lat: 13.7314, lng: 100.5694 },
  { name: "NIST International School", address: "Sukhumvit Soi 15, Khlong Toei Nuea", lat: 13.7431, lng: 100.5592 },
  { name: "One Bangkok", address: "Wireless Rd, Lumpini, Pathum Wan", lat: 13.7275, lng: 100.5471 },
  { name: "True Digital Park", address: "Sukhumvit Rd, Punnawithi, Phra Khanong", lat: 13.6858, lng: 100.6111 },
];

const geocodeAddress = (addressOrName: string): { lat: number; lng: number } => {
  const query = addressOrName.toLowerCase();
  if (query.includes("sathorn")) return { lat: 13.7226, lng: 100.5293 };
  if (query.includes("sukhumvit") || query.includes("phrom phong") || query.includes("phromphong")) return { lat: 13.7314, lng: 100.5694 };
  if (query.includes("asok") || query.includes("asoke")) return { lat: 13.7431, lng: 100.5592 };
  if (query.includes("ari")) return { lat: 13.7797, lng: 100.5447 };
  if (query.includes("silom")) return { lat: 13.7258, lng: 100.5273 };
  if (query.includes("on nut") || query.includes("onnut")) return { lat: 13.7056, lng: 100.6012 };
  if (query.includes("rama 9") || query.includes("rama9")) return { lat: 13.7583, lng: 100.5658 };
  if (query.includes("bang na") || query.includes("bangna")) return { lat: 13.6678, lng: 100.6056 };
  if (query.includes("phaya thai") || query.includes("phayathai")) return { lat: 13.7570, lng: 100.5338 };
  if (query.includes("ekkamai") || query.includes("ekamai")) return { lat: 13.7283, lng: 100.5852 };
  if (query.includes("paragon") || query.includes("siam")) return { lat: 13.7468, lng: 100.5348 };
  if (query.includes("iconsiam")) return { lat: 13.7268, lng: 100.5112 };
  return { lat: 13.7367, lng: 100.5612 };
};

export default function DashboardClient({ allProperties, session }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { savedIds, count } = useSaved();
  const { lang, setLang } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const user = session?.user;

  // Active Tab
  const [activeTab, setActiveTab] = useState<"feed" | "searches" | "commute" | "collab" | "saved" | "settings">("feed");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["feed", "searches", "commute", "collab", "saved", "settings"].includes(tabParam)) {
      if (activeTab !== tabParam) {
        setActiveTab(tabParam as any);
      }
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    router.replace(`/dashboard?tab=${tab}`);
  };

  // 1. Saved Searches State
  const [savedSearchesList, setSavedSearchesList] = useState<any[]>([]);
  const [searchesLoading, setSearchesLoading] = useState(false);

  const fetchSavedSearches = useCallback(async () => {
    setSearchesLoading(true);
    try {
      const res = await fetch("/api/saved-searches");
      if (res.ok) {
        const data = await res.json();
        setSavedSearchesList(data.list || []);
      }
    } catch (err) {
      console.error("Failed to fetch saved searches:", err);
    } finally {
      setSearchesLoading(false);
    }
  }, []);

  const handleToggleAlert = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, alertEnabled: !currentStatus }),
      });
      if (res.ok) {
        setSavedSearchesList((prev) =>
          prev.map((s) => (s.id === id ? { ...s, alertEnabled: !currentStatus } : s))
        );
      }
    } catch (err) {
      console.error("Failed to toggle alert status:", err);
    }
  };

  const handleDeleteSearch = async (id: number) => {
    try {
      const res = await fetch(`/api/saved-searches?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSavedSearchesList((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete saved search:", err);
    }
  };

  // 2. Commute Planner State
  const [commuteHubsList, setCommuteHubsList] = useState<any[]>([]);
  const [commuteLoading, setCommuteLoading] = useState(false);
  const [newHubName, setNewHubName] = useState("");
  const [newHubPreset, setNewHubPreset] = useState("");
  const [newHubAddress, setNewHubAddress] = useState("");
  const [newHubLat, setNewHubLat] = useState("");
  const [newHubLng, setNewHubLng] = useState("");
  const [newHubMode, setNewHubMode] = useState<"transit" | "driving" | "walking">("transit");
  const [commuteError, setCommuteError] = useState("");

  const fetchCommuteHubs = useCallback(async () => {
    setCommuteLoading(true);
    try {
      const res = await fetch("/api/commute-hubs");
      if (res.ok) {
        const data = await res.json();
        setCommuteHubsList(data.list || []);
        // Save to localStorage for client-side property card computations instantly
        localStorage.setItem("nhp_commute_hubs", JSON.stringify(data.list || []));
      }
    } catch (err) {
      console.error("Failed to fetch commute hubs:", err);
    } finally {
      setCommuteLoading(false);
    }
  }, []);

  const handlePresetSelect = (presetName: string) => {
    setNewHubPreset(presetName);
    const preset = PRESET_HUBS.find((p) => p.name === presetName);
    if (preset) {
      setNewHubName(preset.name);
      setNewHubAddress(preset.address);
      setNewHubLat(String(preset.lat));
      setNewHubLng(String(preset.lng));
    } else {
      setNewHubName("");
      setNewHubAddress("");
      setNewHubLat("");
      setNewHubLng("");
    }
  };

  const handleAddHub = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommuteError("");
    if (!newHubName.trim()) {
      setCommuteError("Please provide a name for this hub.");
      return;
    }
    let latNum = Number(newHubLat);
    let lngNum = Number(newHubLng);

    if (newHubPreset === "custom" || !newHubPreset || isNaN(latNum) || latNum === 0) {
      const coords = geocodeAddress(newHubName + " " + newHubAddress);
      latNum = coords.lat;
      lngNum = coords.lng;
    }

    try {
      const res = await fetch("/api/commute-hubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newHubName.trim(),
          address: newHubAddress.trim(),
          latitude: latNum,
          longitude: lngNum,
          transitMode: newHubMode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCommuteHubsList((prev) => {
          const filtered = prev.filter((h) => h.name.toLowerCase() !== newHubName.trim().toLowerCase());
          const next = [...filtered, data.item];
          localStorage.setItem("nhp_commute_hubs", JSON.stringify(next));
          return next;
        });

        // Reset Form
        setNewHubName("");
        setNewHubPreset("");
        setNewHubAddress("");
        setNewHubLat("");
        setNewHubLng("");
        setNewHubMode("transit");
      } else {
        const errData = await res.json();
        setCommuteError(errData.error || "Failed to add commute hub.");
      }
    } catch {
      setCommuteError("Network error. Please try again.");
    }
  };

  const handleDeleteHub = async (id: number) => {
    try {
      const res = await fetch(`/api/commute-hubs?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCommuteHubsList((prev) => {
          const next = prev.filter((h) => h.id !== id);
          localStorage.setItem("nhp_commute_hubs", JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to delete commute hub:", err);
    }
  };

  // 3. Collaborative Shortlists State
  const [shortlists, setShortlists] = useState<any[]>([]);
  const [collabLoading, setCollabLoading] = useState(false);
  const [newCollabName, setNewCollabName] = useState("");
  const [newCollabEmail, setNewCollabEmail] = useState("");
  const [collabError, setCollabError] = useState("");

  const [activeShortlist, setActiveShortlist] = useState<any | null>(null);
  const [activeShortlistProps, setActiveShortlistProps] = useState<PropertyCard[]>([]);
  const [activePropComments, setActivePropComments] = useState<Record<number, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [sendingComment, setSendingComment] = useState<Record<number, boolean>>({});

  const fetchShortlists = useCallback(async () => {
    setCollabLoading(true);
    try {
      const res = await fetch("/api/collaborations");
      if (res.ok) {
        const data = await res.json();
        setShortlists(data.shortlists || []);
      }
    } catch (err) {
      console.error("Failed to fetch collaborations:", err);
    } finally {
      setCollabLoading(false);
    }
  }, []);

  const handleCreateShortlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollabError("");
    if (!newCollabName.trim() || !newCollabEmail.trim()) {
      setCollabError("All fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: newCollabName.trim(),
          collaboratorEmail: newCollabEmail.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShortlists((prev) => [...prev, data.item]);
        setNewCollabName("");
        setNewCollabEmail("");
      } else {
        const errData = await res.json();
        setCollabError(errData.error || "Failed to create shortlist.");
      }
    } catch {
      setCollabError("Network error. Please try again.");
    }
  };

  const handleOpenShortlist = async (shortlist: any) => {
    setActiveShortlist(shortlist);
    try {
      // 1. Fetch properties in this shortlist
      const resProps = await fetch(`/api/collaborations?shortlistId=${shortlist.id}`);
      if (resProps.ok) {
        const data = await resProps.json();
        const ids = new Set(data.propertyIds || []);
        
        // Let's filter the property list or seed some if empty
        let list = allProperties.filter((p) => ids.has(p.id));
        if (list.length === 0 && allProperties.length > 0) {
          // Auto add first 2 properties as demo shortlist entries
          const demo1 = allProperties[0];
          const demo2 = allProperties[1] || allProperties[0];
          
          await fetch("/api/collaborations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "addProperty", shortlistId: shortlist.id, propertyId: demo1.id }),
          });
          if (demo2.id !== demo1.id) {
            await fetch("/api/collaborations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "addProperty", shortlistId: shortlist.id, propertyId: demo2.id }),
            });
          }
          list = [demo1, demo2];
        }
        
        setActiveShortlistProps(list);

        // 2. Fetch comments for each property in this shortlist
        const commentsMap: Record<number, any[]> = {};
        for (const p of list) {
          const resComm = await fetch(`/api/collaborations?shortlistId=${shortlist.id}&propertyId=${p.id}`);
          if (resComm.ok) {
            const commData = await resComm.json();
            let comments = commData.comments || [];
            
            // Seed a mock comment from the collaborator if empty to show interactive collab feature
            if (comments.length === 0) {
              const mockComment = {
                id: Math.random(),
                shortlistId: shortlist.id,
                propertyId: p.id,
                userEmail: shortlist.collaboratorEmail,
                userName: shortlist.collaboratorEmail.split("@")[0],
                comment: "This looks like a great match for our commute! The pool is amazing too. What do you think?",
                createdAt: new Date(Date.now() - 3600000).toISOString(),
              };
              comments = [mockComment];
              // Persist locally/DB if desired
              await fetch("/api/collaborations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "addComment",
                  shortlistId: shortlist.id,
                  propertyId: p.id,
                  comment: mockComment.comment,
                }),
              });
            }
            commentsMap[p.id] = comments;
          }
        }
        setActivePropComments(commentsMap);
      }
    } catch (err) {
      console.error("Failed to load shortlist properties/comments:", err);
    }
  };

  const handlePostComment = async (propertyId: number) => {
    const text = commentInputs[propertyId] || "";
    if (!text.trim() || !activeShortlist) return;

    setSendingComment((prev) => ({ ...prev, [propertyId]: true }));
    try {
      const res = await fetch("/api/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addComment",
          shortlistId: activeShortlist.id,
          propertyId,
          comment: text.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActivePropComments((prev) => ({
          ...prev,
          [propertyId]: [...(prev[propertyId] || []), data.item],
        }));
        setCommentInputs((prev) => ({ ...prev, [propertyId]: "" }));
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSendingComment((prev) => ({ ...prev, [propertyId]: false }));
    }
  };

  const handleDeleteShortlist = async (id: number) => {
    try {
      const res = await fetch(`/api/collaborations?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setShortlists((prev) => prev.filter((s) => s.id !== id));
        if (activeShortlist?.id === id) {
          setActiveShortlist(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete shortlist:", err);
    }
  };

  // 4. Auto-Finder Matching Feed State
  const [matchedNeighborhoods, setMatchedNeighborhoods] = useState<any[]>([]);
  const [matchedProperties, setMatchedProperties] = useState<PropertyCard[]>([]);
  const [finderPreferences, setFinderPreferences] = useState<any | null>(null);

  // Form states for manual matchmaking on dashboard
  const [manualBudget, setManualBudget] = useState(45000);
  const [manualVibe, setManualVibe] = useState("Trendy & Lively");
  const [manualTransit, setManualTransit] = useState(true);
  const [manualPet, setManualPet] = useState(false);

  const calculateAutoFinderMatches = useCallback((prefs: any) => {
    const { budget, vibe, transit, pet } = prefs;

    // Calculate neighborhood scores
    const calculatedNeighborhoods = NEIGHBORHOODS.map((n) => {
      let score = 75; // base compatibility

      // Pet compatibility
      if (pet) {
        score += n.scores.petFriendly >= 8 ? 10 : n.scores.petFriendly >= 5 ? 5 : -15;
      }
      // Transit compatibility
      if (transit) {
        score += n.scores.walkability >= 8 ? 10 : -5;
      }
      // Vibe compatibility
      if (vibe === "Quiet & Peaceful") {
        score += n.scores.nightlife <= 4 ? 10 : n.scores.nightlife <= 7 ? 0 : -10;
      } else if (vibe === "Trendy & Lively") {
        score += n.scores.cafeCulture >= 8 ? 10 : 0;
      } else if (vibe === "Business/City Center") {
        score += n.scores.luxury >= 8 ? 10 : -5;
      } else if (vibe === "Local Cultural") {
        // High culture vibe
        score += 8;
      }

      return {
        ...n,
        matchScore: Math.min(100, Math.max(0, score)),
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    setMatchedNeighborhoods(calculatedNeighborhoods);

    // Calculate property matches
    const topNeighborhoods = calculatedNeighborhoods.slice(0, 3).map((n) => n.name.toLowerCase());
    const props = allProperties
      .map((p) => {
        let score = 70;
        // Area match
        if (topNeighborhoods.includes(p.area.toLowerCase())) {
          score += 15;
        }
        // Budget match
        if (Number(p.priceTHB) <= budget) {
          score += 10;
        } else if (Number(p.priceTHB) <= budget * 1.15) {
          score += 2;
        } else {
          score -= 20;
        }
        // Pet friendliness
        if (pet && p.petFriendly) {
          score += 5;
        }
        // Near BTS
        if (transit && p.nearBts) {
          score += 5;
        }

        return {
          property: p,
          score: Math.min(100, Math.max(0, score)),
        };
      })
      .filter((item) => item.score >= 65)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.property);

    setMatchedProperties(props);
  }, [allProperties]);

  useEffect(() => {
    // Load finder parameters from localStorage
    const stored = localStorage.getItem("nhp_auto_finder_parameters");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFinderPreferences(parsed);
        calculateAutoFinderMatches(parsed);
      } catch {}
    }
  }, [calculateAutoFinderMatches]);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const prefs = {
      budget: manualBudget,
      vibe: manualVibe,
      transit: manualTransit,
      pet: manualPet,
    };
    localStorage.setItem("nhp_auto_finder_parameters", JSON.stringify(prefs));
    setFinderPreferences(prefs);
    calculateAutoFinderMatches(prefs);
  };

  // Sync state on tab activation
  useEffect(() => {
    if (activeTab === "searches") {
      fetchSavedSearches();
    } else if (activeTab === "commute") {
      fetchCommuteHubs();
    } else if (activeTab === "collab") {
      fetchShortlists();
    }
  }, [activeTab, fetchSavedSearches, fetchCommuteHubs, fetchShortlists]);

  // Saved Listings Grid
  const savedListings = useMemo(() => {
    return allProperties.filter((p) => savedIds.has(p.id));
  }, [allProperties, savedIds]);

  return (
    <div className="max-w-[1360px] mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md" style={{ background: "#1C3A2F" }}>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: "#C9A84C" }}>NHP Private Client</span>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-1 text-white leading-tight">
            Sawadee, {user?.name || "Member"}
          </h1>
          <p className="text-sm font-light mt-1.5 text-white/60">
            Welcome to your customized Bangkok concierge panel.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="text-[18px] font-bold text-[#C9A84C]">{count}</div>
            <div className="text-[10px] uppercase text-white/50 tracking-wider mt-0.5">Saved Homes</div>
          </div>
          <div className="px-5 py-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="text-[18px] font-bold text-[#C9A84C]">{commuteHubsList.length || 0}</div>
            <div className="text-[10px] uppercase text-white/50 tracking-wider mt-0.5">Commute Hubs</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Mobile Tab Navigation Dropdown */}
        <div className="w-full lg:hidden mb-4">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-[1.5px] mb-1.5">
            Dashboard Menu
          </label>
          <select
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value as any)}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] outline-none text-[14px] font-semibold bg-white text-[#1C3A2F]"
            style={{ fontFamily: "inherit" }}
          >
            <option value="feed">Profile & Match Feed</option>
            <option value="saved">Saved Properties</option>
            <option value="searches">Saved Searches</option>
            <option value="commute">Commute Planner</option>
            <option value="collab">Collaborative Lists</option>
            <option value="settings">Settings</option>
          </select>
        </div>

        {/* Sidebar Nav (Desktop only) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-[260px] flex-shrink-0 gap-1 bg-white p-2 rounded-2xl border border-[#E5E0D8]">
          {[
            { id: "feed", label: "Profile & Match Feed", icon: <Compass size={16} /> },
            { id: "saved", label: "Saved Properties", icon: <Heart size={16} /> },
            { id: "searches", label: "Saved Searches", icon: <Bookmark size={16} /> },
            { id: "commute", label: "Commute Planner", icon: <Car size={16} /> },
            { id: "collab", label: "Collaborative Lists", icon: <Users size={16} /> },
            { id: "settings", label: "Settings", icon: <Settings size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-[13px] font-medium cursor-pointer border-none text-left transition-all w-full ${
                activeTab === tab.id
                  ? "bg-[#1C3A2F] text-white"
                  : "bg-transparent text-[#1C3A2F] hover:bg-gray-50"
              }`}
              style={{ fontFamily: "inherit" }}
            >
              <span className={activeTab === tab.id ? "text-[#C9A84C]" : "text-[#1C3A2F]"}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Panel */}
        <div className="flex-1 w-full min-h-[500px]">
          {/* 1. PROFILE & AUTO-FINDER FEED */}
          {activeTab === "feed" && (
            <div className="flex flex-col gap-6">
              {!finderPreferences ? (
                // Questionnaire card if parameters aren't configured
                <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
                  <div className="max-w-md mx-auto text-center py-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.15)" }}>
                      <Compass size={24} className="text-[#C9A84C]" />
                    </div>
                    <h2 className="text-[20px] font-bold text-[#1C3A2F] mb-1">Set Up Your Matchmaker Feed</h2>
                    <p className="text-[13px] text-gray-500 font-light mb-6">
                      Tell us your parameters to unlock a custom feed of highly relevant neighborhoods and property listings.
                    </p>

                    <form onSubmit={handleSavePreferences} className="text-left flex flex-col gap-4">
                      {/* Budget */}
                      <div>
                        <label className="text-[12px] font-bold text-gray-700 block mb-1">Max Monthly Budget (THB)</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={15000}
                            max={150000}
                            step={5000}
                            value={manualBudget}
                            onChange={(e) => setManualBudget(Number(e.target.value))}
                            className="flex-1 accent-[#1C3A2F]"
                          />
                          <span className="text-[14px] font-bold text-[#1C3A2F] w-[90px] text-right">{manualBudget.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Vibe */}
                      <div>
                        <label className="text-[12px] font-bold text-gray-700 block mb-1">Preferred Neighborhood Vibe</label>
                        <select
                          value={manualVibe}
                          onChange={(e) => setManualVibe(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[13px] bg-white"
                          style={{ fontFamily: "inherit" }}
                        >
                          <option>Trendy & Lively</option>
                          <option>Quiet & Peaceful</option>
                          <option>Business/City Center</option>
                          <option>Local Cultural</option>
                        </select>
                      </div>

                      {/* Transit */}
                      <div className="flex items-center justify-between p-1">
                        <div>
                          <span className="text-[13px] font-bold text-[#1C3A2F] block">Excellent Public Transport</span>
                          <span className="text-[10px] text-gray-400">Must be within easy walk of BTS/MRT station</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={manualTransit}
                          onChange={(e) => setManualTransit(e.target.checked)}
                          className="w-5 h-5 accent-[#1C3A2F] cursor-pointer"
                        />
                      </div>

                      {/* Pet Friendly */}
                      <div className="flex items-center justify-between p-1">
                        <div>
                          <span className="text-[13px] font-bold text-[#1C3A2F] block">Pet Friendly Buildings</span>
                          <span className="text-[10px] text-gray-400">Only match listings allowing dogs/cats</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={manualPet}
                          onChange={(e) => setManualPet(e.target.checked)}
                          className="w-5 h-5 accent-[#1C3A2F] cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white mt-2 cursor-pointer border-none transition-opacity hover:opacity-95"
                        style={{ background: "#1C3A2F" }}
                      >
                        Generate My Matches →
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                // Match Feed dashboard
                <div className="flex flex-col gap-6">
                  {/* Preferences Header */}
                  <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-[16px] font-bold text-[#1C3A2F] flex items-center gap-1.5">
                        <Sliders size={16} className="text-[#C9A84C]" />
                        Active Matchmaker Preferences
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[10px] font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-gray-600">
                          Budget: {finderPreferences.budget.toLocaleString()} THB
                        </span>
                        <span className="text-[10px] font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-gray-600">
                          Vibe: {finderPreferences.vibe}
                        </span>
                        {finderPreferences.transit && (
                          <span className="text-[10px] font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-gray-600 flex items-center gap-1">
                            <TrainFront className="w-3 h-3 text-[#C9A84C]" /> Public Transit Preferred
                          </span>
                        )}
                        {finderPreferences.pet && (
                          <span className="text-[10px] font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-gray-600 flex items-center gap-1">
                            <Footprints className="w-3 h-3 text-[#C9A84C]" /> Pet Friendly
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setFinderPreferences(null)}
                      className="px-3.5 py-2 rounded-xl text-[11px] font-semibold border border-[#E5E0D8] bg-transparent text-[#1C3A2F] cursor-pointer hover:bg-gray-50"
                      style={{ fontFamily: "inherit" }}
                    >
                      Update Profile
                    </button>
                  </div>

                  {/* Neighborhoods Match Deck */}
                  <div>
                    <h3 className="text-[15px] font-bold text-[#1C3A2F] mb-3">Top Matching Neighborhoods</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {matchedNeighborhoods.slice(0, 3).map((n) => (
                        <div key={n.name} className="bg-white rounded-2xl border border-[#E5E0D8] p-4 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-[14px] font-bold text-[#1C3A2F]">{n.name}</h4>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.15)", color: "#1C3A2F" }}>
                                {n.matchScore}% Fit
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">District: {n.district || "Bangkok"}</p>
                            <p className="text-[11.5px] leading-relaxed text-gray-500 font-light mt-2.5 line-clamp-2">
                              {n.description}
                            </p>
                          </div>
                          <a
                            href={`/neighborhood/${n.slug}`}
                            className="text-[11px] font-semibold text-[#1C3A2F] no-underline mt-4 flex items-center gap-1 w-fit border-b border-[#1C3A2F] pb-0.5"
                          >
                            Explore neighborhood guides →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Listings */}
                  <div>
                    <h3 className="text-[15px] font-bold text-[#1C3A2F] mb-3">Recommended Properties for You</h3>
                    {matchedProperties.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center text-gray-400 text-sm">
                        No property listings matching your exact budget/pet preferences are currently listed.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {matchedProperties.map((p, idx) => (
                          <ExplorePropertyCard key={p.id} property={p} index={idx} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. SAVED PROPERTIES */}
          {activeTab === "saved" && (
            <div>
              {savedListings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.15)" }}>
                    <Heart size={24} className="text-[#C9A84C]" fill="#C9A84C" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#1C3A2F] mb-1">Your shortlist is empty</h3>
                  <p className="text-[13px] text-gray-400 font-light mb-6">
                    Tap the heart icon on any property to save it to your local dashboard.
                  </p>
                  <a href="/explore" className="px-5 py-3 rounded-xl text-[12px] font-semibold text-white no-underline inline-block" style={{ background: "#1C3A2F" }}>
                    Browse Listings
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {savedListings.map((p, idx) => (
                    <ExplorePropertyCard key={p.id} property={p} index={idx} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. SAVED SEARCHES */}
          {activeTab === "searches" && (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
              <h2 className="text-[16px] font-bold text-[#1C3A2F] mb-1">Saved Searches & Alerts</h2>
              <p className="text-[13px] text-gray-500 font-light mb-6">
                Receive notifications when new properties matching your search parameters are uploaded.
              </p>

              {searchesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#C9A84C]" size={24} />
                </div>
              ) : savedSearchesList.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  You haven&apos;t saved any searches yet. Perform a search on the Explore page and click &quot;Save Search&quot;.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {savedSearchesList.map((s) => (
                    <div
                      key={s.id}
                      className="border border-[#E5E0D8] rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap hover:border-gray-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="text-[14px] font-semibold text-[#1C3A2F] flex items-center gap-2">
                          <Search size={14} className="text-gray-400" />
                          &quot;{s.query}&quot;
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                          Saved on {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Alert Switch */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                            Email Alerts
                          </span>
                          <button
                            onClick={() => handleToggleAlert(s.id, s.alertEnabled)}
                            className="w-10 h-6 rounded-full p-0.5 border-none cursor-pointer transition-colors relative"
                            style={{
                              background: s.alertEnabled ? "#1C3A2F" : "#ccc",
                            }}
                          >
                            <span
                              className="block w-5 h-5 rounded-full bg-white transition-all shadow-sm"
                              style={{
                                transform: s.alertEnabled ? "translateX(16px)" : "translateX(0px)",
                              }}
                            />
                          </button>
                        </div>

                        {/* Execute */}
                        <button
                          onClick={() => router.push(`/explore/smart?q=${encodeURIComponent(s.query)}`)}
                          className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-white border-none cursor-pointer hover:opacity-90"
                          style={{ background: "#C9A84C" }}
                        >
                          Run Search
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteSearch(s.id)}
                          className="p-1.5 rounded-lg border border-red-100 hover:border-red-200 text-red-500 cursor-pointer bg-transparent"
                          aria-label="Delete saved search"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. COMMUTE PLANNER */}
          {activeTab === "commute" && (
            <div className="flex flex-col gap-6">
              {/* Form card */}
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
                <h2 className="text-[16px] font-bold text-[#1C3A2F] mb-1">Add Commute Destination</h2>
                <p className="text-[13px] text-gray-500 font-light mb-6">
                  Set your commute hubs (office, school, gym) to calculate dynamic transit times on property cards.
                </p>

                <form onSubmit={handleAddHub} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Presets Selection */}
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">
                      Popular Commute Destinations
                    </label>
                    <select
                      value={newHubPreset}
                      onChange={(e) => handlePresetSelect(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[13px] bg-white"
                      style={{ fontFamily: "inherit" }}
                    >
                      <option value="">-- Choose a preset destination (or select custom location below) --</option>
                      {PRESET_HUBS.map((preset) => (
                        <option key={preset.name} value={preset.name}>
                          {preset.name} ({preset.address})
                        </option>
                      ))}
                      <option value="custom">Custom Location (type name/address below)</option>
                    </select>
                  </div>

                  {/* Hub Name */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">
                      Destination Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Work, School, Gym"
                      value={newHubName}
                      onChange={(e) => setNewHubName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[13px]"
                      style={{ fontFamily: "inherit" }}
                      required
                    />
                  </div>

                  {/* Mode */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">
                      Preferred Travel Mode
                    </label>
                    <select
                      value={newHubMode}
                      onChange={(e) => setNewHubMode(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[13px] bg-white"
                      style={{ fontFamily: "inherit" }}
                    >
                      <option value="transit">Public Transit (BTS/MRT)</option>
                      <option value="driving">Driving / Taxi</option>
                      <option value="walking">Walking</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">
                      Address / Description
                    </label>
                    <input
                      type="text"
                      placeholder="Street address or station name"
                      value={newHubAddress}
                      onChange={(e) => setNewHubAddress(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[13px]"
                      style={{ fontFamily: "inherit" }}
                    />
                  </div>



                  {commuteError && (
                    <div className="md:col-span-2 text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle size={14} />
                      {commuteError}
                    </div>
                  )}

                  <div className="md:col-span-2 mt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white cursor-pointer border-none transition-opacity hover:opacity-90"
                      style={{ background: "#1C3A2F" }}
                    >
                      Save Commute Destination
                    </button>
                  </div>
                </form>
              </div>

              {/* Hub deck */}
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
                <h3 className="text-[15px] font-bold text-[#1C3A2F] mb-4">Saved Commute Hubs</h3>
                {commuteLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="animate-spin text-[#C9A84C]" size={20} />
                  </div>
                ) : commuteHubsList.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">
                    No commute destinations configured. Use the form above to add your workplace or school.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {commuteHubsList.map((h) => (
                      <div
                        key={h.id}
                        className="border border-[#E5E0D8] rounded-xl p-4 flex flex-col justify-between hover:border-gray-300 transition-colors"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-[14px] font-bold text-[#1C3A2F] flex items-center gap-1.5">
                              <MapPin size={14} className="text-[#C9A84C]" />
                              {h.name}
                            </h4>
                            <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-100 inline-flex items-center gap-1">
                              {h.transitMode === "transit" && <TrainFront size={11} />}
                              {h.transitMode === "driving" && <Car size={11} />}
                              {h.transitMode === "walking" && <Footprints size={11} />}
                              {h.transitMode === "transit" ? "Transit" : h.transitMode === "driving" ? "Driving" : "Walking"}
                            </span>
                          </div>
                          {h.address && <p className="text-[11.5px] text-gray-400 mt-1">{h.address}</p>}
                          <p className="text-[10px] text-gray-400/70 mt-3 font-mono">
                            Coords: {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteHub(h.id)}
                          className="mt-4 w-full py-2 rounded-lg border border-red-50 hover:bg-red-50 hover:border-red-100 text-red-500 font-medium text-[11px] cursor-pointer bg-transparent transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 size={12} />
                          Remove Hub
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. COLLABORATIVE LISTS */}
          {activeTab === "collab" && (
            <div className="flex flex-col gap-6">
              {!activeShortlist ? (
                // Shortlist Deck
                <div className="flex flex-col gap-6">
                  {/* Create Card */}
                  <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
                    <h2 className="text-[16px] font-bold text-[#1C3A2F] mb-1">Create Shared Shortlist</h2>
                    <p className="text-[13px] text-gray-500 font-light mb-6">
                      Collaborate on potential properties with your partner, roommate, or agent.
                    </p>

                    <form onSubmit={handleCreateShortlist} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[11px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">
                          Shortlist Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Our Sathorn Condos search"
                          value={newCollabName}
                          onChange={(e) => setNewCollabName(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[13px]"
                          style={{ fontFamily: "inherit" }}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">
                          Collaborator Email
                        </label>
                        <input
                          type="email"
                          placeholder="partner@email.com"
                          value={newCollabEmail}
                          onChange={(e) => setNewCollabEmail(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[13px]"
                          style={{ fontFamily: "inherit" }}
                          required
                        />
                      </div>

                      {collabError && (
                        <div className="md:col-span-3 text-xs text-red-500 font-medium flex items-center gap-1">
                          <AlertCircle size={14} />
                          {collabError}
                        </div>
                      )}

                      <div className="md:col-span-3 mt-1">
                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl text-[13px] font-semibold text-white cursor-pointer border-none transition-opacity hover:opacity-90"
                          style={{ background: "#1C3A2F" }}
                        >
                          Invite Collaborator & Create Shortlist
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active List */}
                  <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
                    <h3 className="text-[15px] font-bold text-[#1C3A2F] mb-4">Shared Collections</h3>
                    {collabLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="animate-spin text-[#C9A84C]" size={20} />
                      </div>
                    ) : shortlists.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-6">
                        No shared shortlists created yet. Invite someone above to get started.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shortlists.map((s) => (
                          <div
                            key={s.id}
                            className="border border-[#E5E0D8] rounded-xl p-4 flex flex-col justify-between hover:border-gray-300 transition-colors"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="text-[14px] font-bold text-[#1C3A2F]">{s.name}</h4>
                                <button
                                  onClick={() => handleDeleteShortlist(s.id)}
                                  className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-500 border-none cursor-pointer bg-transparent"
                                  title="Delete shortlist"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                                Collaborator: <span className="font-semibold text-gray-600">{s.collaboratorEmail}</span>
                              </p>
                              <p className="text-[10px] text-gray-400/70 mt-1">
                                Owner: {s.ownerEmail === user?.email ? "You" : s.ownerEmail}
                              </p>
                            </div>

                            <button
                              onClick={() => handleOpenShortlist(s)}
                              className="mt-4 w-full py-2.5 rounded-lg text-white font-semibold text-[11px] cursor-pointer border-none transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5"
                              style={{ background: "#1C3A2F" }}
                            >
                              <Eye size={12} />
                              Open Shortlist Workspace
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Shortlist Workspace (Inner page)
                <div className="flex flex-col gap-6">
                  {/* Workspace Header */}
                  <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <button
                        onClick={() => setActiveShortlist(null)}
                        className="text-[11px] font-semibold text-[#1C3A2F] border-none bg-transparent cursor-pointer hover:underline p-0 flex items-center gap-1"
                      >
                        ← Back to Collections
                      </button>
                      <h2 className="text-[18px] font-bold text-[#1C3A2F] mt-2 flex items-center gap-2">
                        <Users size={20} className="text-[#C9A84C]" />
                        {activeShortlist.name}
                      </h2>
                      <p className="text-[11.5px] text-gray-400 mt-0.5">
                        Shared with <span className="font-semibold text-gray-500">{activeShortlist.collaboratorEmail}</span>
                      </p>
                    </div>
                  </div>

                  {/* List View with Comments */}
                  <div className="flex flex-col gap-6">
                    {activeShortlistProps.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-12 text-center text-gray-400 text-sm">
                        Loading shortlist properties...
                      </div>
                    ) : (
                      activeShortlistProps.map((p, pIdx) => {
                        const comments = activePropComments[p.id] || [];
                        const currentInput = commentInputs[p.id] || "";
                        const loadingComment = sendingComment[p.id] || false;

                        return (
                          <div
                            key={p.id}
                            className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow"
                          >
                            {/* Left: Card layout */}
                            <div className="w-full md:w-[320px] flex-shrink-0 border-r border-[#E5E0D8]">
                              <ExplorePropertyCard property={p} index={pIdx} />
                            </div>

                            {/* Right: Collaboration Chat Panel */}
                            <div className="flex-1 p-5 flex flex-col justify-between bg-[rgba(247,243,236,0.25)] min-h-[300px]">
                              {/* Comments header */}
                              <div className="border-b border-[#EDE8DF] pb-2 mb-3 flex items-center gap-1.5">
                                <MessageSquare size={14} className="text-[#C9A84C]" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1C3A2F]">
                                  Collaboration Thread ({comments.length})
                                </span>
                              </div>

                              {/* Message bubble track */}
                              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 max-h-[200px] no-scrollbar">
                                {comments.map((c: any) => {
                                  const isMe = c.userEmail === user?.email;
                                  return (
                                    <div
                                      key={c.id}
                                      className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                                    >
                                      <span className="text-[9.5px] text-gray-400 font-semibold mb-0.5 px-1">
                                        {isMe ? "You" : c.userName} · {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      <div
                                        className="rounded-2xl px-4 py-2.5 text-[12px] leading-relaxed shadow-sm font-light"
                                        style={{
                                          background: isMe ? "#1C3A2F" : "#FFFFFF",
                                          color: isMe ? "#FFFFFF" : "#1A1A1A",
                                          border: isMe ? "none" : "1px solid #EDE8DF",
                                        }}
                                      >
                                        {c.comment}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Input panel */}
                              <div className="mt-4 pt-3 border-t border-[#EDE8DF] flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Type feedback, question, or visit schedule..."
                                  value={currentInput}
                                  onChange={(e) =>
                                    setCommentInputs((prev) => ({ ...prev, [p.id]: e.target.value }))
                                  }
                                  onKeyDown={(e) => e.key === "Enter" && handlePostComment(p.id)}
                                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[12px] shadow-inner bg-white"
                                  style={{ fontFamily: "inherit" }}
                                  disabled={loadingComment}
                                />
                                <button
                                  onClick={() => handlePostComment(p.id)}
                                  className="px-4 py-2.5 rounded-xl text-white border-none cursor-pointer hover:opacity-90 flex items-center justify-center"
                                  style={{ background: "#1C3A2F" }}
                                  disabled={loadingComment || !currentInput.trim()}
                                >
                                  {loadingComment ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Send size={14} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. SETTINGS SECTION */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm flex flex-col gap-6">
              <div>
                <h2 className="text-[16px] font-bold text-[#1C3A2F] mb-1">Account & Preferences</h2>
                <p className="text-[13px] text-gray-500 font-light">
                  Manage your personal details, preferred currency, language, and system settings.
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setToastMessage("✓ Settings saved successfully!");
                setTimeout(() => setToastMessage(""), 3000);
              }} className="flex flex-col gap-6 max-w-xl">
                {/* Profile Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name || ""}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[13px]"
                      style={{ fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[13px] bg-gray-50 text-gray-400 cursor-not-allowed"
                      style={{ fontFamily: "inherit" }}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 my-1" />

                {/* Display Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">
                      Preferred Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[13px] bg-white"
                      style={{ fontFamily: "inherit" }}
                    >
                      <option value="THB">฿ THB (Thai Baht)</option>
                      <option value="USD">$ USD (US Dollar)</option>
                      <option value="EUR">€ EUR (Euro)</option>
                      <option value="CNY">¥ CNY (Chinese Yuan)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">
                      System Language
                    </label>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0D8] outline-none text-[13px] bg-white"
                      style={{ fontFamily: "inherit" }}
                    >
                      <option value="en">English</option>
                      <option value="th">ไทย (Thai)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-1" />

                {/* Alert Notifications */}
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Notification Settings
                  </span>
                  
                  <div className="flex items-center justify-between p-1">
                    <div>
                      <span className="text-[13px] font-bold text-[#1C3A2F] block">New Listing Recommendations</span>
                      <span className="text-[10px] text-gray-400">Receive weekly emails with properties matching your Auto Finder profile</span>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 accent-[#1C3A2F] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-1">
                    <div>
                      <span className="text-[13px] font-bold text-[#1C3A2F] block">Shortlist Activity Alerts</span>
                      <span className="text-[10px] text-gray-400">Notify me immediately when collaborators post comments on my shortlists</span>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 accent-[#1C3A2F] cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-[13px] font-semibold text-white mt-4 cursor-pointer border-none transition-opacity hover:opacity-90"
                  style={{ background: "#1C3A2F" }}
                >
                  Save Account Settings
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-6 left-6 z-[9999] px-4 py-3 rounded-xl text-xs font-semibold shadow-xl border"
          style={{ background: "#1C3A2F", color: "#E2C97E", borderColor: "#C9A84C" }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
