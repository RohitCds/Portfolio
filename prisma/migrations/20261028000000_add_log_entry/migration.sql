-- CreateTable
CREATE TABLE "LogEntry" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'deep-dive',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "body" TEXT NOT NULL,
    "sourceTitle" TEXT,
    "sourceUrl" TEXT,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LogEntry_number_key" ON "LogEntry"("number");

-- CreateIndex
CREATE UNIQUE INDEX "LogEntry_slug_key" ON "LogEntry"("slug");

