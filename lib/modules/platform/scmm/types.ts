export type PRState = 'open' | 'merged' | 'rejected';
export type CommitStatusType =
  | 'pending'
  | 'success'
  | 'error'
  | 'failure'
  | 'warning'
  | 'unknown';
export type PRMergeMethod = 'merge-commit' | 'rebase' | 'fast-forward-if-possible' | 'squash';

export interface PR {
  number: number;
  status: PRState;
  title: string;
  description: string;
  created_at: string;
  closed_at: string;
  source: string
  target: string;
  reviewers?: any[];
  author?: { username?: string };
}

export interface User {
  mail?: string;
  displayName: string;
  username: string;
}

export interface Repo {
  id: number;
  namespace: string;
  name: string;
  _links: any[]
}

export interface RepoContents {
  path: string;
  content?: string;
  contentString?: string;
}

export interface Comment {
  id: number;
  body: string;
}

export interface Label {
  id: number;
  name: string;
  description: string;
  color: string;
}

export interface Branch {
  name: string;
  commit: Commit;
}

export interface Commit {
  id: string;
  author: User;
}

export interface CommitStatus {
  id: number;
  description: string;
}

export interface PRCreateParams extends PRUpdateParams {
  source: string;
  target: string;
}

export interface PRUpdateParams {
  title: string;
  description?: string;
  assignees?: string[];
  status?: PRState;
}
