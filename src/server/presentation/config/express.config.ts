import type { Router } from "express";
import express from "express";
import { errorHandler } from "../http/error-handler.ts";

export function createExpressApp(router:Router){
    const app=express();

    app.disable("x-powered-by"); // desactivar cabecera x-powered-by
    
    app.use(router);

    app.use((_request, response)=>{
        response.status(404).json({
            error:"Ruta no encontrada"
        });

    })


    app.use(errorHandler);
    return app;
}