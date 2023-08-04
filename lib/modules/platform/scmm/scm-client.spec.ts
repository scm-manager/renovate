import ScmClient from './scm-client';
import type { Repo, User } from './types';
import * as httpMock from '../../../../test/http-mock';

describe(ScmClient, () => {
  const endpoint = 'http://localhost:8080/scm/api/v2';
  const token = 'validApiToken';

  const scmClient = new ScmClient(endpoint, token);

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
      defaultBranch: {
        href: `${endpoint}/config/git/default/repo/default-branch`,
      },
    },
  };

  describe(scmClient.getEndpoint, () => {
    it('should return the endpoint', () => {
      expect(scmClient.getEndpoint()).toEqual(endpoint);
    });
  });

  describe(scmClient.getCurrentUser, () => {
    it('should return the current user', async () => {
      const expectedUser: User = {
        mail: 'test@test.de',
        displayName: 'Test User',
        username: 'test',
      };

      httpMock.scope(endpoint).get('/me').reply(200, expectedUser);

      expect(await scmClient.getCurrentUser()).toEqual(expectedUser);
    });

    it.each([[401, 500]])(
      'should throw %p response',
      async (response: number) => {
        httpMock.scope(endpoint).get('/me').reply(response);
        await expect(scmClient.getCurrentUser()).rejects.toThrow();
      }
    );
  });

  describe(scmClient.getRepo, () => {
    it('should return the repo', async () => {
      httpMock
        .scope(endpoint)
        .get(`/repositories/${repo.namespace}/${repo.name}`)
        .reply(200, repo);

      expect(await scmClient.getRepo(`${repo.namespace}/${repo.name}`)).toEqual(
        repo
      );
    });

    it.each([[401], [403], [404], [500]])(
      'should throw %p response',
      async (response: number) => {
        httpMock
          .scope(endpoint)
          .get(`/repositories/${repo.namespace}/${repo.name}`)
          .reply(response);

        await expect(
          scmClient.getRepo(`${repo.namespace}/${repo.name}`)
        ).rejects.toThrow();
      }
    );
  });

  describe(scmClient.getAllRepos, () => {
    it('should return the repo', async () => {
      httpMock
        .scope(endpoint)
        .get('/repositories?pageSize=1000000')
        .reply(200, {
          page: 0,
          pageTotal: 1,
          _embedded: { repositories: [repo] },
        });

      expect(await scmClient.getAllRepos()).toEqual([repo]);
    });

    it.each([[401], [403], [500]])(
      'should throw %p response',
      async (response: number) => {
        httpMock
          .scope(endpoint)
          .get('/repositories?pageSize=1000000')
          .reply(response);

        await expect(scmClient.getAllRepos()).rejects.toThrow();
      }
    );
  });

  describe(scmClient.getDefaultBranch, () => {
    it('should return the repo', async () => {
      httpMock
        .scope(endpoint)
        .get('/config/git/default/repo/default-branch')
        .reply(200, {
          defaultBranch: 'develop',
        });

      expect(await scmClient.getDefaultBranch(repo)).toEqual('develop');
    });

    it.each([[401], [403], [404], [500]])(
      'should throw %p response',
      async (response: number) => {
        httpMock
          .scope(endpoint)
          .get('/config/git/default/repo/default-branch')
          .reply(response);

        await expect(scmClient.getDefaultBranch(repo)).rejects.toThrow();
      }
    );
  });
});
