import path from "node:path";
import * as core from "@actions/core";
import { Effect, Either, Schedule } from "effect";
import { ENV_FILENAME, MAX_CONCURRENT_SSM_PROMISES } from "./constant.js";
import { env, getEnvFilePath } from "./env.js";
import type { ParsedSecret } from "./schemas.js";
import {
	fetchParameters,
	findDuplicateKeys,
	loadParametersByPath,
	extractKeyFromPath,
	parseSecrets,
	saveEnvToPath,
	transformToUpperSnakeCase,
} from "./utils.js";

const main = async (): Promise<void> => {
	let envFilePath: string;
	try {
		envFilePath = getEnvFilePath();
	} catch (error) {
		if (error instanceof Error) {
			core.setFailed(error.message);
		}
		process.exit(1);
	}

	let envValues: [string, string][] = [];

	if (env.BY_PATH) {
		core.info(`Fetching parameters by path: ${env.SECRET}`);
		const res = await Effect.runPromise(
			Effect.either(
				Effect.retry(
					Effect.tryPromise(() =>
						loadParametersByPath(
							env.SECRET,
							env.WITH_DECRYPTION,
							env.RECURSIVE,
						),
					),
					Schedule.addDelay(Schedule.recurs(3), () => 1000),
				),
			),
		);

		if (Either.isLeft(res)) {
			const err = res.left;
			if (err instanceof Error) {
				core.error(err.message);
			}
			core.setFailed(`Failed to fetch parameters by path: ${env.SECRET}`);
			process.exit();
		}

		const params = res.right;
		if (params.length === 0) {
			core.setFailed(`No parameters found at path: ${env.SECRET}`);
			process.exit();
		}

		envValues = params.map((p) => [extractKeyFromPath(p.Name), p.Value]);
	} else {
		envValues = parseSecrets(env.SECRET, env.IS_JSON);
		const promises = envValues.map(([k, v]) =>
			Effect.tryPromise(async () => {
				core.debug(`Key: ${k}, Value: ${v}`);
				const res = await Effect.runPromise(
					Effect.either(
						Effect.retry(
							fetchParameters(v, {
								prefix: env.PARAMETER_PREFIX,
								withDecryption: env.WITH_DECRYPTION,
							}),
							Schedule.addDelay(Schedule.recurs(3), () => 1000),
						),
					),
				);

				if (Either.isLeft(res)) {
					const err = res.left;
					if (err instanceof Error) {
						core.error(err.message);
					}
					core.setFailed(`Failed to fetch parameter: ${v}`);
					process.exit();
				}

				const p = res.right;
				if (p) {
					core.info(`Resolved parameter for key: ${k}`);
				}
				return [k, p || v] satisfies ParsedSecret[number];
			}),
		);

		envValues = await Effect.runPromise(
			Effect.all(promises, {
				concurrency: MAX_CONCURRENT_SSM_PROMISES,
			}),
		);
	}

	if (env.TRANSFORM_KEYS) {
		envValues = envValues.map(([k, v]) => [transformToUpperSnakeCase(k), v]);
	}

	const duplicates = findDuplicateKeys(envValues);
	if (duplicates.length > 0) {
		for (const key of duplicates) {
			core.error(`Duplicate key detected: ${key}`);
		}
		core.setFailed(
			"Duplicate keys detected. All duplicates have been reported above.",
		);
		process.exit();
	}

	if (envFilePath) {
		await saveEnvToPath(path.join(envFilePath, ENV_FILENAME), envValues);
	}

	for (const [key, value] of envValues) {
		core.setSecret(value);
		core.setOutput(key, value);
	}
};

main().catch((error) => {
	if (error instanceof Error) {
		core.setFailed(error.message);
	}
	process.exit(1);
});
