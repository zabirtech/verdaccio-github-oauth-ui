import plugin from "../package.json"

export { plugin }

export const cliName = plugin.name
export const pluginKey = plugin.name.replace("verdaccio-", "")
export const authorizePath = "/-/oauth/authorize"
export const callbackPath = "/-/oauth/callback"
export const loginHref = authorizePath
export const logoutHref = "/"

export const cliPort = 8239
export const cliProviderId = "cli"
export const cliAuthorizeUrl = "/oauth/authorize"

export const publicGitHubOrigin = "https://github.com"
export const publicGitHubApiOrigin = "https://api.github.com"

export const publicBitBucketOrigin = "https://bitbucket.org"
export const publicBitBucketApiOrigin = "https://api.bitbucket.org/2.0"


/**
 * See https://verdaccio.org/docs/en/packages
 */
export const authenticatedUserGroups = [
  "$all",
  "@all",
  "$authenticated",
  "@authenticated",
] as const
