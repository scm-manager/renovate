import type {
  PullRequest,
  PullRequestCreateParams,
  PullRequestUpdateParams,
  Repo,
  User,
  PullRequestPage,
  Page,
  Link,
  RepoPage,
} from './types';
import type { AxiosInstance } from 'axios';
import axios from 'axios';

const URLS = {
  ME: 'me',
  ALLREPOS: 'repositories',
  REPO: (repoPath: string) => `repositories/${repoPath}`,
  REPOFILE: (repoPath: string, revision: string, escapedFilePath: string) =>
    `${URLS.REPO(repoPath)}/content/${revision}/${escapedFilePath}`,
  PULLREQUESTS: (repoPath: string) => `pull-requests/${repoPath}`,
  PULLREQUESTBYID: (repoPath: string, id: number) =>
    `pull-requests/${repoPath}/${id}`,
};

const CONTENT_TYPES = {
  PULLREQUESTS: 'application/vnd.scmm-pullrequest+json;v=2',
};

//TODO Wrap axios error, so that the axios dependency does not leak to users of the ScmmClient
export default class ScmClient {
  private httpClient: AxiosInstance;

  constructor(endpoint: string, token: string) {
    this.httpClient = axios.create({
      baseURL: endpoint,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: '*',
        'X-Scm-Client': 'WUI',
      },
    });
  }

  public getEndpoint(): string {
    if (!this.httpClient.defaults.baseURL) {
      throw new Error('BaseURL is not defined');
    }

    return this.httpClient.defaults.baseURL;
  }

  public async getCurrentUser(): Promise<User> {
    const response = await this.httpClient.get<User>(URLS.ME);
    return response.data;
  }

  public async getRepo(repoPath: string): Promise<Repo> {
    const response = await this.httpClient.get<Repo>(URLS.REPO(repoPath));
    return response.data;
  }

  public async getAllRepos(): Promise<Repo[]> {
    const response = await this.httpClient.get<Page<RepoPage>>(URLS.ALLREPOS, {
      params: { pageSize: 1000000 },
    });

    return response.data._embedded.repositories;
  }

  public async getDefaultBranch(repo: Repo): Promise<string> {
    const defaultBranchUrl = repo._links['defaultBranch'] as Link;
    const response = await this.httpClient.get<{ defaultBranch: string }>(
      defaultBranchUrl.href,
      { baseURL: undefined }
    );

    return response.data.defaultBranch;
  }

  public async getAllRepoPrs(repoPath: string): Promise<PullRequest[]> {
    const response = await this.httpClient.get<Page<PullRequestPage>>(
      URLS.PULLREQUESTS(repoPath),
      {
        params: { status: 'ALL', pageSize: 1000000 },
      }
    );
    return response.data._embedded.pullRequests;
  }

  public async getRepoPr(repoPath: string, id: number): Promise<PullRequest> {
    const response = await this.httpClient.get<PullRequest>(
      URLS.PULLREQUESTBYID(repoPath, id)
    );

    return response.data;
  }

  public async createPr(
    repoPath: string,
    params: PullRequestCreateParams
  ): Promise<PullRequest> {
    const createPrResponse = await this.httpClient.post(
      URLS.PULLREQUESTS(repoPath),
      params,
      {
        headers: {
          'Content-Type': CONTENT_TYPES.PULLREQUESTS,
        },
      }
    );

    const getCreatedPrResponse = await this.httpClient.get<PullRequest>(
      createPrResponse.headers.location
    );

    return getCreatedPrResponse.data;
  }

  public async updatePr(
    repoPath: string,
    id: number,
    params: PullRequestUpdateParams
  ) {
    await this.httpClient.put(URLS.PULLREQUESTBYID(repoPath, id), params, {
      headers: {
        'Content-Type': CONTENT_TYPES.PULLREQUESTS,
      },
    });
  }
}
