import { z } from "zod";
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | {
    [key: string]: Json;
} | Json[];
declare const literalSchema: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
export declare const jsonSchema: z.ZodType<Json>;
export declare const parsedSecret: z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodString], null>, "many">;
export {};
//# sourceMappingURL=schemas.d.ts.map