-- CreateTable
CREATE TABLE "Account" (
    "id" BIGINT NOT NULL,
    "username" TEXT,
    "firstname" TEXT,
    "lastname" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" SERIAL NOT NULL,
    "port" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "database" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
