"use client";

import { useActionState, useEffect } from "react";
import { saveSettings } from "@/lib/actions/admin";
import type { ActionResult } from "@/lib/actions/resource";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ImageInput } from "@/components/ui/ImageInput";
import { useToast } from "@/components/ui/Toaster";

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold">{title}</h3>
      {desc && <p className="mb-4 text-sm text-espresso-500">{desc}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
function Text({ name, label, value, placeholder, full }: { name: string; label: string; value?: any; placeholder?: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="label">{label}</label>
      <input name={name} defaultValue={value ?? ""} placeholder={placeholder} className="input" />
    </div>
  );
}
function YesNo({ name, label, value }: { name: string; label: string; value?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select name={name} defaultValue={value ?? "No"} className="input">
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}

export function SettingsForm({ s }: { s: any }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveSettings, null);
  const toast = useToast();
  useEffect(() => { if (state) toast(state.ok ? "success" : "error", state.message); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-6">
      <Section title="General">
        <Text name="webname" label="App name" value={s.webname} />
        <Text name="currency" label="Currency symbol" value={s.currency} placeholder="$" />
        <Text name="timezone" label="Timezone" value={s.timezone} placeholder="Africa/Lagos" />
        <div>
          <label className="label">Logo</label>
          <ImageInput name="weblogo" defaultValue={s.weblogo ?? null} />
        </div>
        <YesNo name="mode" label="Maintenance mode" value={s.mode} />
        <YesNo name="fmode" label="Free premium mode" value={s.fmode} />
      </Section>

      <Section title="Push notifications (OneSignal)">
        <Text name="one_key" label="OneSignal App ID" value={s.one_key} />
        <Text name="one_hash" label="OneSignal REST API Key" value={s.one_hash} />
      </Section>

      <Section title="SMS / OTP">
        <div>
          <label className="label">SMS provider</label>
          <select name="sms_type" defaultValue={s.sms_type ?? "Twilio"} className="input">
            <option value="Twilio">Twilio</option>
            <option value="Msg91">Msg91</option>
          </select>
        </div>
        <Text name="otp_auth" label="OTP auth provider" value={s.otp_auth} />
        <Text name="auth_key" label="Msg91 auth key" value={s.auth_key} />
        <Text name="otp_id" label="Msg91 OTP template id" value={s.otp_id} />
        <Text name="acc_id" label="Twilio account SID" value={s.acc_id} />
        <Text name="auth_token" label="Twilio auth token" value={s.auth_token} />
        <Text name="twilio_number" label="Twilio number" value={s.twilio_number} />
      </Section>

      <Section title="Ads (AdMob)">
        <YesNo name="admob" label="Enable AdMob" value={s.admob} />
        <div />
        <Text name="banner_id" label="Android banner id" value={s.banner_id} />
        <Text name="in_id" label="Android interstitial id" value={s.in_id} />
        <Text name="ios_banner_id" label="iOS banner id" value={s.ios_banner_id} />
        <Text name="ios_in_id" label="iOS interstitial id" value={s.ios_in_id} />
      </Section>

      <Section title="Coins & wallet">
        <Text name="coin_amt" label="Price per coin" value={s.coin_amt} />
        <Text name="coin_limit" label="Min coins to withdraw" value={s.coin_limit} />
        <Text name="scredit" label="Signup credit" value={s.scredit} />
        <YesNo name="coin_fun" label="Coin functionality" value={s.coin_fun} />
      </Section>

      <Section title="Integrations">
        <Text name="map_key" label="Google Maps API key" value={s.map_key} full />
        <Text name="agora_app_id" label="Agora App ID (calls)" value={s.agora_app_id} full />
      </Section>

      <div><SubmitButton>Save settings</SubmitButton></div>
    </form>
  );
}
