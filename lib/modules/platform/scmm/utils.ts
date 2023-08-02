import type { MergeStrategy } from '../../../config/types';
import { CONFIG_GIT_URL_UNAVAILABLE } from '../../../constants/error-messages';
import { logger } from '../../../logger';
import * as hostRules from '../../../util/host-rules';
import { regEx } from '../../../util/regex';
import { parseUrl } from '../../../util/url';
import type { GitUrlOption, Pr } from '../types';
import type { Link, PRMergeMethod, Repo } from './types';

export function matchPrState(
  pr: Pr,
  state: 'open' | 'closed' | '!open' | 'all'
): boolean {
  if (state === 'all') {
    return true;
  }

  if (state === 'open' && pr.state === 'OPEN') {
    return true;
  }

  if (state === '!open' && pr.state === 'MERGED') {
    return true;
  }

  if (
    state === 'closed' &&
    (pr.state === 'MERGED' || pr.state === 'REJECTED')
  ) {
    return true;
  }

  return false;
}

export function smartLinks(body: string): string {
  return body?.replace(regEx(/\]\(\.\.\/pull\//g), '](pulls/');
}

export function getRepoUrl(
  repo: Repo,
  gitUrl: GitUrlOption | undefined,
  endpoint: string
): string {
  const protocolLinks = repo._links.protocol as Link[];

  if (gitUrl === 'ssh') {
    const sshUrl = protocolLinks.find((l) => l.name === 'ssh')?.href;
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

  const httpUrl = protocolLinks.find((l) => l.name === 'http')?.href;

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
      return 'FAST_FORWARD_IF_POSSIBLE';
    case 'merge-commit':
      return 'MERGE_COMMIT';
    case 'rebase':
      return 'REBASE';
    case 'squash':
      return 'SQUASH';
    default:
      return null;
  }
}
