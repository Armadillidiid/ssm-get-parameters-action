export declare const loadParameterFromSSM: (name: string, WithDecryption: boolean) => Promise<string | undefined>;
export declare const parseSecrets: (secret: string, isJSON: boolean) => [string, string][];
export declare const fetchParameters: (pathKey: string, { prefix, withDecryption, }: {
    prefix: string | undefined;
    withDecryption: boolean;
}) => Promise<string | undefined>;
//# sourceMappingURL=utils.d.ts.map