-- ============================================================================
-- Storage bucket for admin-uploaded media (gift/interest/language images,
-- logos, payout proofs, ...).
--
-- The bucket is PUBLIC: objects are served via their public URL with no policy
-- required. Writes happen exclusively server-side with the service-role key.
-- We intentionally do NOT add a public SELECT policy on storage.objects — that
-- would let anonymous clients LIST every file in the bucket (security lint
-- 0025); public URL reads do not need it.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
