import { z } from "zod";

export const jsonSchema = z.json();

export const parsedSecret = z.tuple([z.string(), z.string()]).array();
export type ParsedSecret = z.infer<typeof parsedSecret>;
