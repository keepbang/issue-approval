const core = require("@actions/core");
const github = require("@actions/github");

async function run() {

  const approvedWords = ["yes", "y", "approve"];
  const deniedWords = ["denied", "deny", "no", "n"];

  try {
    const secretToken = core.getInput("secret-token");
    const title = 'Approval required for workflow run : '
        + github.context.runId;
    const body = `Respond [${approvedWords.toString()}] to continue workflow or [[${deniedWords.toString()}]] to cancel.`;
    const approvers = core.getInput("approvers").split(",");

    const octokit = github.getOctokit(secretToken);

    const issue = await octokit.request('POST /repos/{owner}/{repo}/issues', {
      ...github.context.repo,
      title: title,
      body: body,
      assignees: approvers,
    })

    core.info(`create issue ${issue.number}`);

    let approve = true;

    do {
      const comments = await octokit.request(
          'GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
            ...github.context.repo,
            issue_number: issue.number
          });

      if (comments.length) {

        const lastComment = comments[comments.length - 1];

        const word = lastComment.body;

        if (approvedWords.includes(word)) {
          // 승인
          approve = false;
          core.info(`approve issue ${issue.number}`);
        } else if (deniedWords.includes(word)) {
          // 거부
          approve = false;
          core.setFailed("denied workflow");
        }

      }


    } while (approve)

    core.setOutput("issue", JSON.stringify(issue.data));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();