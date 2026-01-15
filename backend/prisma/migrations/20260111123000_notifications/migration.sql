-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "notificacoesPushObjetivos" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Usuario" ADD COLUMN "notificacoesPushTransacoes" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Usuario" ADD COLUMN "notificacoesEmailGerais" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Usuario" ADD COLUMN "notificacoesEmailRelatorio" BOOLEAN NOT NULL DEFAULT true;
