-- DropForeignKey
ALTER TABLE "Sessao" DROP CONSTRAINT "Sessao_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "TwoFactorToken" DROP CONSTRAINT "TwoFactorToken_usuarioId_fkey";

-- DropIndex
DROP INDEX "Sessao_usuarioId_idx";

-- DropIndex
DROP INDEX "TwoFactorToken_usuarioId_idx";

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactorToken" ADD CONSTRAINT "TwoFactorToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
