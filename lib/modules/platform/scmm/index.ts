import { logger } from '../../../logger';
import * as git from '../../../util/git';
import * as hostRules from '../../../util/host-rules';
import { sanitize } from '../../../util/sanitize';
import type {
  CreatePRConfig,
  EnsureIssueConfig,
  FindPRConfig,
  Issue,
  PlatformParams,
  PlatformResult,
  Pr,
  RepoParams,
  RepoResult,
  UpdatePrConfig,
} from '../types';
import { repoFingerprint } from '../util';
import { smartTruncate } from '../utils/pr-body';
import { mapPrFromScmToRenovate } from './mapper';
import ScmClient from './scm-client';
import { getRepoUrl, matchPrState, smartLinks } from './utils';

interface SCMMRepoConfig {
  repository: string;
  prList: Pr[] | null;
  defaultBranch: string;
}

export const id = 'scmm';

let config: SCMMRepoConfig = {} as any;
let scmmClient: ScmClient;

export async function initPlatform({
  endpoint,
  token,
}: PlatformParams): Promise<PlatformResult> {
  if (!endpoint) {
    throw new Error('SCM-Manager endpoint not configured');
  }

  if (!token) {
    throw new Error('SCM-Manager api token not configured');
  }

  scmmClient = new ScmClient(endpoint, token);

  const me = await scmmClient.getCurrentUser();
  const gitAuthor = `${me.displayName ?? me.username} <${me.mail ?? ''}>`;
  const result = { endpoint, gitAuthor };

  logger.info(`Plattform initialized ${JSON.stringify(result)}`);

  return result;
}

export async function initRepo({
  repository,
  gitUrl,
}: RepoParams): Promise<RepoResult> {
  const repo = await scmmClient.getRepo(repository);
  const defaultBranch = await scmmClient.getDefaultBranch(repo);
  const url = getRepoUrl(
    repo,
    gitUrl,
    hostRules.find({ hostType: id, url: scmmClient.getEndpoint() }).username ??
      '',
    process.env.RENOVATE_TOKEN ?? '',
  );

  config = {} as any;
  config.repository = repository;
  config.defaultBranch = defaultBranch;

  await git.initRepo({
    ...config,
    url,
  });

  // Reset cached resources
  invalidatePrCache();

  const result = {
    defaultBranch: config.defaultBranch,
    isFork: false,
    repoFingerprint: repoFingerprint(
      config.repository,
      scmmClient.getEndpoint()
    ),
  };

  logger.info(`Repo initialized: ${JSON.stringify(result)}`);

  return result;
}

export async function getRepos(): Promise<string[]> {
  const repos = await scmmClient.getAllRepos();
  const result = repos.map((repo) => `${repo.namespace}/${repo.name}`);
  logger.info(`Discoverd ${repos.length} repos`);

  return result;
}

export async function getBranchPr(branchName: string): Promise<Pr | null> {
  return await findPr({ branchName, state: 'open' });
}

export async function findPr({
  branchName,
  prTitle,
  state = 'all',
}: FindPRConfig): Promise<Pr | null> {
  const inProgressPrs = await getPrList();
  const result = inProgressPrs.find(
    (pr) =>
      branchName === pr.sourceBranch &&
      (!prTitle || prTitle === pr.title) &&
      matchPrState(pr, state)
  );

  if (result) {
    logger.info(`Found PR ${JSON.stringify(result)}`);
    return result;
  }

  logger.info(
    `Could not find PR with source branch ${branchName} and title ${
      prTitle ?? ''
    } and state ${state}`
  );

  return null;
}

export async function getPr(number: number): Promise<Pr | null> {
  const inProgressPrs = await getPrList();
  const cachedPr = inProgressPrs.find((pr) => pr.number === number);

  if (cachedPr) {
    logger.info(`Returning from cached PRs, ${JSON.stringify(cachedPr)}`);
    return cachedPr;
  }

  const result = await scmmClient.getRepoPr(config.repository, number);
  if (!result) {
    logger.info(`Not found PR with id ${number}`);
    return null;
  }

  logger.info(`Returning PR from API, ${JSON.stringify(result)}`);
  return mapPrFromScmToRenovate(result);
}

export async function getPrList(): Promise<Pr[]> {
  if (config.prList === null) {
    config.prList = (await scmmClient.getAllRepoPrs(config.repository)).map(
      (pr) => mapPrFromScmToRenovate(pr)
    );
  }

  return config.prList ?? [];
}

export async function createPr({
  sourceBranch,
  targetBranch,
  prTitle,
  prBody,
  draftPR,
}: CreatePRConfig): Promise<Pr> {
  const createdPr = await scmmClient.createPr(config.repository, {
    source: sourceBranch,
    target: targetBranch,
    title: prTitle,
    description: sanitize(prBody),
    status: draftPR ? 'DRAFT' : 'OPEN',
  });

  logger.info(`Pr Created ${JSON.stringify(createdPr)}`);

  return mapPrFromScmToRenovate(createdPr);
}

export async function updatePr({
  number,
  prTitle,
  prBody,
  state,
  targetBranch,
}: UpdatePrConfig): Promise<void> {
  //TODO how to handle state and target branch?
  await scmmClient.updatePr(config.repository, number, {
    title: prTitle,
    description: sanitize(prBody) ?? undefined,
  });

  logger.info(`Updated Pr #${number} with title ${prTitle}`);
}

export function findIssue(title: string): Promise<Issue | null> {
  logger.debug('NO-OP findIssue');
  return Promise.resolve(null);
}

export function ensureIssue(
  config: EnsureIssueConfig
): Promise<'updated' | 'created' | null> {
  logger.debug('NO-OP ensureIssue');
  return Promise.resolve(null);
}

export function ensureIssueClosing(title: string): Promise<void> {
  logger.debug('NO-OP ensureIssueClosing');
  return Promise.resolve();
}

export function massageMarkdown(prBody: string): string {
  //TODO which length for len
  return smartTruncate(smartLinks(prBody), 1000000);
}

export function getRepoForceRebase(): Promise<boolean> {
  return Promise.resolve(false);
}

export function invalidatePrCache(): void {
  config.prList = null;
}
