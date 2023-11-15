const core = require("@actions/core");
const github = require("@actions/github");

async function run() {

  const approvedWords = ["yes", "y", "approve"];
  const deniedWords = ["denied", "deny", "no", "n"];

  async function createIssue(octokit, title, body, approvers) {
    const issue = await octokit.request('POST /repos/{owner}/{repo}/issues', {
      ...github.context.repo,
      title: title,
      body: body,
      assignees: approvers,
    })
    return issue.number;
  }

  async function getComments(octokit, issueNumber) {
    const comments = await octokit.request(
        'GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
          ...github.context.repo,
          issue_number: issueNumber
        });
    return comments;
  }

  try {
    const secretToken = core.getInput("secret-token");
    const title = 'Approval required for workflow run : '
        + github.context.runId;
    const body = `Respond [${approvedWords.toString()}] to continue workflow or [${deniedWords.toString()}] to cancel.`;
    const approvers = core.getInput("approvers").split(",");

    const octokit = github.getOctokit(secretToken);
    const issueNumber = await createIssue(octokit, title, body, approvers);

    core.info(`create issue ${issueNumber}`);

    let approve = true;

    do {
      const comments = await getComments(octokit, issueNumber);

      if (comments.length) {

        const lastComment = comments[comments.length - 1];

        const word = lastComment.body;

        if (approvedWords.includes(word)) {
          // 승인
          approve = false;
          core.info(`approve issue ${issueNumber}`);
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