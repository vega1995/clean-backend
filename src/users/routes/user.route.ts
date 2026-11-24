import { json, Router } from "express";
import { requireJson } from "../../server/presentation/http/require-json.ts";
import { validateBody } from "../../server/presentation/http/validate-body.ts";
import { registerUserSchema } from "../presentation/schemas/register-user.schema.ts";
import type { RegisterUserController } from "../presentation/controllers/register-user-controller.ts";
import type { FindUserController } from "../presentation/controllers/find-user-controller.ts";
import { findUserSchema } from "../presentation/schemas/find-user.schema.ts";

export function createUsersRouter(registerUserController: RegisterUserController, FindUserController: FindUserController) {

    const router=Router();
    
    router.post("/", 
        requireJson,
        json(({limit: "64kb"})),
        validateBody(registerUserSchema),
        async(request, response) => {
            const body=request.body;
            const user=await registerUserController.handle(body);

            response.status(201).json(user);
        });

    router.get("/:email",       
        async (request, response) => {
        const email=request.params.email;
        const user=await FindUserController.handle(email);
        

          response.status(200).json(user);


    });




    router.all("/",(_request, response)=>{
        response.set("Allow", "POST")
        .status(405)//metodo no permitido
        .json({
            message: "Método no permitido"
        });

    })

    return router;
}
