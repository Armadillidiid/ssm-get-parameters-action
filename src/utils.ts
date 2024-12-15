import {
  SSMClient,
  type GetParameterCommandInput,
  GetParameterCommand,
} from "@aws-sdk/client-ssm";
import { z } from "zod";
import * as core from "@actions/core";
import { parsedSecret, jsonSchema } from "./schemas.js";

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
    } else {
      const obj = z
        .record(z.string(), z.string())
        .parse(JSON.parse(jsonSchema.parse(secret) as string));
      return parsedSecret.parse(Object.entries(obj));
    }
  } catch (error) {
    if (error instanceof Error) {
      core.error(error);
    } else if (error instanceof z.ZodError) {
      core.error(error.format()._errors.toString());
    }
    core.setFailed("Failed to parse secrets");
    process.exit(1);
  }
};

export const fetchParameters = async (
  pathKey: string,
  {
    prefix,
    withDecryption,
  }: {
    prefix: string | undefined;
    withDecryption: boolean;
  },
) => {
  let parameterName;

  if (!prefix) {
    parameterName = pathKey;
  } else if (pathKey.startsWith(prefix)) {
    parameterName = pathKey.substring(prefix.length);
  } else return;

  const parameter = await loadParameterFromSSM(parameterName, withDecryption);
  if (!parameter) {
    core.setFailed(`Key with path is undefined: ${pathKey}`);
    process.exit(1);
  }
  return parameter;
};
