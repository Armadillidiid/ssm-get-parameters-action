import fs from "node:fs";
import path from "node:path";
import * as core from "@actions/core";

// Importing the necessary functions
const getInput = core.getInput;
const getBooleanInput = core.getBooleanInput;

const secret: string = getInput("secret", { required: true });
const withDecryption: boolean = getBooleanInput("with-decryption");
const prefix: string | undefined = getInput("parameter-prefix").length
	? getInput("parameter-prefix")
	: undefined;
const isJSON: boolean = getBooleanInput("is-json");
const byPath: boolean = getBooleanInput("by-path");
const transformKeys: boolean = getBooleanInput("transform-keys");
const recursive: boolean = getBooleanInput("recursive");

export const env = {
	SECRET: secret,
	WITH_DECRYPTION: withDecryption,
	PARAMETER_PREFIX: prefix,
	IS_JSON: isJSON,
	BY_PATH: byPath,
	TRANSFORM_KEYS: transformKeys,
	RECURSIVE: recursive,
};

export function getEnvFilePath(): string {
	const envFilePathInput: string = getInput("env-file-path");
	if (!envFilePathInput) {
		return "";
	}

	const resolvedPath: string = path.resolve(envFilePathInput);

	if (!fs.existsSync(resolvedPath)) {
		throw new Error(`The specified path does not exist: ${resolvedPath}`);
	}

	const stats = fs.statSync(resolvedPath);
	if (!stats.isDirectory()) {
		throw new Error(`The specified path is not a directory: ${resolvedPath}`);
	}

	return resolvedPath;
}
