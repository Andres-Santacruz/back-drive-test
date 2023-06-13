-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TYPES" AS ENUM ('ROTACION_DEL_PERSONAL', 'AUSENTISMO_LABORAL', 'RETORNO_ARL', 'PARTICIPACION_LABORAL_CAPACITACIONES');

-- CreateTable
CREATE TABLE "Companies" (
    "id" SERIAL NOT NULL,
    "nameComercial" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "departament" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumberUser" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Informes" (
    "id" SERIAL NOT NULL,
    "type" "TYPES" NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "Informes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Companies_nameComercial_key" ON "Companies"("nameComercial");

-- CreateIndex
CREATE UNIQUE INDEX "Companies_nit_key" ON "Companies"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Informes" ADD CONSTRAINT "Informes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
