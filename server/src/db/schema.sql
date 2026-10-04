-- AskMe schema (idempotent: safe to run on every boot)
CREATE TABLE IF NOT EXISTS creations (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     TEXT        NOT NULL,                 -- Clerk user id
  prompt      TEXT        NOT NULL,
  content     TEXT        NOT NULL,                 -- markdown text OR image URL
  type        TEXT        NOT NULL CHECK (type IN ('article', 'blog-title', 'image', 'resume-review')),
  publish     BOOLEAN     NOT NULL DEFAULT FALSE,   -- shown in Community when true
  likes       TEXT[]      NOT NULL DEFAULT '{}',    -- Clerk user ids who liked it
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creations_user_created ON creations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creations_published    ON creations (created_at DESC) WHERE publish = TRUE;
