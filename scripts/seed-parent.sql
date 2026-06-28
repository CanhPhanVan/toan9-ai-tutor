-- Generate student codes for students that don't have one yet
-- We'll use ROW_NUMBER to assign sequential codes
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
  FROM "User"
  WHERE role = 'student' AND "studentCode" IS NULL
)
UPDATE "User" u
SET "studentCode" = 'HS9-' || LPAD(n.rn::text, 4, '0')
FROM numbered n
WHERE u.id = n.id;
