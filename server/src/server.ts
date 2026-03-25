import 'dotenv/config';
import app from "./app"; // Omit .js for TypeScript
import pc from "picocolors";

const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, () => {
    console.log(pc.green(`🚀 Server running on http://localhost:${PORT}`));
    console.log(pc.cyan(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`));
});

// Optional: Handle unhandled rejections (good for production)
process.on("unhandledRejection", (err: Error) => {
    console.error(pc.red(`Shutting down due to unhandled promise rejection: ${err.message}`));
    server.close(() => process.exit(1));
});