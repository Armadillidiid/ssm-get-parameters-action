import { z } from "zod";
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | {
    [key: string]: Json;
} | Json[];
declare const literalSchema: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
export declare const jsonSchema: z.ZodType<Json>;
export {};
//# sourceMappingURL=json.d.ts.map