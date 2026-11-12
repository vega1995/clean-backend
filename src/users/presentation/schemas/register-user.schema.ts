import z from "zod";

export const registerUserSchema = z.object({
    name: z.string({error:'name debe ser texto'}).min(1, { message: "Name is required" }),
    email: z.string({error:'email debe ser texto'}),
},
{error:"El cuerpo debe ser un JSON válido"});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;