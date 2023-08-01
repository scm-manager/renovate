import type {
  Branch,
  Comment,
  CommitStatus,
  PR,
  PRCreateParams,
  PRUpdateParams,
  Repo,
  RepoContents,
  User,
} from './types';
import got, {OptionsOfJSONResponseBody} from "got";
import type {Pr} from "../types";

const API_PATH = 'https://ecosystem.cloudogu.com/scm/api/v2';

const urlEscape = (raw: string): string => encodeURIComponent(raw);

export async function getCurrentUser(
  options: OptionsOfJSONResponseBody
): Promise<User> {
  const url = `${API_PATH}/me`;
  const res = await got(url, options).json();
  return Promise.resolve(res);
}

export async function searchRepos(
  options: OptionsOfJSONResponseBody
): Promise<Repo[]> {
  const url = `${API_PATH}/repositories?pageSize=9999&page=0`;
  const res = await got(url, options).json();

  return Promise.resolve(res._embedded.repositories);
}

export async function getRepo(
  repoPath: string,
  options: OptionsOfJSONResponseBody
): Promise<Repo> {
  const url = `${API_PATH}/repositories/${repoPath}`;
  const res = await got(url, options).json();
  return Promise.resolve(res);
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

export async function createPR(
  repoPath: string,
  params: PRCreateParams,
  options: OptionsOfJSONResponseBody
): Promise<PR> {
  const url = `${API_PATH}/pull-requests/${repoPath}`;
  const res = await got.post(url, {
    ...options,
    headers: {
      "Content-Type": "application/vnd.scmm-pullrequest+json;v=2"
    },
    json: params,
  }).json();

  return Promise.resolve(res);
}

export async function updatePR(
  repoPath: string,
  idx: number,
  params: PRUpdateParams,
  options: OptionsOfJSONResponseBody
): Promise<void> {
  const url = `${API_PATH}/pull-requests/${repoPath}/${idx}`;
  await got.post(url, {
    ...options,
    json: params,
  });

  return Promise.resolve({});
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

export async function getPR(
  repoPath: string,
  idx: number,
  options: OptionsOfJSONResponseBody
): Promise<PR> {
  const url = `${API_PATH}/pull-requests/${repoPath}/${idx}`;
  const res = await got(url, options).json();
  return Promise.resolve(res);
}

export async function searchPRs(
  repoPath: string,
  options: OptionsOfJSONResponseBody
): Promise<Pr[]> {
  const url = `${API_PATH}/pull-requests/${repoPath}/?status=IN_PROGRESS&page=0&pageSize=9999`;
  const res = await got(url, options).json();

  //TODO add mapping to renovate pr schema
  return Promise.resolve([]);
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

  return {name: "develop", commit: { id: "a756ed3d997a894b9ffe623e8f96df107674a904", author: {username: "test", displayName: "test"}}};
}
