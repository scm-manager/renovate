import JSON5 from 'json5';
import { logger } from '../../../logger';
import type { BranchStatus } from '../../../types';
import * as git from '../../../util/git';
import { setBaseUrl } from '../../../util/http/gitea';
import { sanitize } from '../../../util/sanitize';
import { ensureTrailingSlash } from '../../../util/url';
import { getPrBodyStruct, hashBody } from '../pr-body';
import type {
  BranchStatusConfig,
  CreatePRConfig,
  EnsureCommentConfig,
  EnsureCommentRemovalConfig,
  EnsureIssueConfig,
  FindPRConfig,
  Issue,
  MergePRConfig,
  Platform,
  PlatformParams,
  PlatformResult,
  Pr,
  RepoParams,
  RepoResult,
  UpdatePrConfig,
} from '../types';
import { repoFingerprint } from '../util';
import { smartTruncate } from '../utils/pr-body';
import * as helper from './scmm-client';
import { ScmmClient } from './scmm-client';
import type { PRMergeMethod, PRUpdateParams, Repo } from './types';
import { getRepoUrl, smartLinks, trimTrailingApiPath } from './utils';

interface SCMMRepoConfig {
  repository: string;
  mergeMethod: PRMergeMethod;

  prList: Promise<Pr[]> | null;
  defaultBranch: string;
}

export const id = 'scmm';

const DRAFT_PREFIX = 'WIP: ';

const defaults = {
  hostType: 'scmm',
  endpoint: 'https://ecosystem.cloudogu.com/scm',
  version: '0.0.0',
};

const defaultOptions = {
  username: 'tzerr',
  password:
    'eyJhcGlLZXlJZCI6IkJqVGxmWG5BQk9DIiwidXNlciI6InR6ZXJyIiwicGFzc3BocmFzZSI6IkhoeGdURlZtTXhTOXFHd09LUXVYIn0',
  headers: { Accept: '*', 'X-Scm-Client': 'WUI' },
};

let config: SCMMRepoConfig = {} as any;
let scmmClient: ScmmClient | undefined = undefined;

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
  if (!scmmClient) {
    throw new Error(
      'Init Repo: You must init the plattform first, because client is undefined'
    );
  }

  const repo = await scmmClient.getRepo(repository);
  const url = getRepoUrl(repo, gitUrl, scmmClient.getEndpoint());

  config = {} as any;
  config.repository = repository;
  console.log('pre init repo');
  await git.initRepo({
    ...config,
    url,
  });
  console.log('post init repo');

  // Reset cached resources
  config.prList = null;

  const result = {
    defaultBranch: config.defaultBranch,
    isFork: false,
    repoFingerprint: repoFingerprint(repo.id, scmmClient.getEndpoint()),
  };

  logger.info(`Repo initialized: ${JSON.stringify(result)}`);

  return result;
}

/*const platform: Platform = {
  ,

async getRawFile(
    fileName: string,
    repoName: string,
    branchOrTag: string
  ): Promise<string | null> {
    const repo = repoName ?? config.repository;
    const contents = await helper.getRepoContents(
      repo,
      fileName,
      branchOrTag,
      defaultOptions
    );
    return contents.contentString ?? null;
  },

  async getJsonFile(
    fileName: string,
    repoName?: string,
    branchOrTag?: string
  ): Promise<any | null> {
    // TODO #7154
    const raw = (await platform.getRawFile(fileName, repoName, branchOrTag))!;
    return JSON5.parse(raw);
  },

  async initRepo({ repository, gitUrl }: RepoParams): Promise<RepoResult> {
    let repo: Repo;

    config = {} as any;
    config.repository = repository;

    // Attempt to fetch information about repository
    try {
      repo = await helper.getRepo(repository, defaultOptions);
    } catch (err) {
      logger.debug({ err }, 'Unknown SCMM initRepo error');
      throw err;
    }

    const url = getRepoUrl(repo, gitUrl, defaults.endpoint);

    // Initialize Git storage
    await git.initRepo({
      ...config,
      url,
    });

    // Reset cached resources
    config.prList = null;

    return {
      defaultBranch: config.defaultBranch,
      isFork: false,
      repoFingerprint: repoFingerprint(repo.id, defaults.endpoint),
    };
  },

  async getRepos(): Promise<string[]> {
    logger.debug('Auto-discovering Gitea repositories');
    try {
      const repos = await helper.searchRepos(defaultOptions);
      return repos.map((r) => r.namespace + '/' + r.name);
    } catch (err) {
      logger.error({ err }, 'SCM-Manager getRepos() error');
      throw err;
    }
  },

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

  getPrList(): Promise<Pr[]> {
    if (config.prList === null) {
      config.prList = helper.searchPRs(config.repository, defaultOptions);
    }

    return config.prList;
  },

  async getPr(number: number): Promise<Pr | null> {
    // Search for pull request in cached list or attempt to query directly
    const prList = await platform.getPrList();
    let pr = prList.find((p) => p.number === number) ?? null;
    if (pr) {
      logger.debug('Returning from cached PRs');
    } else {
      logger.debug('PR not found in cached PRs - trying to fetch directly');
      const gpr = await helper.getPR(config.repository, number, defaultOptions);
      pr = {
        number: gpr.number,
        sourceBranch: gpr.source,
        targetBranch: gpr.target,
        title: gpr.title,
        state: gpr.status,
      };

      // Add pull request to cache for further lookups / queries
      if (config.prList !== null) {
        (await config.prList).push(pr!);
      }
    }

    // Abort and return null if no match was found
    if (!pr) {
      return null;
    }

    return pr;
  },

  async findPr({
    branchName,
    prTitle: title,
    state = 'all',
  }: FindPRConfig): Promise<Pr | null> {
    logger.debug(`findPr(${branchName}, ${title!}, ${state})`);
    const prList = await platform.getPrList();
    const pr = prList.find(
      (p) =>
        p.sourceRepo === config.repository &&
        p.sourceBranch === branchName &&
        (!title || p.title === title)
    );

    if (pr) {
      logger.debug(`Found PR #${pr.number}`);
    }
    return pr ?? null;
  },

  async createPr({
    sourceBranch,
    targetBranch,
    prTitle,
    prBody: rawBody,
    labels: labelNames,
    platformOptions,
    draftPR,
  }: CreatePRConfig): Promise<Pr> {
    let title = prTitle;
    const target = 'develop';
    const source = sourceBranch;
    const description = sanitize(rawBody);
    if (draftPR) {
      title = DRAFT_PREFIX + title;
    }

    logger.debug(`Creating pull request: ${title} (${source} => ${target})`);
    try {
      const gpr = await helper.createPR(
        config.repository,
        {
          target,
          source,
          title,
          description,
        },
        defaultOptions
      );

      if (platformOptions?.usePlatformAutomerge) {
        try {
          await helper.mergePR(config.repository, gpr.number, defaultOptions);
        } catch (err) {
          logger.warn({ err, prNumber: gpr.number }, 'automerge: fail');
        }
      }

      const pr = {
        number: gpr.number,
        sourceBranch: gpr.source,
        targetBranch: gpr.target,
        title: gpr.title,
        state: gpr.status,
      };
      if (!pr) {
        throw new Error('Can not parse newly created Pull Request');
      }
      if (config.prList !== null) {
        (await config.prList).push(pr);
      }

      return pr;
    } catch (err) {
      // When the user manually deletes a branch from Renovate, the PR remains but is no longer linked to any branch. In
      // the most recent versions of Gitea, the PR gets automatically closed when that happens, but older versions do
      // not handle this properly and keep the PR open. As pushing a branch with the same name resurrects the PR, this
      // would cause a HTTP 409 conflict error, which we hereby gracefully handle.
      if (err.statusCode === 409) {
        logger.warn(
          `Attempting to gracefully recover from 409 Conflict response in createPr(${title}, ${sourceBranch})`
        );

        // Refresh cached PR list and search for pull request with matching information
        config.prList = null;
        const pr = await platform.findPr({
          branchName: sourceBranch,
          state: 'open',
        });

        // If a valid PR was found, return and gracefully recover from the error. Otherwise, abort and throw error.
        if (pr?.bodyStruct) {
          if (
            pr.title !== title ||
            pr.bodyStruct.hash !== hashBody(description)
          ) {
            logger.debug(
              `Recovered from 409 Conflict, but PR for ${sourceBranch} is outdated. Updating...`
            );
            await platform.updatePr({
              number: pr.number,
              prTitle: title,
              prBody: description,
            });
            pr.title = title;
            pr.bodyStruct = getPrBodyStruct(description);
          } else {
            logger.debug(
              `Recovered from 409 Conflict and PR for ${sourceBranch} is up-to-date`
            );
          }

          return pr;
        }
      }

      throw err;
    }
  },

  async updatePr({
    number,
    prTitle,
    prBody: body,
    state,
    targetBranch,
  }: UpdatePrConfig): Promise<void> {
    let title = prTitle;
    if ((await getPrList()).find((pr) => pr.number === number)?.isDraft) {
      title = DRAFT_PREFIX + title;
    }

    const prUpdateParams: PRUpdateParams = {
      title,
      ...(body && { body }),
      ...(state && { state }),
    };

    await helper.updatePR(
      config.repository,
      number,
      prUpdateParams,
      defaultOptions
    );
  },

  async mergePr({ id }: MergePRConfig): Promise<boolean> {
    try {
      await helper.mergePR(config.repository, id, {});
      return true;
    } catch (err) {
      logger.warn({ err, id }, 'Merging of PR failed');
      return false;
    }
  },

  getIssueList(): Promise<Issue[]> {
    return Promise.resolve([]);
  },

  async getIssue(number: number, memCache = true): Promise<Issue | null> {
    return Promise.resolve(null);
  },

  async findIssue(title: string): Promise<Issue | null> {
    const issueList = await platform.getIssueList();
    const issue = issueList.find(
      (i) => i.state === 'open' && i.title === title
    );

    if (!issue) {
      return null;
    }
    // TODO: types (#7154)
    logger.debug(`Found Issue #${issue.number!}`);
    // TODO #7154
    return getIssue!(issue.number!);
  },

  async ensureIssue({
    title,
    reuseTitle,
    body: content,
    labels: labelNames,
    shouldReOpen,
    once,
  }: EnsureIssueConfig): Promise<'updated' | 'created' | null> {
    return null;
  },

  async ensureIssueClosing(title: string): Promise<void> {
    // Nothing
  },

  async deleteLabel(issue: number, labelName: string): Promise<void> {
    // Nothing
  },

  getRepoForceRebase(): Promise<boolean> {
    return Promise.resolve(false);
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

  async getBranchPr(branchName: string): Promise<Pr | null> {
    logger.debug(`getBranchPr(${branchName})`);
    const pr = await platform.findPr({ branchName, state: 'open' });
    return pr ? platform.getPr(pr.number) : null;
  },

  async addAssignees(number: number, assignees: string[]): Promise<void> {
    // Nothing
  },

  async addReviewers(number: number, reviewers: string[]): Promise<void> {
    // Nothing
  },

  massageMarkdown(prBody: string): string {
    return smartTruncate(smartLinks(prBody), 1000000);
  },
};

*/

/* eslint-disable @typescript-eslint/unbound-method */
/*export const {
  addAssignees,
  addReviewers,
  createPr,
  deleteLabel,
  ensureComment,
  ensureCommentRemoval,
  ensureIssue,
  ensureIssueClosing,
  findIssue,
  findPr,
  getBranchPr,
  getBranchStatus,
  getBranchStatusCheck,
  getIssue,
  getRawFile,
  getJsonFile,
  getIssueList,
  getPr,
  massageMarkdown,
  getPrList,
  getRepoForceRebase,
  getRepos,
  initPlatform,
  initRepo,
  mergePr,
  setBranchStatus,
  updatePr,
} = platform;*/
