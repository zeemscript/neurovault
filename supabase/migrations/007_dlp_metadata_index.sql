-- Index for querying DLP-flagged activity events efficiently
-- Enables queries like: WHERE metadata @> '{"dlp": {"flagged": true}}'
CREATE INDEX idx_activity_dlp_flagged
  ON activity_events USING GIN (metadata jsonb_path_ops);
