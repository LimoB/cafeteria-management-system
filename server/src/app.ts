import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import pc from "picocolors";
import path from "path";
import { fileURLToPath } from "url";

// --- Module Imports (Omit .js extensions for TS) ---
import authRouter from "./modules/auth/auth.route";
import userRouter from "./modules/user/user.route";
import menuRouter from "./modules/menu/menu.route";
import orderRouter from "./modules/order/order.route";
import customOrderRouter from "./modules/customOrder/customOrder.route";
import locationRouter from "./modules/location/location.route";
import adminRouter from "./modules/admin/admin.route";
import paymentRouter from "./modules/payment/payment.route";

const app: Application = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Global Middleware ---
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); 

// Optimized CORS Configuration
const allowedOrigins = [
    process.env.CLIENT_HOST,
    "http://localhost:5173", 
    "http://localhost:3000",
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// --- Root Route ---
app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ 
        success: true, 
        message: "Laikipia Canteen API (TypeScript) is Operational" 
    });
});

// --- API Routes ---
app.use("/api/auth", authRouter);          
app.use("/api/users", userRouter);        
app.use("/api/menu", menuRouter);          
app.use("/api/orders", orderRouter);        
app.use("/api/custom-orders", customOrderRouter);  
app.use("/api/locations", locationRouter);  
app.use("/api/admin", adminRouter);        
app.use("/api/payments", paymentRouter);  

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- 404 Handler ---
app.use((req: Request, res: Response) => {
    res.status(404).json({ 
        success: false, 
        message: `Route ${req.originalUrl} not found` 
    });
});

// --- Interface for Custom Errors ---
interface CustomError extends Error {
    statusCode?: number;
    status?: number;
}

// --- Global Error Handler ---
app.use((err: CustomError, _req: Request, res: Response, _next: NextFunction) => {
    console.error(pc.bgRed(pc.black(" [SERVER ERROR] ")), pc.red(err.stack || err.message));
    
    const statusCode = err.statusCode || err.status || 500;
    
    res.status(statusCode).json({ 
        success: false, 
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;