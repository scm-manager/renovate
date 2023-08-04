import {
  createPr,
  findPr,
  getBranchPr,
  getPr,
  getPrList,
  getRepos,
  initPlatform,
  initRepo,
  invalidatePrCache,
} from './index';
import type {
  PRState,
  PrFilterByState,
  PullRequest,
  PullRequestCreateParams,
  Repo,
  User,
} from './types';
import ScmClient from './scm-client';
import * as _hostRules from '../../../util/host-rules';
import * as _git from '../../../util/git';
import * as _util from '../util';
import { mocked } from '../../../../test/util';
import type { CreatePRConfig, Pr } from '../types';
import { mapPrFromScmToRenovate } from './mapper';

jest.mock('../../../util/host-rules');
const hostRules: jest.Mocked<typeof _hostRules> = mocked(_hostRules);

jest.mock('../../../util/git');
const git: jest.Mocked<typeof _git> = mocked(_git);

jest.mock('../util');
const util: jest.Mocked<typeof _util> = mocked(_util);

const endpoint = 'http://localhost:1337/scm/api/v2';
const token = 'TEST_TOKEN';

const user: User = {
  mail: 'test@user.de',
  displayName: 'Test User',
  username: 'testUser1337',
};

const repo: Repo = {
  contact: 'test@test.com',
  creationDate: '2023-08-02T10:48:24.762Z',
  description: 'Default Repo',
  lastModified: '2023-08-10T10:48:24.762Z',
  namespace: 'default',
  name: 'repo',
  type: 'git',
  archived: false,
  exporting: false,
  healthCheckRunning: false,
  _links: {
    protocol: [
      { name: 'http', href: 'http://localhost:8080/scm/default/repo' },
    ],
  },
};

const pullRequest: PullRequest = {
  id: '1',
  author: { displayName: 'Thomas Zerr', username: 'tzerr' },
  source: 'feature/test',
  target: 'develop',
  title: 'The PullRequest',
  description: 'Another PullRequest',
  creationDate: '2023-08-02T10:48:24.762Z',
  status: 'OPEN',
  labels: [],
  tasks: { todo: 2, done: 4 },
  _links: {},
  _embedded: {
    defaultConfig: {
      mergeStrategy: 'SQUASH',
      deleteBranchOnMerge: true,
    },
  },
};

const renovatePr: Pr = mapPrFromScmToRenovate(pullRequest);

describe('scmm index', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    invalidatePrCache();
  });

  describe(initPlatform, () => {
    it('should throw error, because endpoint is not configured', async () => {
      await expect(initPlatform({ token })).rejects.toThrow(
        'SCM-Manager endpoint not configured'
      );
    });

    it('should throw error, because token is not configured', async () => {
      await expect(initPlatform({ endpoint })).rejects.toThrow(
        'SCM-Manager api token not configured'
      );
    });

    it('should init platform', async () => {
      jest
        .spyOn(ScmClient.prototype, 'getCurrentUser')
        .mockResolvedValueOnce(user);

      expect(await initPlatform({ endpoint, token })).toEqual({
        endpoint,
        gitAuthor: 'Test User <test@user.de>',
      });
    });
  });

  describe(initRepo, () => {
    it('should init repo', async () => {
      const repository = `${repo.namespace}/${repo.name}`;
      const expectedFingerprint = 'expectedFingerprint';
      const expectedDefaultBranch = 'expectedDefaultBranch';

      jest.spyOn(ScmClient.prototype, 'getRepo').mockResolvedValueOnce(repo);
      jest
        .spyOn(ScmClient.prototype, 'getDefaultBranch')
        .mockResolvedValueOnce(expectedDefaultBranch);

      hostRules.find.mockReturnValueOnce({ username: user.username });
      git.initRepo.mockImplementationOnce(async () => {});
      util.repoFingerprint.mockReturnValueOnce(expectedFingerprint);

      expect(
        await initRepo({ repository: `${repo.namespace}/${repo.name}` })
      ).toEqual({
        defaultBranch: expectedDefaultBranch,
        isFork: false,
        repoFingerprint: expectedFingerprint,
      });

      expect(git.initRepo).toBeCalledWith({
        url: `http://${user.username}@localhost:8080/scm/default/repo`,
        repository,
        defaultBranch: expectedDefaultBranch,
      });
    });
  });

  describe(getRepos, () => {
    it('should return all available repos', async () => {
      jest
        .spyOn(ScmClient.prototype, 'getAllRepos')
        .mockResolvedValueOnce([
          repo,
          { ...repo, namespace: 'other', name: 'repository' },
        ]);

      expect(await getRepos()).toEqual(['default/repo', 'other/repository']);
    });
  });

  describe(getPrList, () => {
    it('should return all prs of a repo', async () => {
      const expectedResult: Pr[] = [
        {
          sourceBranch: pullRequest.source,
          createdAt: pullRequest.creationDate,
          labels: pullRequest.labels,
          number: parseInt(pullRequest.id),
          state: pullRequest.status,
          targetBranch: pullRequest.target,
          title: pullRequest.title,
          hasAssignees: false,
          isDraft: false,
          reviewers: [],
        },
      ];

      jest
        .spyOn(ScmClient.prototype, 'getAllRepoPrs')
        .mockResolvedValueOnce([pullRequest]);

      //Fetching from client
      expect(await getPrList()).toIncludeAllMembers(expectedResult);
      //Fetching from cache
      expect(await getPrList()).toIncludeAllMembers(expectedResult);
    });
  });

  describe(findPr, () => {
    it.each([
      [[], pullRequest.source, pullRequest.title, 'all', null],
      [[pullRequest], 'invalid branchName', pullRequest.title, 'all', null],
      [[pullRequest], pullRequest.source, 'invalid title', 'all', null],
      [[pullRequest], pullRequest.source, null, 'all', renovatePr],
      [[pullRequest], pullRequest.source, undefined, 'all', renovatePr],
      [[pullRequest], pullRequest.source, pullRequest.title, 'all', renovatePr],
      [
        [pullRequest],
        pullRequest.source,
        pullRequest.title,
        'open',
        renovatePr,
      ],
      [[pullRequest], pullRequest.source, pullRequest.title, '!open', null],
      [[pullRequest], pullRequest.source, pullRequest.title, 'closed', null],
    ])(
      'search within %p for %p, %p, %p with result %p',
      async (
        availablePullRequest: PullRequest[],
        branchName: string,
        prTitle: string | null | undefined,
        state: string,
        result: Pr | null
      ) => {
        jest
          .spyOn(ScmClient.prototype, 'getAllRepoPrs')
          .mockResolvedValueOnce(availablePullRequest);

        expect(
          await findPr({ branchName, prTitle, state: state as PrFilterByState })
        ).toEqual(result);
      }
    );
  });

  describe(getBranchPr, () => {
    it.each([
      [[], pullRequest.source, null],
      [[pullRequest], 'invalid branchName', null],
      [[pullRequest], pullRequest.source, renovatePr],
    ])(
      'search within %p for %p with result %p',
      async (
        availablePullRequest: PullRequest[],
        branchName: string,
        result: Pr | null
      ) => {
        jest
          .spyOn(ScmClient.prototype, 'getAllRepoPrs')
          .mockResolvedValueOnce(availablePullRequest);

        expect(await getBranchPr(branchName)).toEqual(result);
      }
    );
  });

  describe(getPr, () => {
    it.each([
      [[], null, 1, null],
      [[], pullRequest, 1, renovatePr],
      [[pullRequest], null, 9999, null],
      [[pullRequest], pullRequest, 1, renovatePr],
    ])(
      'search within %p for %p with result %p',
      async (
        availablePullRequest: PullRequest[],
        pullRequestById: PullRequest | null,
        prId: number,
        result: Pr | null
      ) => {
        jest
          .spyOn(ScmClient.prototype, 'getAllRepoPrs')
          .mockResolvedValueOnce(availablePullRequest);

        jest
          .spyOn(ScmClient.prototype, 'getRepoPr')
          .mockResolvedValueOnce(pullRequestById);

        expect(await getPr(prId)).toEqual(result);
      }
    );
  });

  describe(createPr, () => {
    it.each([
      [undefined, 'OPEN', false],
      [false, 'OPEN', false],
      [true, 'DRAFT', true],
    ])(
      'it should create the pr with isDraft %p and state %p',
      async (
        draftPR: boolean | undefined,
        expectedState: string,
        expectedIsDraft: boolean
      ) => {
        jest
          .spyOn(ScmClient.prototype, 'createPr')
          .mockImplementationOnce(
            async (
              _repoPath: string,
              createParams: PullRequestCreateParams
            ) => {
              return {
                id: '1337',
                source: createParams.source,
                target: createParams.target,
                title: createParams.title,
                description: createParams.description ?? '',
                creationDate: '2023-01-01T13:37:00.000Z',
                status: createParams.status ?? 'OPEN',
                labels: [],
                tasks: { todo: 0, done: 0 },
                _links: {},
                _embedded: {
                  defaultConfig: {
                    mergeStrategy: 'FAST_FORWARD_IF_POSSIBLE',
                    deleteBranchOnMerge: false,
                  },
                },
              };
            }
          );

        expect(
          await createPr({
            sourceBranch: 'feature/test',
            targetBranch: 'develop',
            prTitle: 'PR Title',
            prBody: 'PR Body',
            draftPR,
          })
        ).toEqual({
          sourceBranch: 'feature/test',
          targetBranch: 'develop',
          title: 'PR Title',
          createdAt: '2023-01-01T13:37:00.000Z',
          hasAssignees: false,
          isDraft: expectedIsDraft,
          labels: [],
          number: 1337,
          reviewers: [],
          state: expectedState,
        });
      }
    );
  });
});
