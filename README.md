# ssm-get-parameters-action

## Overview

`ssm-get-parameters-action` is a GitHub Action that fetches parameters from AWS Systems Manager (SSM) Parameter Store and exports them as environment variables. It supports optional filtering based on a specified prefix and can handle secrets in JSON format.

## Usage

To use this action in your workflow, add the following step to your `.github/workflows/ci.yaml` file:

```yaml
jobs:
  test-action:
    name: GitHub Actions Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          path: "ssm-get-parameters-action"

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

      - name: Get SSM Parameters
        uses: ./ssm-get-parameters-action
        with:
          secret: |
            AUTH_JWT_PUBLIC_KEY=/my-app/prod/auth-jwt-public-key
            AUTH_JWT_PRIVATE_KEY=/my-app/prod/auth-jwt-private-key
          with-decryption: true

      # - name: Get SSM Parameters With JSON Secrets
      #   uses: ./ssm-get-parameters-action
      #   with:
      #     secret: ${{ secrets.SSM_SECRET }}
      #     with-decryption: true
      #     is-json: true
```

## Inputs

| Name              | Description                                                                 | Required | Default |
|-------------------|-----------------------------------------------------------------------------|----------|---------|
| `secret`          | A mapping of environment variable names to their corresponding AWS SSM parameter paths. This can be provided as a JSON object or as key-value pairs. | true     |         |
| `with-decryption` | If set to true, retrieves decrypted values for secure string parameters.     | false    | `false` |
| `parameter-prefix`| An optional prefix to filter SSM parameter names. Only parameters matching this prefix will be fetched. | false    | ""         |
| `env-file-path`   | The file path where the environment variables will be saved. Defaults to `./` | false    | `./`    |
| `is-json`         | Indicates whether the provided secret is in JSON format. Set to true if the secret is a JSON object. | false    | false        |

## Outputs

| Name  | Description |
|-------|-------------|
| `env` | JSON string of the fetched environment variables. |
