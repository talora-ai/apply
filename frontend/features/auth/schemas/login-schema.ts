import {z} from 'zod';

export const loginSchema = z.object({
    email: z.
            string().
            trim().
            pipe(z.email("Informe um e-mail válido.")),

    password: z.
                string().
                trim().
                min(8, "A senha deve conter no mínimo 8 caracteres.").
                max(32, "A senha deve ter no máximo 32 caracteres."),
                
    remember: z.boolean()
});