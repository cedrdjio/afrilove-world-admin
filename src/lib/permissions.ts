/**
 * Role / permission model.
 *
 * Legacy Gomeet stored per-module permissions as comma-separated columns on
 * tbl_manager (interest, page, faq, ...). We model the same modules as a JSON
 * permission map: { "interest": ["Read","Write","Update"], ... }.
 *
 * The "admin" role implicitly has every permission on every module.
 */

export type PermAction = "Read" | "Write" | "Update";

export type ModuleKey =
  | "ulist"
  | "fakeuser"
  | "interest"
  | "language"
  | "religion"
  | "rgoal"
  | "gift"
  | "package"
  | "page"
  | "faq"
  | "plan"
  | "plist"
  | "payout"
  | "report"
  | "notification"
  | "wallet"
  | "coin"
  | "staff"
  | "setting";

export interface ModuleDef {
  key: ModuleKey;
  label: string;
  actions: PermAction[];
}

/** The permission matrix shown on the staff add/edit form. */
export const MODULES: ModuleDef[] = [
  { key: "ulist", label: "User list", actions: ["Read", "Update"] },
  { key: "fakeuser", label: "Fake users", actions: ["Update"] },
  { key: "interest", label: "Interests", actions: ["Read", "Write", "Update"] },
  { key: "language", label: "Languages", actions: ["Read", "Write", "Update"] },
  { key: "religion", label: "Religions", actions: ["Read", "Write", "Update"] },
  { key: "rgoal", label: "Relation goals", actions: ["Read", "Write", "Update"] },
  { key: "gift", label: "Gifts", actions: ["Read", "Write", "Update"] },
  { key: "package", label: "Packages", actions: ["Read", "Write", "Update"] },
  { key: "page", label: "Pages", actions: ["Read", "Write", "Update"] },
  { key: "faq", label: "FAQs", actions: ["Read", "Write", "Update"] },
  { key: "plan", label: "Plans", actions: ["Read", "Write", "Update"] },
  { key: "plist", label: "Payment gateways", actions: ["Read", "Update"] },
  { key: "payout", label: "Payouts", actions: ["Read", "Update"] },
  { key: "report", label: "Reports", actions: ["Read"] },
  { key: "notification", label: "Push notifications", actions: ["Write"] },
  { key: "wallet", label: "Wallet", actions: ["Update"] },
  { key: "coin", label: "Coins", actions: ["Update"] },
];

export type PermissionMap = Partial<Record<ModuleKey, PermAction[]>>;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff";
  permissions: PermissionMap;
}

/** Does this user have `action` permission on `module`? Admins always do. */
export function can(user: SessionUser | null, module: ModuleKey, action: PermAction): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  const granted = user.permissions?.[module];
  return Array.isArray(granted) && granted.includes(action);
}

/** Can the user see the module at all (has any permission on it)? */
export function canViewModule(user: SessionUser | null, module: ModuleKey): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  const granted = user.permissions?.[module];
  return Array.isArray(granted) && granted.length > 0;
}

/** Admin-only areas (staff can never access). */
export const ADMIN_ONLY: ReadonlyArray<string> = ["staff", "setting", "profile"];
