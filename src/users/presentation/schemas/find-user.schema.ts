import z from "zod";

export const findUserSchema = {
    email: z.string({error:'email debe ser texto'})
}

export type FindUserInput = z.infer<typeof findUserSchema>;