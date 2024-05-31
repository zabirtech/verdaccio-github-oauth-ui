# Verdaccio Bitbucket OAuth UI

This project is a fork from [verdaccio-github-oauth-ui](https://github.com/n4bb12/verdaccio-github-oauth-ui) where we have modified the code to use Bitbucket OAuth tokens instead of GitHub.

## Overview

We have successfully implemented logging in with Bitbucket accounts, and the system correctly receives our credentials. However, there are some issues with external dummy accounts being able to access it. This issue seems to be rooted in the OAuth consumer setup.

We have created a repository token on our npm repository under the project `npm-tests` to access a specific repository. This token needs to be configured with the correct scopes during the OAuth consumer setup.

## Versions and Changes

We have several versions of our plugin, each attempting different fixes:

1. **Original Version**: `verdaccio-bitbucket-oauth-ui-ORIGINAL.tgz`
    - This is the unmodified code that works with the standard access token. It mirrors the code in our Bitbucket and GitHub forks.

2. **AuthV6 Final**: `verdaccio-bitbucket-oauth-ui-authV6final.tgz`
    - In this version, we tried adding a `repositoryToken` to the code and `config.yaml`. Despite this, it did not work, indicating a need for a different setup in the OAuth consumer.

3. **Workspace 5**: `verdaccio-bitbucket-oauth-ui-workspace5.tgz`
    - Here, we attempted to restrict access to members of a specific workspace. Although we received appropriate errors (403, 401, 404), it did not function correctly as users not in the workspace could still access it.

4. **Scope Allowed Groups 10 Access 3**: `verdaccio-bitbucket-oauth-ui-scopeAllowedGroups10_access3.tgz`
    - This version attempted to limit access to specific groups with the correct scope. It was unsuccessful, likely due to incorrect OAuth consumer setup.

## Recommendations

- **AuthV6 Final**: I recommend focusing on `verdaccio-bitbucket-oauth-ui-authV6final.tgz`. This version has a more structured codebase with proper types and interfaces.

## Useful Information

- If you encounter access issues, clearing your browser's cache, session, and cookies can help resolve token problems.
- Use the following command to build and pack the project:
  ```json
  "build:all": "yarn clean && yarn install && yarn build && yarn pack"
  
- Which will help to pack the project and then moving it to server you can use this: "scp package.tgz admin@verdaccio-poc.stefna.is:/home/admin/verdaccio-bitbucket-oauth-ui.tgz"
- Then, in the /home/admin folder, you need to be logged in as user verdaccio. 
- To achieve that, run sudo -i, then you are root, and after that, run su - verdaccio, which has access to npm and yarn. 
- Once you are logged in as the verdaccio user, in that folder, you need to run this command to install the package globally: npm install -g verdaccio-bitbucket-oauth-ui.tgz




Of course you can always ping me on slack on anything . Hopefully if you solve this without having to make any special work around.
Then I can update the my original repo on github so we can help others who use bitbucket with this open-source plugin.

## Here are some valuable links!
[Bitbucket Oauth2](https://developer.atlassian.com/cloud/bitbucket/oauth-2/)

[My original repo](https://github.com/zabirtech/verdaccio-github-oauth-ui)

[The repo we forked from](https://github.com/n4bb12/verdaccio-github-oauth-ui)

[Rest api docs for deprecated endpoints](https://developer.atlassian.com/cloud/bitbucket/bitbucket-api-teams-deprecation/)

[Bitbucket rest api endpoints docs](https://developer.atlassian.com/cloud/bitbucket/rest/intro/#authentication)

This one is also good github repo although it is for gitlab it has some nice parts that we can take from it!
[A gitlab verdaccio plugin](https://github.com/pfdgithub/verdaccio-auth-gitlab/tree/master)

