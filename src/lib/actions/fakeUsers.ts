"use server";

import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import type { ActionResult } from "./resource";

const FIRST_NAMES = ["Amara", "Kwame", "Zara", "Kofi", "Aisha", "Tunde", "Nia", "Sefu", "Imani", "Jabari", "Lulu", "Chidi", "Ayana", "Femi", "Sade", "Obi", "Thandi", "Bayo"];
const LAST_NAMES = ["Okafor", "Mensah", "Diallo", "Abebe", "Mwangi", "Nkemdirim", "Dube", "Bello", "Cisse", "Achebe", "Kone", "Osei"];

const schema = z.object({
  count: z.coerce.number().int().min(1).max(200),
  gender: z.enum(["MALE", "FEMALE", "RANDOM"]),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0).max(500),
  interestCount: z.coerce.number().int().min(0).max(10),
  languageCount: z.coerce.number().int().min(0).max(10),
  ccode: z.string().max(6),
});

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function sample<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length));
}
function jitter(base: number, radiusKm: number): number {
  // ~111km per degree; random offset within radius
  const deg = radiusKm / 111;
  return base + (Math.random() * 2 - 1) * deg;
}

export async function generateFakeUsers(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  try {
    await requirePermission("fakeuser", "Update");
  } catch {
    return { ok: false, message: "Permission denied." };
  }

  const parsed = schema.safeParse({
    count: form.get("count"),
    gender: form.get("gender"),
    lat: form.get("lat"),
    lng: form.get("lng"),
    radius: form.get("radius"),
    interestCount: form.get("interestCount"),
    languageCount: form.get("languageCount"),
    ccode: form.get("ccode") || "+234",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };

  const p = parsed.data;
  const sb = getServiceClient();
  const [{ data: interests }, { data: languages }] = await Promise.all([
    sb.from("interests").select("id").eq("status", true),
    sb.from("languages").select("id").eq("status", true),
  ]);
  const interestIds = (interests ?? []).map((r) => r.id);
  const languageIds = (languages ?? []).map((r) => r.id);

  const rows = Array.from({ length: p.count }).map(() => {
    const gender = p.gender === "RANDOM" ? rand(["MALE", "FEMALE"]) : p.gender;
    const first = rand(FIRST_NAMES);
    const name = `${first} ${rand(LAST_NAMES)}`;
    const year = 1985 + Math.floor(Math.random() * 20);
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
    const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
    const mobile = String(Math.floor(100000000 + Math.random() * 899999999));
    return {
      name,
      email: `${first.toLowerCase()}${Math.floor(Math.random() * 99999)}@example.com`,
      mobile,
      ccode: p.ccode,
      gender,
      birth_date: `${year}-${month}-${day}`,
      search_preference: gender === "MALE" ? "FEMALE" : "MALE",
      radius_search: 100,
      interest: sample(interestIds, p.interestCount).join(","),
      language: sample(languageIds, p.languageCount).join(","),
      lats: jitter(p.lat, p.radius),
      longs: jitter(p.lng, p.radius),
      user_type: "FAKE_USER",
      is_verify: 2,
      status: true,
    };
  });

  const { error } = await sb.from("users").insert(rows);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: `Generated ${p.count} fake profile(s).` };
}
