import fs from "node:fs/promises";
import * as core from "@actions/core";
import {
	GetParameterCommand,
	type GetParameterCommandInput,
	SSMClient,
} from "@aws-sdk/client-ssm";
import { Effect } from "effect";
import { z } from "zod";
import { type ParsedSecret, jsonSchema, parsedSecret } from "./schemas.js";

export const loadParameterFromSSM = async (
	name: string,
	WithDecryption: boolean,
) => {
	const ssm = new SSMClient({});
	const input: GetParameterCommandInput = {
		Name: name,
		WithDecryption,
	};
	const command: GetParameterCommand = new GetParameterCommand(input);
	const result = await ssm.send(command);
	return result.Parameter?.Value;
};

export const parseSecrets = (
	secret: string,
	isJSON: boolean,
): [string, string][] => {
	try {
		if (!isJSON) {
			const value = z
				.string()
				.parse(secret)
				.split("\n")
				.map((line) => line.split("="))
				.map((pair) => pair.map((part) => part.trim()));
			return parsedSecret.parse(value);
		}
		const obj = z
			.record(z.string(), z.string())
			.parse(JSON.parse(jsonSchema.parse(secret) as string));
		return parsedSecret.parse(Object.entries(obj));
	} catch (error) {
		if (error instanceof Error) {
			core.error(error);
		} else if (error instanceof z.ZodError) {
			core.error(error.format()._errors.toString());
		}
		core.setFailed("Failed to parse secrets");
		process.exit();
	}
};

export const fetchParameters = (
	pathKey: string,
	{
		prefix,
		withDecryption,
	}: {
		prefix: string | undefined;
		withDecryption: boolean;
	},
) => {
	return Effect.tryPromise(async () => {
		let parameterName: string;

		if (!prefix) {
			parameterName = pathKey;
		} else if (pathKey.startsWith(prefix)) {
			parameterName = pathKey.substring(prefix.length);
		} else {
			return;
		}

		const parameter = await loadParameterFromSSM(parameterName, withDecryption);
		if (!parameter) {
			core.setFailed(`Key with path is undefined: ${pathKey}`);
			process.exit();
		}
		return parameter;
	});
};

export const saveEnvToPath = async (path: string, result: ParsedSecret) => {
	core.info(`Saving environment variable: ${path}`);
	const outputEnv = result.map(([key, value]) => `${key}=${value}`).join("\n");
	await fs.writeFile(path, outputEnv, {
		mode: "0644",
	});
};
