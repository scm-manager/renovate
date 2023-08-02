import { logger } from '../../../logger';
import * as git from '../../../util/git';
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
import { ScmmClient } from './scmm-client';
import { getRepoUrl, matchPrState, smartLinks } from './utils';
import { mapPrFromScmToRenovate } from './mapper';
import { smartTruncate } from '../utils/pr-body';
import { sanitize } from '../../../util/sanitize';

//TODO Error Handling

interface SCMMRepoConfig {
  repository: string;
  prList: Pr[] | null;
  defaultBranch: string;
}

export const id = 'scmm';

let config: SCMMRepoConfig = {} as any;
let scmmClient: ScmmClient;

export async function initPlatform({
  endpoint,
  token,
}: PlatformParams): Promise<PlatformResult> {
  if (!endpoint) {
    throw new Error(
      'Init Platform: You must configure a SCM-Manager endpoint base path'
    );
  }

  if (!token) {
    throw new Error(
      'Init Platform: You must configure a SCM-Manager personal api key'
    );
  }

  scmmClient = new ScmmClient(endpoint, token);

  const me = await scmmClient.getCurrentUser();
  const gitAuthor = `${me.displayName ?? me.username} <${me.mail}>`;
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
  const url = getRepoUrl(repo, gitUrl, scmmClient.getEndpoint());

  config = {} as any;
  config.repository = repository;
  config.defaultBranch = defaultBranch;

  await git.initRepo({
    ...config,
    url,
  });

  // Reset cached resources
  config.prList = null;

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
    `Could not find PR with source branch ${branchName} and title ${prTitle} and state ${state}`
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

  const result = mapPrFromScmToRenovate(
    await scmmClient.getRepoPr(config.repository, number)
  );

  logger.info(`Returning PR from API, ${JSON.stringify(result)}`);

  return result;
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

export async function findIssue(title: string): Promise<Issue | null> {
  logger.debug('NO-OP findIssue');
  return null;
}

export async function ensureIssue(
  config: EnsureIssueConfig
): Promise<'updated' | 'created' | null> {
  logger.debug('NO-OP ensureIssue');
  return null;
}

export async function ensureIssueClosing(title: string): Promise<void> {
  logger.debug('NO-OP ensureIssueClosing');
}

export function massageMarkdown(prBody: string): string {
  //TODO which length for len
  return smartTruncate(smartLinks(prBody), 1000000);
}

export async function getRepoForceRebase(): Promise<boolean> {
  return false;
}

/*const platform: Platform = {

export async function getRawFile(
  fileName: string,
  repoName: string,
  branchOrTag: string
): Promise<string | null> {
  return scmmClient?.getFileContent(repoName, branchOrTag, fileName) ?? null;
}

export async function getJsonFile(
  fileName: string,
  repoName?: string,
  branchOrTag?: string
): Promise<any | null> {
  if (!repoName || !branchOrTag) {
    throw new Error(
      `Missing repoName ${repoName} or branchOrTag ${branchOrTag}`
    );
  }

  const raw = await getRawFile(fileName, repoName, branchOrTag);

  if (!raw) {
    throw new Error(
      `Could not find file ${fileName} in repo ${repoName} for revision ${branchOrTag}`
    );
  }

  return JSON.parse(raw);
}

export async function getRepos(): Promise<string[]> {
  logger.debug('Auto-discovering Gitea repositories');
  try {
    const repos = await helper.searchRepos(defaultOptions);
    return repos.map((r) => r.namespace + '/' + r.name);
  } catch (err) {
    logger.error({ err }, 'SCM-Manager getRepos() error');
    throw err;
  }

  throw new Error('Not implemented');
}
,

  async setBranchStatus({
    branchName,
    context,
    description,
    state,
    url: target_url,
  }: BranchStatusConfig): Promise<void> {
    // Nothing
  },

  async getBranchStatus(
    branchName: string,
    internalChecksAsSuccess: boolean
  ): Promise<BranchStatus> {
    // Nothing
  },

  async getBranchStatusCheck(
    branchName: string,
    context: string
  ): Promise<BranchStatus | null> {
    // Nothing
  },

  ,



  async mergePr({ id }: MergePRConfig): Promise<boolean> {
    try {
      await helper.mergePR(config.repository, id, {});
      return true;
    } catch (err) {
      logger.warn({ err, id }, 'Merging of PR failed');
      return false;
    }
  },

 ,

  async getIssue(number: number, memCache = true): Promise<Issue | null> {
    return Promise.resolve(null);
  },

  ,

  ,


  async deleteLabel(issue: number, labelName: string): Promise<void> {
    // Nothing
  },

  async ensureComment({
    number: issue,
    topic,
    content,
  }: EnsureCommentConfig): Promise<boolean> {
    // Nothing
  },

  async ensureCommentRemoval(
    deleteConfig: EnsureCommentRemovalConfig
  ): Promise<void> {
    // Nothing
  },

  async addAssignees(number: number, assignees: string[]): Promise<void> {
    // Nothing
  },

  async addReviewers(number: number, reviewers: string[]): Promise<void> {
    // Nothing
  },

  ,
};

*/
