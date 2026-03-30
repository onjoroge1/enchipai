-- Add EmailTemplate model
CREATE TABLE IF NOT EXISTS "email_templates" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "html" TEXT NOT NULL,
  "variables" TEXT[],
  "category" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Add EmailCampaign model
CREATE TABLE IF NOT EXISTS "email_campaigns" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "html" TEXT NOT NULL,
  "recipientType" TEXT NOT NULL,
  "recipientFilter" JSONB,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "scheduledAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "totalRecipients" INTEGER DEFAULT 0,
  "sentCount" INTEGER DEFAULT 0,
  "openedCount" INTEGER DEFAULT 0,
  "clickedCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Add EmailLog model for tracking
CREATE TABLE IF NOT EXISTS "email_logs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "to" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "templateId" TEXT,
  "campaignId" TEXT,
  "status" TEXT NOT NULL,
  "openedAt" TIMESTAMP(3),
  "clickedAt" TIMESTAMP(3),
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "email_logs_to_idx" ON "email_logs"("to");
CREATE INDEX IF NOT EXISTS "email_logs_templateId_idx" ON "email_logs"("templateId");
CREATE INDEX IF NOT EXISTS "email_logs_campaignId_idx" ON "email_logs"("campaignId");
CREATE INDEX IF NOT EXISTS "email_logs_status_idx" ON "email_logs"("status");

