import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import usuarioRoutes from "./routes/transacao.routes";
import authRoutes from "./routes/auth.routes";
import transacoesRoutes from "./routes/transacao.routes";
import categoriaRoutes from "./routes/categoria.routes";
import graficosRoutes from "./routes/graficos.routes";
import objetivosRoutes from "./routes/objetivo.routes";
import dashboardRouter from "./routes/dashboard.routes";
import securityRoutes from "./routes/security.routes";
import notificationsRoutes from "./routes/notifications.routes";
import profileRoutes from "./routes/profile.routes";
import exportRoutes from "./routes/export.routes";
import { startInsightScheduler } from "./jobs/insights.job";
import { startInatividadeScheduler } from "./jobs/inatividade.job";

const app = express();

app.use(cors());
app.use(express.json({ limit: "6mb" }));

app.use("/usuarios", usuarioRoutes);
app.use("/auth", authRoutes);
app.use("/transacoes", transacoesRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/graficos", graficosRoutes);
app.use("/objetivos", objetivosRoutes);
app.use("/dashboard", dashboardRouter);
app.use("/security", securityRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/profile", profileRoutes);
app.use("/export", exportRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});


startInsightScheduler();
startInatividadeScheduler();


