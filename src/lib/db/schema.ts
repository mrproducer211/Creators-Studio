import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  varchar,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const listingTypeEnum = pgEnum("listing_type", ["sale", "rent", "short_stay"]);
export const propertyTypeEnum = pgEnum("property_type", ["condo", "house", "villa", "townhouse", "apartment"]);
export const statusEnum = pgEnum("status", ["active", "sold", "rented", "draft"]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "published", "rejected"]);

export const properties = pgTable("properties", {
  id:           serial("id").primaryKey(),
  slug:         varchar("slug", { length: 200 }).notNull().unique(),
  name:         varchar("name", { length: 300 }).notNull(),
  projectName:  varchar("project_name", { length: 200 }),
  description:  text("description"),

  listingType:  listingTypeEnum("listing_type").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  status:       statusEnum("status").notNull().default("active"),

  // Price
  priceTHB:     numeric("price_thb", { precision: 15, scale: 2 }).notNull(),
  priceUSD:     numeric("price_usd", { precision: 12, scale: 2 }),
  priceLabel:   varchar("price_label", { length: 60 }), // e.g. "/month", "/night"

  // Specs
  bedrooms:     integer("bedrooms").notNull().default(0),
  bathrooms:    integer("bathrooms").notNull().default(1),
  sqm:          integer("sqm"),
  floor:        integer("floor"),
  totalFloors:  integer("total_floors"),

  // Location
  area:         varchar("area", { length: 100 }).notNull(),   // Sukhumvit, Silom…
  district:     varchar("district", { length: 100 }),
  latitude:     numeric("latitude",  { precision: 10, scale: 7 }),
  longitude:    numeric("longitude", { precision: 10, scale: 7 }),

  // Media
  coverImage:   text("cover_image"),     // Cloudinary URL
  images:       text("images").array(),  // additional images
  videoUrl:     text("video_url"),       // Cloudinary / YouTube

  // Engagement
  likes:        integer("likes").notNull().default(0),
  views:        integer("views").notNull().default(0),
  saves:        integer("saves").notNull().default(0),
  clicks:       integer("clicks").notNull().default(0),

  // Arrays for details
  amenities:    text("amenities").array(),
  features:     text("features").array(),
  schools:      text("schools").array(),
  transit:      text("transit").array(),
  neighborhood: text("neighborhood"),

  // Customizable details
  buildingBuilt:     integer("building_built"),
  lastRenovated:     integer("last_renovated"),
  furnishing:        varchar("furnishing", { length: 50 }),
  availableFrom:     varchar("available_from", { length: 50 }),
  lastVerifiedAt:    varchar("last_verified_at", { length: 50 }),
  btsStation:        varchar("bts_station", { length: 100 }),
  btsWalkMin:        integer("bts_walk_min"),
  mrtStation:        varchar("mrt_station", { length: 100 }),
  mrtWalkMin:        integer("mrt_walk_min"),
  foreignQuota:      boolean("foreign_quota"),
  visaFriendly:      boolean("visa_friendly"),
  leaseTerms:        text("lease_terms"),
  depositTerms:      text("deposit_terms"),
  maintenance:       varchar("maintenance", { length: 100 }),

  // Flags
  featured:          boolean("featured").notNull().default(false),
  hasVideo:          boolean("has_video").notNull().default(false),
  petFriendly:       boolean("pet_friendly").notNull().default(false),
  nearBts:           boolean("near_bts").notNull().default(false),
  verificationBadge: boolean("verification_badge").notNull().default(false),
  expiryDate:        timestamp("expiry_date"),
  telegramMediaGroupId: varchar("telegram_media_group_id", { length: 100 }),
  pendingVerification: boolean("pending_verification").notNull().default(false),
  agentEmail:        varchar("agent_email", { length: 255 }),

  // Timestamps
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});

export const enquiries = pgTable("enquiries", {
  id:           serial("id").primaryKey(),
  propertyId:   integer("property_id").references(() => properties.id, { onDelete: "cascade" }),
  name:         varchar("name", { length: 200 }).notNull(),
  contact:      varchar("contact", { length: 200 }).notNull(),
  method:       varchar("method", { length: 50 }).notNull(), // whatsapp / line / telegram
  message:      text("message"),
  status:       varchar("status", { length: 50 }).notNull().default("new"), // new, contacted, closed
  userRole:     varchar("user_role", { length: 50 }).notNull().default("user"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id:         serial("id").primaryKey(),
  userEmail:  varchar("user_email", { length: 255 }).notNull(),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("user_property_uniq_idx").on(t.userEmail, t.propertyId),
]);

export const appointments = pgTable("appointments", {
  id:           serial("id").primaryKey(),
  propertyId:   integer("property_id").references(() => properties.id, { onDelete: "cascade" }),
  name:         varchar("name", { length: 200 }).notNull(),
  email:        varchar("email", { length: 255 }).notNull(),
  phone:        varchar("phone", { length: 50 }).notNull(),
  date:         varchar("date", { length: 50 }).notNull(), // e.g. "2026-06-10"
  timeSlot:     varchar("time_slot", { length: 50 }).notNull(), // e.g. "10:30 AM"
  status:       varchar("status", { length: 50 }).notNull().default("pending"), // pending, confirmed, cancelled
  message:      text("message"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});

export const pageViews = pgTable("page_views", {
  id:           serial("id").primaryKey(),
  propertyId:   integer("property_id").references(() => properties.id, { onDelete: "cascade" }),
  page:         varchar("page", { length: 255 }).notNull(),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id:           serial("id").primaryKey(),
  adminEmail:   varchar("admin_email", { length: 255 }).notNull(),
  action:       varchar("action", { length: 100 }).notNull(), // e.g. "create_property", "delete_blog"
  details:      text("details").notNull(),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});

export const savedSearches = pgTable("saved_searches", {
  id:           serial("id").primaryKey(),
  userEmail:    varchar("user_email", { length: 255 }).notNull(),
  query:        text("query").notNull(),
  filters:      text("filters"), // JSON string representating filter parameters
  alertEnabled: boolean("alert_enabled").notNull().default(true),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});

export const commuteHubs = pgTable("commute_hubs", {
  id:          serial("id").primaryKey(),
  userEmail:   varchar("user_email", { length: 255 }).notNull(),
  name:        varchar("name", { length: 100 }).notNull(),
  address:     text("address"),
  latitude:    numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude:   numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  transitMode: varchar("transit_mode", { length: 50 }).notNull().default("transit"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export const sharedShortlists = pgTable("shared_shortlists", {
  id:                serial("id").primaryKey(),
  ownerEmail:        varchar("owner_email", { length: 255 }).notNull(),
  collaboratorEmail: varchar("collaborator_email", { length: 255 }).notNull(),
  name:              varchar("name", { length: 200 }).notNull(),
  createdAt:         timestamp("created_at").notNull().defaultNow(),
});

export const shortlistProperties = pgTable("shortlist_properties", {
  id:          serial("id").primaryKey(),
  shortlistId: integer("shortlist_id").references(() => sharedShortlists.id, { onDelete: "cascade" }).notNull(),
  propertyId:  integer("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export const shortlistComments = pgTable("shortlist_comments", {
  id:          serial("id").primaryKey(),
  shortlistId: integer("shortlist_id").references(() => sharedShortlists.id, { onDelete: "cascade" }).notNull(),
  propertyId:  integer("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  userEmail:   varchar("user_email", { length: 255 }).notNull(),
  userName:    varchar("user_name", { length: 200 }).notNull(),
  comment:     text("comment").notNull(),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id:                  varchar("id", { length: 100 }).primaryKey(),
  name:                varchar("name", { length: 255 }).notNull(),
  email:               varchar("email", { length: 255 }).notNull().unique(),
  passwordHash:        text("password_hash").notNull(),
  role:                varchar("role", { length: 50 }).notNull().default("user"),
  agentStatus:         varchar("agent_status", { length: 50 }),
  postingRestricted:   boolean("posting_restricted").notNull().default(false),
  requireVerification: boolean("require_verification").notNull().default(false),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id:                  serial("id").primaryKey(),
  adminEmail:          varchar("admin_email", { length: 255 }).notNull(),
  adminPhone:          varchar("admin_phone", { length: 50 }).notNull(),
  rentalExpiryEnabled: boolean("rental_expiry_enabled").notNull().default(false),
  rentalExpiryDays:    integer("rental_expiry_days").notNull().default(30),
  adminWhatsApp:       varchar("admin_whatsapp", { length: 50 }),
  adminLine:           varchar("admin_line", { length: 100 }),
  adminTelegram:       varchar("admin_telegram", { length: 100 }),
  updatedAt:           timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Property reviews — backs the `aggregateRating` JSON-LD (Google star rich results).
 * Submitted by logged-in users (status starts as "pending"), moderated by admin.
 * One review per user per property (unique index). Never fabricated —
 * aggregateRating only renders when reviewCount >= 1.
 */
export const reviews = pgTable("reviews", {
  id:          serial("id").primaryKey(),
  propertyId:  integer("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
  userId:      varchar("user_id", { length: 100 }),         // leads.id (nullable for deleted users)
  authorName:  varchar("author_name", { length: 200 }).notNull(),
  authorEmail: varchar("author_email", { length: 255 }),
  rating:      integer("rating").notNull(),                 // 1-5
  title:       varchar("title", { length: 200 }),
  body:        text("body"),
  status:      reviewStatusEnum("status").notNull().default("pending"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("review_user_property_uniq_idx").on(t.userId, t.propertyId),
]);

export type Property  = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Enquiry   = typeof enquiries.$inferSelect;
export type NewEnquiry = typeof enquiries.$inferInsert;
export type Bookmark  = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type PageView  = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
export type AuditLog  = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type NewSavedSearch = typeof savedSearches.$inferInsert;
export type CommuteHub = typeof commuteHubs.$inferSelect;
export type NewCommuteHub = typeof commuteHubs.$inferInsert;
export type SharedShortlist = typeof sharedShortlists.$inferSelect;
export type NewSharedShortlist = typeof sharedShortlists.$inferInsert;
export type ShortlistProperty = typeof shortlistProperties.$inferSelect;
export type NewShortlistProperty = typeof shortlistProperties.$inferInsert;
export type ShortlistComment = typeof shortlistComments.$inferSelect;
export type NewShortlistComment = typeof shortlistComments.$inferInsert;
export type LeadUserTable = typeof leads.$inferSelect;
export type NewLeadUserTable = typeof leads.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;


