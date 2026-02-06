import { relations } from "drizzle-orm";
import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authUser } from "@/db/auth-schema";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const projectTypeEnum = pgEnum("project_type", [
  "residential",
  "commercial",
]);
export const materialCategoryEnum = pgEnum("material_category", [
  "cement",
  "steel",
  "timber",
  "blocks",
  "finishes",
]);
export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "sent",
  "responded",
]);
export const materialSubmissionStatusEnum = pgEnum(
  "material_submission_status",
  ["pending", "approved", "rejected"],
);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const subCategories = pgTable("sub_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => authUser.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  projectType: projectTypeEnum("project_type").notNull(),
  floorAreaM2: numeric("floor_area_m2", { precision: 12, scale: 2 }).notNull(),
  locationCountry: text("location_country").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const materials = pgTable("materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  subCategoryId: uuid("sub_category_id").references(() => subCategories.id),
  category: materialCategoryEnum("category").notNull(),
  supplierName: text("supplier_name").notNull(),
  countryOfOrigin: text("country_of_origin").notNull(),
  unit: text("unit").notNull(),
  unitPriceMin: numeric("unit_price_min", {
    precision: 12,
    scale: 2,
  }).notNull(),
  unitPriceMax: numeric("unit_price_max", {
    precision: 12,
    scale: 2,
  }).notNull(),
  leadTimeEstimate: text("lead_time_estimate"),
  embodiedCarbonFactorPerUnit: numeric("embodied_carbon_factor_per_unit", {
    precision: 12,
    scale: 4,
  }).notNull(),
  certificationOrSourceNote: text("certification_or_source_note"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const projectMaterials = pgTable("project_materials", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  materialId: uuid("material_id")
    .notNull()
    .references(() => materials.id, { onDelete: "restrict" }),
  quantity: numeric("quantity", { precision: 14, scale: 4 }).notNull(),
});

export const supplierInquiries = pgTable("supplier_inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  materialId: uuid("material_id")
    .notNull()
    .references(() => materials.id, { onDelete: "restrict" }),
  supplierName: text("supplier_name").notNull(),
  message: text("message").notNull(),
  status: inquiryStatusEnum("status").notNull().default("sent"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export const materialSubmissions = pgTable("material_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  submittedByUserId: text("submitted_by_user_id")
    .notNull()
    .references(() => authUser.id, {
      onDelete: "cascade",
    }),
  name: text("name").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  subCategoryId: uuid("sub_category_id").references(() => subCategories.id),
  category: materialCategoryEnum("category").notNull(),
  supplierName: text("supplier_name").notNull(),
  countryOfOrigin: text("country_of_origin").notNull(),
  unit: text("unit").notNull(),
  unitPriceMin: numeric("unit_price_min", {
    precision: 12,
    scale: 2,
  }).notNull(),
  unitPriceMax: numeric("unit_price_max", {
    precision: 12,
    scale: 2,
  }).notNull(),
  leadTimeEstimate: text("lead_time_estimate"),
  embodiedCarbonFactorPerUnit: numeric("embodied_carbon_factor_per_unit", {
    precision: 12,
    scale: 4,
  }).notNull(),
  certificationOrSourceNote: text("certification_or_source_note"),
  status: materialSubmissionStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  decidedAt: timestamp("decided_at"),
  decisionNote: text("decision_note"),
});

// Optional relations (handy for typed joins)
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ many, one }) => ({
  owner: one(authUser, {
    fields: [projects.userId],
    references: [authUser.id],
  }),
  materials: many(projectMaterials),
  inquiries: many(supplierInquiries),
}));

export const materialsRelations = relations(materials, ({ many, one }) => ({
  projects: many(projectMaterials),
  inquiries: many(supplierInquiries),
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

export const subCategoriesRelations = relations(subCategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subCategories.categoryId],
    references: [categories.id],
  }),
  materials: many(materials),
}));
