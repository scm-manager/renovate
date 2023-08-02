import type { Pr as RenovatePr } from '../types';
import type { PullRequest as SCMPullRequest } from './types';

export function mapPrFromScmToRenovate(pr: SCMPullRequest): RenovatePr {
  return {
    sourceBranch: pr.source,
    createdAt: pr.creationDate,
    closedAt: pr.closeDate,
    hasAssignees: pr.reviewer !== undefined && pr.reviewer.length > 0,
    labels: pr.labels,
    number: parseInt(pr.id),
    reviewers: pr.reviewer
      ? pr.reviewer.map((review) => review.displayName)
      : [],
    //TODO is this correct
    state: pr.status,
    title: pr.title,
    isDraft: pr.status === 'DRAFT',
  };
}
