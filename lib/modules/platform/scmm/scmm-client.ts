import type {
  Branch,
  Comment,
  CommitStatus,
  PullRequest,
  PullRequestCreateParams,
  PullRequestUpdateParams,
  Repo,
  RepoContents,
  User,
  PullRequestPage,
  Page,
  Link,
} from './types';
import got, { OptionsOfJSONResponseBody } from 'got';
import type { AxiosInstance } from 'axios';
import axios from 'axios';

const URLS = {
  ME: 'me',
  REPO: (repoPath: string) => `repositories/${repoPath}`,
  PULLREQUESTS: (repoPath: string) => `pull-requests/${repoPath}`,
  PULLREQUESTBYID: (repoPath: string, id: number) =>
    `pull-requests/${repoPath}/${id}`,
};

const CONTENT_TYPES = {
  PULLREQUESTS: 'application/vnd.scmm-pullrequest+json;v=2',
};

//TODO Error Handling
export class ScmmClient {
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
        //TODO is pageSize 9999 good enough?
        params: { status: 'ALL', pageSize: 9999 },
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

const API_PATH = 'unsinn';
const urlEscape = (raw: string): string => encodeURIComponent(raw);

export async function searchRepos(
  options: OptionsOfJSONResponseBody
): Promise<Repo[]> {
  const url = `${API_PATH}/repositories?pageSize=9999&page=0`;
  const res = await got(url, options).json();

  return Promise.resolve(res._embedded.repositories);
}

export async function getRepoContents(
  repoPath: string,
  filePath: string,
  ref: string | null,
  options: OptionsOfJSONResponseBody
): Promise<RepoContents> {
  const url = `${API_PATH}/repositories/${repoPath}/content/${ref}/${urlEscape(
    filePath
  )}`;
  const res = await got(url, options).json();

  if (res.body.content) {
    res.body.contentString = Buffer.from(res.body.content, 'base64').toString();
  }

  return Promise.resolve(res);
}

export async function closePR(
  repoPath: string,
  idx: number,
  options: OptionsOfJSONResponseBody
): Promise<void> {
  const url = `${API_PATH}/pull-requests/${repoPath}/${idx}/reject`;
  await got.post(url, options);
}

export async function mergePR(
  repoPath: string,
  idx: number,
  options: OptionsOfJSONResponseBody
): Promise<void> {
  const url = `${API_PATH}/pull-requests/${repoPath}/${idx}/merge`;
  await got.post(url, options);
}

export async function createComment(
  repoPath: string,
  prId: number,
  body: string,
  options: OptionsOfJSONResponseBody
): Promise<Comment> {
  // Nothing
  return Promise.resolve({});
}

export async function updateComment(
  repoPath: string,
  idx: number,
  body: string,
  options: OptionsOfJSONResponseBody
): Promise<Comment> {
  // Nothing
  return Promise.resolve({});
}

export async function deleteComment(
  repoPath: string,
  idx: number,
  options: OptionsOfJSONResponseBody
): Promise<void> {
  // Nothing
  return Promise.resolve({});
}

export async function getComments(
  repoPath: string,
  issue: number,
  options: OptionsOfJSONResponseBody
): Promise<Comment[]> {
  // Nothing
  return Promise.resolve({});
}

export async function createCommitStatus(
  repoPath: string,
  branchCommit: string,
  options: OptionsOfJSONResponseBody
): Promise<CommitStatus> {
  // Nothing
  return Promise.resolve({});
}

export async function getBranch(
  repoPath: string,
  branchName: string,
  options: OptionsOfJSONResponseBody
): Promise<Branch> {
  const url = `${API_PATH}/repositories/${repoPath}/branches/develop`;
  const res = await got(url, options).json();

  return {
    name: 'develop',
    commit: {
      id: 'a756ed3d997a894b9ffe623e8f96df107674a904',
      author: { username: 'test', displayName: 'test' },
    },
  };
}
