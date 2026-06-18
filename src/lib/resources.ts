import type { ModuleKey } from "./permissions";

/**
 * Generic CRUD resource definitions. One declarative config drives the list
 * view, the add/edit form, and the server actions for every "simple" catalog
 * module — replacing ~20 near-identical PHP files (add_*.php / list_*.php).
 */

export type FieldType = "text" | "textarea" | "number" | "image" | "switch" | "status";

export interface ResourceField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  /** column width hint for the list table */
  listHidden?: boolean;
}

export interface ResourceDef {
  /** URL slug, e.g. /interests */
  slug: string;
  /** Supabase table name */
  table: string;
  /** Permission module key */
  module: ModuleKey;
  singular: string;
  plural: string;
  icon: string; // lucide icon name
  /** primary text column shown first in the table */
  titleField: string;
  fields: ResourceField[];
}

const STATUS: ResourceField = { name: "status", label: "Status", type: "status" };

export const RESOURCES: Record<string, ResourceDef> = {
  interests: {
    slug: "interests",
    table: "interests",
    module: "interest",
    singular: "Interest",
    plural: "Interests",
    icon: "Heart",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "img", label: "Image", type: "image" },
      STATUS,
    ],
  },
  languages: {
    slug: "languages",
    table: "languages",
    module: "language",
    singular: "Language",
    plural: "Languages",
    icon: "Languages",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "img", label: "Flag / image", type: "image" },
      STATUS,
    ],
  },
  religions: {
    slug: "religions",
    table: "religions",
    module: "religion",
    singular: "Religion",
    plural: "Religions",
    icon: "Church",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      STATUS,
    ],
  },
  goals: {
    slug: "goals",
    table: "relation_goals",
    module: "rgoal",
    singular: "Relation goal",
    plural: "Relation goals",
    icon: "Target",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "subtitle", label: "Subtitle", type: "text" },
      STATUS,
    ],
  },
  gifts: {
    slug: "gifts",
    table: "gifts",
    module: "gift",
    singular: "Gift",
    plural: "Gifts",
    icon: "Gift",
    titleField: "img",
    fields: [
      { name: "img", label: "Gift image", type: "image", required: true },
      { name: "price", label: "Price (coins)", type: "number", required: true },
      STATUS,
    ],
  },
  packages: {
    slug: "packages",
    table: "packages",
    module: "package",
    singular: "Coin package",
    plural: "Coin packages",
    icon: "Coins",
    titleField: "coin",
    fields: [
      { name: "coin", label: "Coins", type: "number", required: true },
      { name: "amt", label: "Price", type: "number", required: true },
      STATUS,
    ],
  },
  pages: {
    slug: "pages",
    table: "pages",
    module: "page",
    singular: "Page",
    plural: "Pages",
    icon: "FileText",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Content", type: "textarea", listHidden: true },
      STATUS,
    ],
  },
  faqs: {
    slug: "faqs",
    table: "faqs",
    module: "faq",
    singular: "FAQ",
    plural: "FAQs",
    icon: "HelpCircle",
    titleField: "question",
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "textarea", listHidden: true },
      STATUS,
    ],
  },
  plans: {
    slug: "plans",
    table: "plans",
    module: "plan",
    singular: "Plan",
    plural: "Plans",
    icon: "BadgeCheck",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "amt", label: "Price", type: "number", required: true },
      { name: "day_limit", label: "Validity (days)", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", listHidden: true },
      { name: "filter_include", label: "Advanced filters", type: "switch", listHidden: true },
      { name: "audio_video", label: "Audio / video calls", type: "switch", listHidden: true },
      { name: "direct_chat", label: "Direct chat", type: "switch", listHidden: true },
      { name: "chat", label: "Chat", type: "switch", listHidden: true },
      { name: "like_menu", label: "Like menu", type: "switch", listHidden: true },
      STATUS,
    ],
  },
};

export function getResource(slug: string): ResourceDef | undefined {
  return RESOURCES[slug];
}

export const RESOURCE_LIST = Object.values(RESOURCES);
