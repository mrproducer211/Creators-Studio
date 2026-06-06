"use client";

import { useState } from "react";
import { Bookmark, Info, Heart, Share2 } from "lucide-react";
import { PropertyCard } from "@/types/property";
import { useSaved } from "@/contexts/SavedContext";
import { useSession } from "next-auth/react";

interface Props {
  property: PropertyCard;
}

function ActionBtn({
  onClick,
  active,
  activeColor,
  label,
  children,
  href,
}: {
  onClick?: () => void;
  active?: boolean;
  activeColor?: string;
  label: string;
  children: React.ReactNode;
  href?: string;
}) {
  const isGold = active && activeColor === "rgba(201,168,76,0.95)";
  const body = (
    <>
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{
          background: active ? (activeColor ?? "rgba(255,255,255,0.2)") : "rgba(0,0,0,0.48)",
          backdropFilter: "blur(8px)",
          color: isGold ? "#1C3A2F" : "rgba(255,255,255,0.96)",
          border: active ? "1.5px solid rgba(255,255,255,0.45)" : "1.5px solid rgba(255,255,255,0.18)",
          boxShadow: active ? "0 8px 20px rgba(0,0,0,0.25)" : "0 6px 16px rgba(0,0,0,0.22)",
        }}
      >
        {children}
      </div>
      <span
        className="text-[10px] font-semibold mt-1"
        style={{ color: "rgba(255,255,255,0.88)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
      >
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="flex flex-col items-center cursor-pointer no-underline" style={{ fontFamily: "inherit" }}>
        {body}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="flex flex-col items-center cursor-pointer border-none bg-transparent p-0" style={{ fontFamily: "inherit" }}>
      {body}
    </button>
  );
}

export default function ReelActions({ property }: Props) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(property.id);

  const share = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/property/${property.slug}` : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: property.name, text: property.description, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <ActionBtn
        onClick={async () => {
          if (!session) {
            window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            return;
          }
          if (!liked) {
            setLiked(true);
            try {
              await fetch(`/api/properties/${property.id}/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "like" }),
              });
            } catch (err) {
              console.error("Failed to persist reel like:", err);
            }
          }
        }}
        active={liked}
        activeColor="rgba(224,82,82,0.85)"
        label={String(property.likes + (liked ? 1 : 0))}
      >
        <Heart size={22} strokeWidth={2.1} fill={liked ? "currentColor" : "none"} />
      </ActionBtn>

      <ActionBtn
        onClick={() => toggle(property.id)}
        active={saved}
        activeColor="rgba(201,168,76,0.95)"
        label={saved ? "Saved" : "Save"}
      >
        <Bookmark size={22} strokeWidth={2.1} fill={saved ? "currentColor" : "none"} />
      </ActionBtn>

      <ActionBtn onClick={share} label="Share">
        <Share2 size={21} strokeWidth={2.1} />
      </ActionBtn>

      <ActionBtn href={`/property/${property.slug}`} label="Details">
        <Info size={22} strokeWidth={2.1} />
      </ActionBtn>
    </div>
  );
}
