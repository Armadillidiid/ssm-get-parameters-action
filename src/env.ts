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

let envFilePath = "";
try {
	envFilePath = getEnvFilePath();
} catch (error) {
	if (error instanceof Error) {
		core.error(`Validation failed: ${error.message}`);
	} else {
		core.error(`Validation failed: ${String(error)}`);
	}
	throw error;
}

export const env = {
	SECRET: secret,
	WITH_DECRYPTION: withDecryption,
	PARAMETER_PREFIX: prefix,
	ENV_FILE_PATH: envFilePath,
	IS_JSON: isJSON,
	BY_PATH: byPath,
	TRANSFORM_KEYS: transformKeys,
	RECURSIVE: recursive,
};

function getEnvFilePath(): string {
	const envFilePathInput: string = getInput("env-file-path");
	const resolvedPath: string = path.resolve(envFilePathInput);

	// Validate if the path exists
	if (!fs.existsSync(resolvedPath)) {
		throw new Error(`The specified path does not exist: ${resolvedPath}`);
	}

	// Check if it's a directory
	const stats = fs.statSync(resolvedPath);
	if (!stats.isDirectory()) {
		throw new Error(`The specified path is not a directory: ${resolvedPath}`);
	}

	return resolvedPath;
}
