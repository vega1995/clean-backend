import { Router } from "express";

export function createPublicRoutes() {
    const router=Router();
    router.get("/", (_req, res) => {
        res.json({
            message: "Bienvenido a la API de la aplicación"
        });

    });

    return router;
}
