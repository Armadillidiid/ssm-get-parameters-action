import { z } from "zod";

type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);

export const parsedSecret = z.tuple([z.string(), z.string()]).array();
export type ParsedSecret = z.infer<typeof parsedSecret>;
