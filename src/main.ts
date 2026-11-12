import { createApp } from "./app.composition.ts";

const port=Number(process.env.PORT ?? 3000) ;

//TODO: Crear la app de Express
    const server=createApp().listen(port,()=>{
        console.log(`Servidor escuchando en el puerto ${port}`);
    })

    server.on("error",(error)=>{
        console.error("No se pudo inicar el API:",error.message);
        process.exitCode=1;
    });

//TODO: Manejador de errores