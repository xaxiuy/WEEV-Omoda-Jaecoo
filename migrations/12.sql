
-- Post reports table
CREATE TABLE post_reports (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_post_reports_post_id ON post_reports(post_id);
CREATE INDEX idx_post_reports_user_id ON post_reports(user_id);
CREATE INDEX idx_post_reports_status ON post_reports(status);
