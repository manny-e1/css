export type Role = "admin" | "professional" | "supplier" | "buyer";

export const ROLES = {
  ADMIN: "admin" as Role,
  PROFESSIONAL: "professional" as Role,
  SUPPLIER: "supplier" as Role,
  BUYER: "buyer" as Role,
};

export const PERMISSIONS = {
  // Admin permissions
  ADMIN_ALL: "*",

  // Project permissions
  PROJECT_CREATE: "project:create",
  PROJECT_READ: "project:read",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",

  // Material permissions
  MATERIAL_CREATE: "material:create",
  MATERIAL_READ: "material:read",
  MATERIAL_UPDATE: "material:update",
  MATERIAL_DELETE: "material:delete",
  MATERIAL_COMPARE_ADVANCED: "material:compare_advanced",
  MATERIAL_EXPORT: "material:export",

  // Sourcing permissions
  SOURCING_CREATE: "sourcing:create",
  SOURCING_READ: "sourcing:read",
  SOURCING_BID: "sourcing:bid",

  // Inquiry permissions
  INQUIRY_CREATE: "inquiry:create",
  INQUIRY_READ: "inquiry:read",
  INQUIRY_UPDATE: "inquiry:update",
  INQUIRY_DELETE: "inquiry:delete",
  INQUIRY_TRACK: "inquiry:track",

  // Order permissions
  ORDER_CREATE: "order:create",
  ORDER_READ: "order:read",
  ORDER_UPDATE: "order:update",
  ORDER_DELETE: "order:delete",
  ORDER_MANAGE: "order:manage",
  ORDER_FULFILL: "order:fulfill",

  // Carbon & Cost permissions
  CARBON_ESTIMATION: "carbon:estimation",
  CARBON_SAVINGS: "carbon:savings",
  COST_ESTIMATION: "cost:estimation",
  COST_OVERRIDES: "cost:overrides",

  // Reporting permissions
  REPORT_DOWNLOAD: "report:download",

  // Supplier specific permissions
  SUPPLIER_DASHBOARD: "supplier:dashboard",
  SUPPLIER_ANALYTICS: "supplier:analytics",
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [PERMISSIONS.ADMIN_ALL],
  [ROLES.PROFESSIONAL]: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.MATERIAL_READ,
    PERMISSIONS.MATERIAL_COMPARE_ADVANCED,
    PERMISSIONS.MATERIAL_EXPORT,
    PERMISSIONS.SOURCING_CREATE,
    PERMISSIONS.SOURCING_READ,
    PERMISSIONS.INQUIRY_CREATE,
    PERMISSIONS.INQUIRY_READ,
    PERMISSIONS.INQUIRY_UPDATE,
    PERMISSIONS.INQUIRY_DELETE,
    PERMISSIONS.INQUIRY_TRACK,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_DELETE,
    PERMISSIONS.ORDER_MANAGE,
    PERMISSIONS.CARBON_ESTIMATION,
    PERMISSIONS.CARBON_SAVINGS,
    PERMISSIONS.COST_ESTIMATION,
    PERMISSIONS.COST_OVERRIDES,
    PERMISSIONS.REPORT_DOWNLOAD,
  ],
  [ROLES.SUPPLIER]: [
    PERMISSIONS.MATERIAL_CREATE,
    PERMISSIONS.MATERIAL_READ,
    PERMISSIONS.MATERIAL_UPDATE,
    PERMISSIONS.MATERIAL_DELETE,
    PERMISSIONS.SOURCING_READ,
    PERMISSIONS.SOURCING_BID,
    PERMISSIONS.INQUIRY_READ,
    PERMISSIONS.INQUIRY_UPDATE,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_FULFILL,
    PERMISSIONS.SUPPLIER_DASHBOARD,
    PERMISSIONS.SUPPLIER_ANALYTICS,
  ],
  [ROLES.BUYER]: [
    PERMISSIONS.MATERIAL_READ,
    PERMISSIONS.INQUIRY_CREATE,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_READ,
  ],
};

export function hasPermission(userRole: Role, permission: string): boolean {
  if (userRole === ROLES.ADMIN) return true; // Admin has all permissions

  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(
  userRole: Role,
  permissions: string[],
): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

export function hasAllPermissions(
  userRole: Role,
  permissions: string[],
): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

export function getRolePermissions(role: Role): string[] {
  return ROLE_PERMISSIONS[role] || [];
}
