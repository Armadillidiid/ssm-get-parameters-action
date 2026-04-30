import { z } from "zod";
export declare const jsonSchema: z.ZodJSONSchema;
export declare const parsedSecret: z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodString], null>>;
export type ParsedSecret = z.infer<typeof parsedSecret>;
//# sourceMappingURL=schemas.d.ts.map