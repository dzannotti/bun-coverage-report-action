# bun-coverage-report-action

This GitHub Action reports [Bun](https://bun.sh/) test coverage results as a GitHub step-summary and as a comment on a pull request.

![Coverage Report as Step Summary](./docs/coverage-report.png)

The action generates a high-level coverage summary for all coverage categories, as well as a detailed, file-based report. The report includes links to the files themselves and the uncovered lines for easy reference.

Want to contribute? Check out the [Contributing Guidelines](./CONTRIBUTING.md).

## Usage

To use this action, you need to generate an LCOV coverage report from `bun test`. Bun generates LCOV format coverage reports by default when you enable coverage.

Run `bun test --coverage` in a step before this action. This will generate a `coverage/lcov.info` file that the action will parse.

### Example Workflow

```yml
name: 'Test'
on:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    permissions:
      # Required to checkout the code
      contents: read
      # Required to put a comment into the pull-request
      pull-requests: write

    steps:
    - uses: actions/checkout@v4
    - name: 'Setup Bun'
      uses: oven-sh/setup-bun@v1
    - name: 'Install Deps'
      run: bun install
    - name: 'Test'
      run: bun test --coverage
    - name: 'Report Coverage'
      if: always()
      uses: dzannotti/bun-coverage-report-action@v1
```

> [!NOTE]
> To enable comments on pull requests originating from forks, please refer to the configuration provided in the [Working with Pull Requests from Forks](#working-with-pull-requests-from-forks) section.

### Required Permissions

This action requires the `pull-requests: write` permission to add a comment to your pull request. If you're using the default `GITHUB_TOKEN`, ensure that you include both `pull-requests: write` and `contents: read` permissions in the job. The `contents: read` permission is necessary for the `actions/checkout` action to checkout the repository. This is particularly important for new repositories created after GitHub's [announcement](https://github.blog/changelog/2023-02-02-github-actions-updating-the-default-github_token-permissions-to-read-only/) to change the default permissions to `read-only` for all new `GITHUB_TOKEN`s.

### Options

| Option | Description | Default |
| ------ | ----------- | ------- |
| `working-directory` | The main path to search for coverage files (adjusting this is especially useful in monorepos). | `./` |
| `lcov-file` | The path to the LCOV coverage report file. | `${working-directory}/coverage/lcov.info` |
| `lcov-file-compare` | The path to the LCOV file to compare against. If given, will display a trend indicator and the difference in the summary. Respects the `working-directory` option. | undefined |
| `github-token` | A GitHub access token with permissions to write to issues (defaults to `secrets.GITHUB_TOKEN`). | `${{ github.token }}` |
| `file-coverage-mode` | Defines how file-based coverage is reported. Possible values are `all`, `changes` or `none`. | `changes` |
| `file-coverage-root-path` | The root (or absolute) part of the path used within the LCOV coverage reports to point to the covered files. You can change this if your reports were generated in a different context (e.g., a docker container) and the absolute paths don't match the current runner's workspace. Uses the runner's workspace path by default. | `${{ github.workspace }}` |
| `name` | Give the report a custom name. This is useful if you want multiple reports for different test suites within the same PR. Needs to be unique. | '' |
| `pr-number` | The number of the PR to post a comment to. When using the `push` trigger, you can set this option to "auto" to make the action automaticaly search of a PR with a matching `sha` value and comment on it. | If in the context of a PR, the number of that PR.<br/> If in the context of a triggered workflow, the PR of the triggering workflow.<br/>If no PR context is found, it defaults to `undefined` |
| `comment-on` | Specify where you want a comment to appear: "pr" for pull-request (if one can be found), "commit" for the commit in which context the action was run, or "none" for no comments. You can provide a comma-separated list of "pr" and "commit" to comment on both. | `pr` |

#### File Coverage Mode

- `changes` - show Files coverage only for project files changed in that pull request (works only with `pull_request`, `pull_request_review`, `pull_request_review_comment` actions)
- `all` - show it grouped by changed and not changed files in that pull request (works only with `pull_request`, `pull_request_review`, `pull_request_review_comment` actions)
- `none` - do not show any File coverage details (only total Summary)

#### Name

If your project includes multiple test suites and you want to consolidate their coverage reports into a single pull request comment, you must assign a unique `name` to each action step that parses a summary report. For example:

```yml
## ...
    - name: 'Report Frontend Coverage'
      if: always()
      uses: dzannotti/bun-coverage-report-action@v1
      with:
        name: 'Frontend'
        lcov-file: './coverage/lcov-frontend.info'
    - name: 'Report Backend Coverage'
      if: always()
      uses: dzannotti/bun-coverage-report-action@v1
      with:
        name: 'Backend'
        lcov-file: './coverage/lcov-backend.info'
```

### Coverage Trend Indicator

By using the `lcov-file-compare` option, the action will display both a trend indicator and the coverage difference in the summary. This feature is particularly useful for tracking changes between the main branch and a previous run.

![Screenshot of the action-result showcasing the trend indicator](./docs/coverage-report-trend-indicator.png)

The most straightforward method to obtain the comparison file within a pull request is to run the tests and generate the coverage for the target branch within a matrix job:

```yml
name: "Test"
on:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - branch: main
            artifact: main
          - branch: ${{ github.head_ref }}
            artifact: pull-request

    permissions:
      # Required to checkout the code
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ matrix.branch }}
          ## Set repository to correctly checkout from forks
          repository: ${{ github.event.pull_request.head.repo.full_name }}
      - name: "Setup Bun"
        uses: oven-sh/setup-bun@v1
      - name: "Install Deps"
        run: bun install
      - name: "Test"
        run: bun test --coverage
      - name: "Upload Coverage"
        uses: actions/upload-artifact@v4
        with:
          name: coverage-${{ matrix.artifact }}
          path: coverage

  report-coverage:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - name: "Download Coverage Artifacts"
        uses: actions/download-artifact@v4
        with:
          name: coverage-pull-request
          path: coverage
      - uses: actions/download-artifact@v4
        with:
          name: coverage-main
          path: coverage-main
      - name: "Report Coverage"
        uses: dzannotti/bun-coverage-report-action@v1
        with:
          lcov-file-compare: coverage-main/lcov.info
```

### Working with pull requests from forks

Due to security considerations, GitHub Actions does not provide workflows originating from a fork with write access to your repository, even if such permissions are configured. Consequently, this action cannot comment on these pull requests using the above-documented configuration.

For more information on why this is the case, refer to the following article:
[Preventing Pwn-Requests](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/).

However, you can circumvent this limitation by dividing your workflow into two separate workflows (see examples below):

1. **Testing Workflow**: This workflow runs tests in response to the `pull_request` trigger, within the context of the actual pull request, and uploads the coverage reports as artifacts.

2. **Reporting Workflow**: This workflow is triggered upon the completion of the **Testing Workflow** using the `workflow_runs` event. It downloads and parses the coverage report, and posts a comment on the pull request.

> [!IMPORTANT]
> The **Reporting Workflow** must reside within your default branch (as specified in [GitHub's workflow_run documentation](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_run))

This action will automatically detect:

- If it is being run within a `workflow_run` trigger
- If the triggering workflow was a pull request

It will then automatically locate the appropriate pull request to comment on.

#### Example

- **test.yml**

    ```yml
    name: "Test"
    on:
      pull_request:

    jobs:
      test:
        runs-on: ubuntu-latest

        permissions:
          contents: read

        steps:
          - uses: actions/checkout@v4
          - name: "Setup Bun"
            uses: oven-sh/setup-bun@v1
          - name: "Install Deps"
            run: bun install
          - name: "Test"
            run: bun test --coverage

          - name: "Upload Coverage"
            uses: actions/upload-artifact@v4
            with:
              name: coverage
              path: coverage
    ```

- **coverage.yml** (has to be on the default branch)

    ```yml
    name: Report Coverage

    on:
      workflow_run:
        workflows: ["Test"]
        types:
          - completed

    jobs:
      report:
        runs-on: ubuntu-latest

        permissions:
          pull-requests: write

        steps:
          - uses: actions/checkout@v4
          - uses: actions/download-artifact@v4
            with:
              github-token: ${{ secrets.GITHUB_TOKEN }}
              run-id: ${{ github.event.workflow_run.id }}
          - name: "Report Coverage"
            uses: dzannotti/bun-coverage-report-action@v1
    ```

> [!NOTE]
> This configuration also works for pull requests originating from your own repository (not forks), so it can be used generally.

> [!NOTE]
> If you see an error like: `Error: Unable to download artifact(s): Resource not accessible by integration` you may need to add the `actions: read` permission to the `coverage.yml` reporting action.

#### Limitations & Considerations

This approach has a few limitations:

- The **Reporting Workflow** is only triggered after the **Testing Workflow** completes. As a result, there will be a (most likely neglectable) delay before a comment appears on the pull request.
- To obtain the pull request number from a forked pull request, it's necessary to iterate over all pull requests in the repository using the [Pulls REST API](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#list-pull-requests) and match it by the `head_sha`. This is due to the `github` context of the triggering workflow not containing the pull request information ([see this discussion](https://github.com/orgs/community/discussions/25220)). While this is generally not an issue, it could cause delays if the repository is large and the pull request is significantly old.

## Limitations

This action reports **Lines** and **Functions** coverage only, as these are the metrics supported by Bun's LCOV output. If you need **Statements** and **Branches** coverage, consider using the original [vitest-coverage-report-action](https://github.com/davelosert/vitest-coverage-report-action).

Additionally, coverage thresholds are not supported in this fork. The action will report coverage but won't fail based on threshold values.
