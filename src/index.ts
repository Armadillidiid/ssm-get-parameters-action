import path from "node:path";
import * as core from "@actions/core";
import { Effect, Either, Schedule } from "effect";
import {
	ENV_FILENAME,
	ENV_OUTPUT_KEY,
	MAX_CONCURRENT_SSM_PROMISES,
} from "./constant.js";
import { env } from "./env.js";
import type { ParsedSecret } from "./schemas.js";
import { fetchParameters, parseSecrets, saveEnvToPath } from "./utils.js";

const main = async (): Promise<void> => {
	let envValues: [string, string][] = [];
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
				if (res) core.info(p);
			}
			return [k, p || v] satisfies ParsedSecret[number];
		}),
	);

	const result = await Effect.runPromise(
		Effect.all(promises, {
			concurrency: MAX_CONCURRENT_SSM_PROMISES,
		}),
	);
	await saveEnvToPath(path.join(env.ENV_FILE_PATH, ENV_FILENAME), result);
	core.setOutput(ENV_OUTPUT_KEY, JSON.stringify(Object.fromEntries(result)));
};

main().catch((error) => {
	if (error instanceof Error) {
		core.setFailed(error.message);
	}
	process.exit(1);
});
