DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'Sessao'
  ) THEN
    ALTER TABLE "Sessao" DROP CONSTRAINT IF EXISTS "Sessao_usuarioId_fkey";
    DROP INDEX IF EXISTS "Sessao_usuarioId_idx";
    ALTER TABLE "Sessao"
      ADD CONSTRAINT "Sessao_usuarioId_fkey"
      FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'TwoFactorToken'
  ) THEN
    ALTER TABLE "TwoFactorToken" DROP CONSTRAINT IF EXISTS "TwoFactorToken_usuarioId_fkey";
    DROP INDEX IF EXISTS "TwoFactorToken_usuarioId_idx";
    ALTER TABLE "TwoFactorToken"
      ADD CONSTRAINT "TwoFactorToken_usuarioId_fkey"
      FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
