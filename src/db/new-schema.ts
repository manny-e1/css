import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Categories & Subcategories
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subCategories = pgTable("sub_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Materials
export const materials = pgTable("materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => categories.id),
  subCategoryId: uuid("sub_category_id").references(() => subCategories.id),
  category: text("category").notNull(),
  name: text("name").notNull(),
  supplierName: text("supplier_name").notNull(),
  supplierEmail: text("supplier_email"), // Added for reliable joining
  origin: text("origin").notNull(),
  unit: text("unit").default("unit"),
  unitPriceRange: text("unit_price_range").notNull(),
  leadTimeEstimate: text("lead_time_estimate").notNull(),
  embodiedCarbonFactor: numeric("embodied_carbon_factor").notNull(),
  imageUrl: text("image_url"),
  images: jsonb("images").default([]),
  certification: text("certification"),
  approved: boolean("approved").default(false),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inquiries
export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  materialId: uuid("material_id").references(() => materials.id),
  userId: text("user_id").references(() => users.id),
  projectId: uuid("project_id").references(() => projects.id),
  quantity: numeric("quantity"),
  projectName: text("project_name"),
  deliveryAddress: text("delivery_address"),
  desiredDeliveryDate: timestamp("desired_delivery_date"),
  notes: text("notes"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inquiry Messages (Chat System)
export const inquiryMessages = pgTable("inquiry_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  inquiryId: uuid("inquiry_id")
    .references(() => inquiries.id, { onDelete: "cascade" })
    .notNull(),
  senderId: text("sender_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sourcing Requests (Professionals seeking materials)
export const sourcingRequests = pgTable("sourcing_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id),
  userId: text("user_id").references(() => users.id), // Professional who requested
  category: text("category").notNull(),
  subCategory: text("sub_category"), // Added for MVP: sub-category
  description: text("description"),
  quantity: numeric("quantity").notNull(),
  unit: text("unit"), // Added for MVP: kg, m3, units, etc.
  requestType: text("request_type"), // Added for MVP: material or service
  location: text("location"), // Added for MVP: delivery location
  targetUnitPrice: numeric("target_unit_price"),
  deadline: timestamp("deadline"),
  notes: text("notes"), // Added for MVP: Optional notes
  status: text("status").default("open"), // open, closed, awarded
  createdAt: timestamp("created_at").defaultNow(),
});

// Bids (Suppliers responding to sourcing requests)
export const bids = pgTable("bids", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .references(() => sourcingRequests.id, { onDelete: "cascade" })
    .notNull(),
  supplierId: text("supplier_id").references(() => users.id),
  materialId: uuid("material_id").references(() => materials.id), // If bidding with existing material
  bidUnitPrice: numeric("bid_unit_price").notNull(),
  leadTimeEstimate: text("lead_time_estimate"),
  minimumOrder: text("minimum_order"), // Added for MVP: Minimum order if applicable
  quoteUrl: text("quote_url"), // Added for MVP: Optional generated quote or invoice
  notes: text("notes"),
  status: text("status").default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id),
  name: text("name").notNull(),
  projectType: text("project_type"),
  location: text("location"),
  floorArea: numeric("floor_area"),
  selectedMaterials: jsonb("selected_materials"), // {cement: materialId, ...}
  createdAt: timestamp("created_at").defaultNow(),
});

// Supplier Profiles
export const supplierProfiles = pgTable("supplier_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull()
    .unique(), // One profile per user
  tin: text("tin").notNull(),
  description: text("description").notNull(),
  certificationUrl: text("certification_url").notNull(),
  phoneNumber: text("phone_number").notNull(),
  approvalStatus: text("approval_status").default("pending").notNull(), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Orders
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  materialId: uuid("material_id").references(() => materials.id),
  userId: text("user_id").references(() => users.id),
  projectId: uuid("project_id").references(() => projects.id),
  quantity: numeric("quantity").notNull(),
  totalPrice: numeric("total_price"),
  status: text("status").default("pending"), // pending, confirmed, paid, shipped, delivered, cancelled
  shippingAddress: text("shipping_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info"), // info, success, warning, error
  read: boolean("read").default(false).notNull(),
  link: text("link"), // Optional link to redirect user
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations (optional for queries)
export const materialsRelations = relations(materials, ({ many, one }) => ({
  inquiries: many(inquiries),
  category: one(categories, {
    fields: [materials.categoryId],
    references: [categories.id],
  }),
  subCategory: one(subCategories, {
    fields: [materials.subCategoryId],
    references: [subCategories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  subCategories: many(subCategories),
  materials: many(materials),
}));

export const subCategoriesRelations = relations(
  subCategories,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [subCategories.categoryId],
      references: [categories.id],
    }),
    materials: many(materials),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  inquiries: many(inquiries),
  projects: many(projects),
  sourcingRequests: many(sourcingRequests),
  bids: many(bids),
  notifications: many(notifications),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  material: one(materials, {
    fields: [orders.materialId],
    references: [materials.id],
  }),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  project: one(projects, {
    fields: [orders.projectId],
    references: [projects.id],
  }),
}));

export const sourcingRequestsRelations = relations(
  sourcingRequests,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [sourcingRequests.projectId],
      references: [projects.id],
    }),
    user: one(users, {
      fields: [sourcingRequests.userId],
      references: [users.id],
    }),
    bids: many(bids),
  }),
);

export const bidsRelations = relations(bids, ({ one }) => ({
  request: one(sourcingRequests, {
    fields: [bids.requestId],
    references: [sourcingRequests.id],
  }),
  supplier: one(users, {
    fields: [bids.supplierId],
    references: [users.id],
  }),
  material: one(materials, {
    fields: [bids.materialId],
    references: [materials.id],
  }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  material: one(materials, {
    fields: [inquiries.materialId],
    references: [materials.id],
  }),
  user: one(users, { fields: [inquiries.userId], references: [users.id] }),
  project: one(projects, {
    fields: [inquiries.projectId],
    references: [projects.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
}));
// lib/schema.ts (append)
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // 'professional', 'supplier', 'partnership'
  companyName: text("company_name"),
  contactName: text("contact_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  materialType: text("material_type"), // for suppliers
  countryCity: text("country_city"),
  partnershipType: text("partnership_type"), // for partnerships
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});
