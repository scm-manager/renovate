import { initPlatform, initRepo } from './index';
import type { Repo, User } from './types';
import ScmClient from './scm-client';
import * as _hostRules from '../../../util/host-rules';
import * as _git from '../../../util/git';
import * as _util from '../util';
import { mocked } from '../../../../test/util';

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

describe('scmm index', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
});
