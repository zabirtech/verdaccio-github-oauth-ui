import axios from 'axios';
import { logger } from "../../logger";

export class BitbucketClient {
  constructor(private readonly webBaseUrl: string, private readonly apiBaseUrl: string) {}

  async requestAccessToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
    try {
      const params = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      };

      logger.log(`[bitbucket-oauth-ui] Requesting access token with params: ${JSON.stringify(params)}`);

      const response = await axios.post(`${this.webBaseUrl}/site/oauth2/access_token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: clientId,
          password:  clientSecret,
        },
      });
      logger.log(`[bitbucket-oauth-ui] Received access token response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      logger.error(`[bitbucket-oauth-ui] Failed requesting Bitbucket access token: ${error.message}`, JSON.stringify(error.response.data));
      throw new Error("Failed requesting Bitbucket access token: " + error.message);
    }
  }

  async requestUser(accessToken: string) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed requesting Bitbucket user info: " + error.message);
    }
  }

  async requestWorkspaceMembershipStatus(token: string, workspace: string, userName: string) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/workspaces/${workspace}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.values.some((member: any) => member.username === userName);
    } catch (error) {
      logger.log(`Failed requesting Bitbucket workspace "${workspace}" membership status of user "${userName}": ${error.message}`);
      return false;
    }
  }

  async requestRepositoryCollaboratorStatus(token: string, owner: string, repo: string, userName: string) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/repositories/${owner}/${repo}/permissions-config`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.values.some((collaborator: any) => collaborator.user.username === userName);
    } catch (error) {
      logger.log(`Failed requesting Bitbucket repository "${owner}/${repo}" collaborator status of user "${userName}": ${error.message}`);
      return false;
    }
  }

  // Placeholder for requestTeamMembershipStatus
  async requestTeamMembershipStatus(token: string, org: string, team: string, userName: string) {
    logger.log(`Team membership status check not implemented for Bitbucket`);
    return false;
  }
}
