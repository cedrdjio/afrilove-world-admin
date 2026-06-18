-- ============================================================================
-- AfriLove World — seed data
-- Default super-admin + global settings + a little sample catalog data.
--
-- DEFAULT LOGIN:  admin@afrilove.world  /  admin@1234
-- !! Change this password immediately after first login (Profile page). !!
-- ============================================================================

-- Super admin (bcrypt hash of "admin@1234")
insert into public.admin_users (email, name, password_hash, role, permissions, status)
values (
  'admin@afrilove.world',
  'Super Admin',
  '$2a$10$9GIfBeCGpbJvIbQP85.Xt.qSFD7LKWClrvJyLKvouPmzct.2YGb4q',
  'admin',
  '{}'::jsonb,
  true
)
on conflict (email) do nothing;

-- Settings singleton
insert into public.settings (id, webname, currency, timezone)
values (1, 'AfriLove World', '$', 'Africa/Lagos')
on conflict (id) do nothing;

-- Sample relation goals
insert into public.relation_goals (title, subtitle, status) values
  ('Long-term partner', 'Looking for something serious', true),
  ('Friendship', 'New connections and good vibes', true),
  ('Marriage', 'Ready to settle down', true)
on conflict do nothing;

-- Sample interests
insert into public.interests (title, status) values
  ('Music', true), ('Travel', true), ('Cooking', true),
  ('Fitness', true), ('Movies', true), ('Dancing', true)
on conflict do nothing;

-- Sample languages
insert into public.languages (title, status) values
  ('English', true), ('French', true), ('Swahili', true),
  ('Yoruba', true), ('Arabic', true)
on conflict do nothing;

-- Sample religions
insert into public.religions (title, status) values
  ('Christianity', true), ('Islam', true), ('Traditional', true), ('Other', true)
on conflict do nothing;

-- Sample plans
insert into public.plans (title, amt, day_limit, description, filter_include, audio_video, direct_chat, chat, like_menu, status) values
  ('Free', 0, 3650, 'Basic access', false, false, false, true, false, true),
  ('Gold', 9.99, 30, 'Unlock chat, filters and likes', true, false, true, true, true, true),
  ('Platinum', 19.99, 30, 'Everything in Gold plus audio & video calls', true, true, true, true, true, true)
on conflict do nothing;

-- Sample coin packages
insert into public.packages (coin, amt, status) values
  (100, 0.99, true), (550, 4.99, true), (1200, 9.99, true)
on conflict do nothing;
