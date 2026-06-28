INSERT INTO "User" (id, name, email, password, role, "createdAt")
VALUES (gen_random_uuid()::text, 'Phụ huynh Demo', 'parent@school.vn', '$2b$10$qtStdnJtG.TGDpvFUNkFWO35trDcQRFneRZmAgCD.tAWji0GbAIXS', 'parent', NOW())
ON CONFLICT (email) DO NOTHING;
