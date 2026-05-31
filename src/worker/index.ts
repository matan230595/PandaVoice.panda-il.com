import { Hono } from "hono";
import { cors } from "hono/cors";
import aiRoutes from "@/api/ai";
import translateRoutes from "@/api/translate";
import recordingsRoutes from "@/api/recordings";
import authRoutes from "@/api/auth";

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors({
  origin: ["https://pandavoice.panda-il.com", "http://localhost:5173"],
  credentials: true,
}));

app.route('/api', authRoutes);
app.route('/api', aiRoutes);
app.route('/api', translateRoutes);
app.route('/api/recordings', recordingsRoutes);

export default app;
