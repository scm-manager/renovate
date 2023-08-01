import type { MergeStrategy } from '../../../config/types';
import { CONFIG_GIT_URL_UNAVAILABLE } from '../../../constants/error-messages';
import { logger } from '../../../logger';
import * as hostRules from '../../../util/host-rules';
import { regEx } from '../../../util/regex';
import { parseUrl } from '../../../util/url';
import type { GitUrlOption } from '../types';
import type { PRMergeMethod, Repo } from './types';

export function smartLinks(body: string): string {
  return body?.replace(regEx(/\]\(\.\.\/pull\//g), '](pulls/');
}

export function trimTrailingApiPath(url: string): string {
  return url?.replace(regEx(/api\/v1\/?$/g), '');
}

export function getRepoUrl(
  repo: Repo,
  gitUrl: GitUrlOption | undefined,
  endpoint: string
): string {
  if (gitUrl === 'ssh') {
    const sshUrl = repo._links?.protocol?.filter(l => l.name === "ssh")[0].href;
    if (!sshUrl) {
      throw new Error(CONFIG_GIT_URL_UNAVAILABLE);
    }
    logger.debug(`Using SSH URL: ${sshUrl}`);
    return sshUrl;
  }

  // Find options for current host and determine Git endpoint
  const opts = hostRules.find({
    hostType: 'scmm',
    url: endpoint,
  });

  if (gitUrl === 'endpoint') {
    const url = parseUrl(endpoint);
    if (!url) {
      throw new Error(CONFIG_GIT_URL_UNAVAILABLE);
    }
    url.username = opts.token ?? '';
    url.pathname = `${url.pathname}${repo.namespace}/${repo.name}.git`;
    logger.debug(
      { url: url.toString() },
      'using URL based on configured endpoint'
    );
    return url.toString();
  }

  const httpUrl = repo._links?.protocol?.filter(l => l.name === "http")[0].href;

  if (!httpUrl) {
    throw new Error(CONFIG_GIT_URL_UNAVAILABLE);
  }

  logger.debug(`Using HTTP URL: ${httpUrl}`);
  const repoUrl = parseUrl(httpUrl);
  if (!repoUrl) {
    throw new Error(CONFIG_GIT_URL_UNAVAILABLE);
  }
  repoUrl.username = opts.username ?? '';
  return repoUrl.toString();
}

export function getMergeMethod(
  strategy: MergeStrategy | undefined
): PRMergeMethod | null {
  switch (strategy) {
    case 'fast-forward':
      return 'fast-forward-if-possible';
    case 'merge-commit':
      return 'merge-commit';
    case 'rebase':
      return 'rebase';
    case 'squash':
      return strategy;
    case 'auto':
    default:
      return null;
  }
}
