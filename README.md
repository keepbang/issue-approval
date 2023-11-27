# Issue Approval

1. Create a GitHub issue.
2. Wait until the approver approves, then proceed with the next workflow based on the approval status.
3. Limit approve pending time is 10 minutes.

---

## inputs
- `approvers` : Approve github user name
- `secret-token` : Auto-generated github secret token ${ secrets.GITHUB_TOKEN }


## used
```
  # wait for approval
  manual-approval:
    runs-on: ubuntu-20.04(or self-hosted)
    steps:
      - name: Wait approval
        uses: keepbang/issue-approval@v1.0.4
        with:
          secret-token: ${{ secrets.GITHUB_TOKEN }}
          approvers: ${{ env.list_of_username }}
  # wait for approval
```

