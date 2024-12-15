import * as core from "@actions/core";
import { env } from "./env.js";
import {
  fetchParameters,
  loadParameterFromSSM,
  parseSecrets,
} from "./utils.js";
import fs from "fs/promises";
import pLimit from "p-limit";
import { MAX_CONCURRENT_SSM_PROMISES } from "./constant.js";
import path from "path";

const main = async (): Promise<void> => {
  let envValues: [string, string][] = [];
  envValues = parseSecrets(env.SECRET, env.IS_JSON);
  const limit = pLimit(MAX_CONCURRENT_SSM_PROMISES);

  const promises = envValues.map(([k, v]) =>
    limit(async () => {
      try {
        core.debug(`Key: ${k}, Value: ${v}`);
        const p = await fetchParameters(v, {
          prefix: env.PARAMETER_PREFIX,
          withDecryption: env.WITH_DECRYPTION,
        });
        if (p) core.info(p);
        return [k, p || v] as const;
      } catch (error) {
        core.error(`Failed to fetch parameter: ${v}`);
        throw error;
      }
    }),
  );

  const result = await Promise.all(promises);
  const outputEnv = result
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  core.info(`Saving environment variables to path: ${env.ENV_FILE_PATH}`);

  await fs.writeFile(path.join(env.ENV_FILE_PATH, ".env"), outputEnv, {
    mode: "0644",
  });
  core.setOutput("env", JSON.stringify(result));
};

main().catch((error) => {
  if (error instanceof Error) {
    core.setFailed(error.message);
  }
  process.exit(1);
});
