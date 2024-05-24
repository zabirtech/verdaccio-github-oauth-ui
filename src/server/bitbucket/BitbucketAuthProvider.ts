import { Request } from "express";
import uniq from "lodash/uniq";
import { stringify } from "querystring";
import { AuthProvider } from "../plugin/AuthProvider";
import { ParsedOrg, ParsedPluginConfig, ParsedRepo, ParsedTeam } from "../plugin/Config";
import { BitbucketClient } from "./BitbucketClient";
import { publicBitBucketApiOrigin, publicBitBucketOrigin } from "../../constants";

export class BitbucketAuthProvider implements AuthProvider {
  private readonly id = "bitbucket";

  private readonly webBaseUrl = this.config.enterpriseOrigin || publicBitBucketOrigin;
  private readonly apiBaseUrl = this.config.enterpriseOrigin
    ? this.config.enterpriseOrigin.replace(/\/?$/, "") + "/api/2.0"
    : publicBitBucketApiOrigin;

  private readonly client = new BitbucketClient(this.webBaseUrl, this.apiBaseUrl);

  constructor(private readonly config: ParsedPluginConfig) {}

  getId() {
    return this.id;
  }

  getLoginUrl(callbackUrl: string) {
    const state = this.generateState();
    const queryParams = this.buildQueryParams({
      client_id: this.config.clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      state: state,
    });
    return this.buildUrl(queryParams);
  }

  getCode(req: Request) {
    return req.query.code as string;
  }

  async getToken(code: string) {
    const response = await this.client.requestAccessToken(
      code,
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );
    return response.access_token;
  }

  async getUserName(token: string) {
    const response = await this.client.requestUser(token);
    return response.username;
  }

  async getGroups(userName: string) {
    const configuredUser = this.config.parsedUsers.find(
      (config) => config.user === userName,
    );

    const groups: string[] = [];
    const promises: Promise<void>[] = [];
    const registryToken = String(this.config.token);

    if (configuredUser) {
      groups.push(configuredUser.group);
    }

    this.addOrgGroupPromises(this.config.parsedOrgs, groups, promises, userName, registryToken);
    this.addTeamGroupPromises(this.config.parsedTeams, groups, promises, userName, registryToken);
    this.addRepoGroupPromises(this.config.parsedRepos, groups, promises, userName, registryToken);

    await Promise.all(promises);

    return uniq(groups).filter(Boolean).sort();
  }

  private generateState(): string {
    return "someRandomStateString";
  }

  private buildQueryParams(params: Record<string, string>): string {
    return stringify(params);
  }

  private buildUrl(queryParams: string): string {
    return this.webBaseUrl + `/site/oauth2/authorize?` + queryParams;
  }

  private addOrgGroupPromises(
    configs: ParsedOrg[],
    groups: string[],
    promises: Promise<void>[],
    userName: string,
    registryToken: string
  ) {
    configs.forEach((config) => {
      const job = async () => {
        const canAccess = await this.client.requestWorkspaceMembershipStatus(
          registryToken,
          config.org,
          userName,
        );
        if (canAccess) {
          groups.push(config.group);
        }
      };
      promises.push(job());
    });
  }

  private addTeamGroupPromises(
    configs: ParsedTeam[],
    groups: string[],
    promises: Promise<void>[],
    userName: string,
    registryToken: string
  ) {
    configs.forEach((config) => {
      const job = async () => {
        const canAccess = await this.client.requestTeamMembershipStatus(
          registryToken,
          config.org,
          config.team,
          userName,
        );
        if (canAccess) {
          groups.push(config.group);
        }
      };
      promises.push(job());
    });
  }

  private addRepoGroupPromises(
    configs: ParsedRepo[],
    groups: string[],
    promises: Promise<void>[],
    userName: string,
    registryToken: string
  ) {
    configs.forEach((config) => {
      const job = async () => {
        const canAccess = await this.client.requestRepositoryCollaboratorStatus(
          registryToken,
          config.owner,
          config.repo,
          userName,
        );
        if (canAccess) {
          groups.push(config.group);
        }
      };
      promises.push(job());
    });
  }
}
