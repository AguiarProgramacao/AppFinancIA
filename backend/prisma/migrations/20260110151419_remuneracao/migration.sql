-- DropForeignKey
ALTER TABLE IF EXISTS "Sessao" DROP CONSTRAINT IF EXISTS "Sessao_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "TwoFactorToken" DROP CONSTRAINT IF EXISTS "TwoFactorToken_usuarioId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Sessao_usuarioId_idx";

-- DropIndex
DROP INDEX IF EXISTS "TwoFactorToken_usuarioId_idx";

-- AddForeignKey
ALTER TABLE IF EXISTS "Sessao" ADD CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE IF EXISTS "TwoFactorToken" ADD CONSTRAINT "TwoFactorToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
