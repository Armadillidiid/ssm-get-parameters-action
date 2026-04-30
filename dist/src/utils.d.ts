import { Effect } from "effect";
import { type ParsedSecret } from "./schemas.js";
export declare const loadParameterFromSSM: (name: string, WithDecryption: boolean) => Promise<string | undefined>;
export declare const parseSecrets: (secret: string, isJSON: boolean) => [string, string][];
export declare const fetchParameters: (pathKey: string, { prefix, withDecryption, }: {
    prefix: string | undefined;
    withDecryption: boolean;
}) => Effect.Effect<string | undefined, import("effect/Cause").UnknownException, never>;
export declare const loadParametersByPath: (path: string, withDecryption: boolean, recursive: boolean) => Promise<{
    Name: string;
    Value: string;
}[]>;
export declare const extractKeyFromPath: (fullName: string) => string;
export declare const transformToUpperSnakeCase: (key: string) => string;
export declare const findDuplicateKeys: (entries: [string, string][]) => string[];
export declare const saveEnvToPath: (path: string, result: ParsedSecret) => Promise<void>;
//# sourceMappingURL=utils.d.ts.map