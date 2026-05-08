-- CreateEnum
CREATE TYPE "public"."ContestantGroup" AS ENUM ('CREW', 'INVITED');

-- CreateEnum
CREATE TYPE "public"."VoteChoice" AS ENUM ('YELLOW', 'PURPLE');

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contestant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "group" "public"."ContestantGroup" NOT NULL,
    "eventId" INTEGER NOT NULL,
    "seed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contestant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Battle" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "group" "public"."ContestantGroup" NOT NULL,
    "round" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "votingOpen" BOOLEAN NOT NULL DEFAULT false,
    "yellowVotes" INTEGER NOT NULL DEFAULT 0,
    "purpleVotes" INTEGER NOT NULL DEFAULT 0,
    "yellowContestantId" INTEGER,
    "purpleContestantId" INTEGER,
    "winnerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoteSession" (
    "id" SERIAL NOT NULL,
    "battleId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "votedFor" "public"."VoteChoice" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoteSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contestant_eventId_group_idx" ON "public"."Contestant"("eventId", "group");

-- CreateIndex
CREATE UNIQUE INDEX "Contestant_eventId_group_seed_key" ON "public"."Contestant"("eventId", "group", "seed");

-- CreateIndex
CREATE INDEX "Battle_eventId_group_idx" ON "public"."Battle"("eventId", "group");

-- CreateIndex
CREATE UNIQUE INDEX "Battle_eventId_group_round_position_key" ON "public"."Battle"("eventId", "group", "round", "position");

-- CreateIndex
CREATE UNIQUE INDEX "VoteSession_battleId_userId_key" ON "public"."VoteSession"("battleId", "userId");

-- AddForeignKey
ALTER TABLE "public"."Contestant" ADD CONSTRAINT "Contestant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Battle" ADD CONSTRAINT "Battle_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Battle" ADD CONSTRAINT "Battle_yellowContestantId_fkey" FOREIGN KEY ("yellowContestantId") REFERENCES "public"."Contestant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Battle" ADD CONSTRAINT "Battle_purpleContestantId_fkey" FOREIGN KEY ("purpleContestantId") REFERENCES "public"."Contestant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Battle" ADD CONSTRAINT "Battle_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "public"."Contestant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoteSession" ADD CONSTRAINT "VoteSession_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "public"."Battle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
