-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
