# ssm-get-parameters-action

## Overview

`ssm-get-parameters-action` is a GitHub Action that fetches parameters from AWS Systems Manager (SSM) Parameter Store and exports them as environment variables. It supports two modes:

- **Individual mode** (default): Map explicit environment variable names to SSM parameter paths.
- **Path-based mode** (`by-path: true`): Fetch all parameters recursively under an SSM path. Keys are derived from the last path segment.

Both modes support optional key transformation to UPPER_SNAKE_CASE. All fetched values are auto-masked in logs via `setSecret` and available as individual step outputs.

## Usage

To use this action in your workflow, add the following step to your `.github/workflows/ci.yaml` file:

```yaml
jobs:
  deploy:
    name: GitHub Actions Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up AWS CLI
        run: |
          sudo apt-get update
          sudo apt-get install -y awscli

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Get SSM Parameters - Key Value Pairs
        uses: Armadillidiid/ssm-get-parameters-action@v1
        with:
          secret: |
            AUTH_JWT_PUBLIC_KEY=/my-app/prod/auth-jwt-public-key
            AUTH_JWT_PRIVATE_KEY=/my-app/prod/auth-jwt-private-key
          with-decryption: true

      # - name: Get SSM Parameters - JSON
      #   uses: Armadillidiid/ssm-get-parameters-action@v1
      #   with:
      #     secret: "{\"AUTH_JWT_PUBLIC_KEY_SSM\":\"/my-app/prod/auth-jwt-public-key\"}"
      #     with-decryption: true
      #     is-json: true

      - name: Get SSM Parameters - Path Based (recursive)
        uses: Armadillidiid/ssm-get-parameters-action@v1
        with:
          by-path: true
          secret: /my-app/prod
          with-decryption: true

      - name: Get SSM Parameters - With UPPER_SNAKE_CASE keys
        uses: Armadillidiid/ssm-get-parameters-action@v1
        with:
          secret: |
            AUTH_JWT_PUBLIC_KEY=/my-app/prod/auth-jwt-public-key
          with-decryption: true
          transform-keys: true
```

## Inputs

| Name               | Description                                                                                                                                          | Required | Default |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `secret`           | In individual mode: a mapping of env var names to SSM parameter paths (key=value or JSON). In path-based mode: a single SSM path to enumerate.       | true     |         |
| `with-decryption`  | If set to true, retrieves decrypted values for secure string parameters.                                                                             | false    | `false` |
| `parameter-prefix` | An optional prefix to filter SSM parameter names. Only parameters matching this prefix will be fetched. Ignored in path-based mode.                  | false    | ""      |
| `env-file-path`    | The directory path where the .env file will be saved. If not provided, no .env file is created.                                                          | false    | ""     |
| `is-json`          | Indicates whether the provided secret is in JSON format. Set to true if the secret is a JSON object. Ignored in path-based mode.                     | false    | false   |
| `by-path`          | When set to true, the `secret` input is treated as a single SSM path. All parameters under that path are fetched recursively.                        | false    | `false` |
| `transform-keys`   | When set to true, converts all environment variable keys to UPPER_SNAKE_CASE. Applies in both individual and path-based modes.                       | false    | `false` |
| `recursive`        | When `by-path` is true, controls whether to recursively fetch parameters from sub-paths. Maps to the `Recursive` parameter of `GetParametersByPath`. | false    | `true`  |

## Outputs

Each SSM parameter is available as an individual step output at `${{ steps.<step-id>.outputs.<KEY> }}`. Values are automatically masked in workflow logs.

Example:
```yaml
- name: Read SSM params
  id: ssm
  uses: Armadillidiid/ssm-get-parameters-action@v1
  with:
    secret: /my-app/prod
    by-path: true
    transform-keys: true

- name: Use a param
  run: echo "${{ steps.ssm.outputs.ECR_REPOSITORY_URI }}"
```
