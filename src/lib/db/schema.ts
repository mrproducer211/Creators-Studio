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

export const properties = pgTable("properties", {
  id:           serial("id").primaryKey(),
  slug:         varchar("slug", { length: 200 }).notNull().unique(),
  name:         varchar("name", { length: 300 }).notNull(),
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

  // Flags
  featured:          boolean("featured").notNull().default(false),
  hasVideo:          boolean("has_video").notNull().default(false),
  petFriendly:       boolean("pet_friendly").notNull().default(false),
  nearBts:           boolean("near_bts").notNull().default(false),
  verificationBadge: boolean("verification_badge").notNull().default(false),
  expiryDate:        timestamp("expiry_date"),
  telegramMediaGroupId: varchar("telegram_media_group_id", { length: 100 }),

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
