import { AllManagersListLiteral } from '../../manager-list.generated';
import { getManagers } from '../../modules/manager';
import { getCustomManagers } from '../../modules/manager/custom';
import { getPlatformList } from '../../modules/platform';
import { getVersioningList } from '../../modules/versioning';
import { supportedDatasources } from '../presets/internal/merge-confidence';
import { type RenovateOptions, UpdateTypesOptions } from '../types';

const options: RenovateOptions[] = [
  {
    name: 'mode',
    description: 'Mode of operation.',
    type: 'string',
    default: 'full',
    allowedValues: ['full', 'silent'],
  },
  {
    name: 'allowedHeaders',
    description:
      'List of allowed patterns for header names in repository hostRules config.',
    type: 'array',
    default: ['X-*'],
    subType: 'string',
    globalOnly: true,
    patternMatch: true,
  },
  {
    name: 'autodiscoverRepoOrder',
    description:
      'The order method for autodiscover server side repository search.',
    type: 'string',
    default: null,
    globalOnly: true,
    allowedValues: ['asc', 'desc'],
    supportedPlatforms: ['forgejo', 'gitea'],
  },
  {
    name: 'autodiscoverRepoSort',
    description:
      'The sort method for autodiscover server side repository search.',
    type: 'string',
    default: null,
    globalOnly: true,
    allowedValues: ['alpha', 'created', 'updated', 'size', 'id'],
    supportedPlatforms: ['forgejo', 'gitea'],
  },
  {
    name: 'allowedEnv',
    description:
      'List of allowed patterns for environment variable names in repository env config.',
    type: 'array',
    default: [],
    subType: 'string',
    globalOnly: true,
    patternMatch: true,
    mergeable: true,
  },
  {
    name: 'detectGlobalManagerConfig',
    description:
      'If `true`, Renovate tries to detect global manager configuration from the file system.',
    type: 'boolean',
    default: false,
    globalOnly: true,
  },
  {
    name: 'detectHostRulesFromEnv',
    description:
      'If `true`, Renovate tries to detect host rules from environment variables.',
    type: 'boolean',
    default: false,
    globalOnly: true,
  },
  {
    name: 'mergeConfidenceEndpoint',
    description:
      'If set, Renovate will query this API for Merge Confidence data.',
    stage: 'global',
    type: 'string',
    default: 'https://developer.mend.io/',
    advancedUse: true,
    globalOnly: true,
  },
  {
    name: 'mergeConfidenceDatasources',
    description:
      'If set, Renovate will query the merge-confidence JSON API only for datasources that are part of this list.',
    stage: 'global',
    allowedValues: supportedDatasources,
    default: supportedDatasources,
    type: 'array',
    subType: 'string',
    globalOnly: true,
  },
  {
    name: 'useCloudMetadataServices',
    description:
      'If `false`, Renovate does not try to access cloud metadata services.',
    type: 'boolean',
    default: true,
    globalOnly: true,
  },
  {
    name: 'userAgent',
    description:
      'If set to any string, Renovate will use this as the `user-agent` it sends with HTTP requests.',
    type: 'string',
    default: null,
    globalOnly: true,
  },
  {
    name: 'allowedCommands',
    description:
      'A list of regular expressions that decide which commands are allowed in post-upgrade tasks.',
    type: 'array',
    subType: 'string',
    default: [],
    globalOnly: true,
  },
  {
    name: 'bumpVersions',
    description:
      'A list of bumpVersion config options to bump generic version numbers.',
    type: 'array',
    subType: 'object',
    default: [],
    cli: false,
    env: false,
    experimental: true,
  },
  {
    name: 'bumpType',
    description:
      'The semver level to use when bumping versions. This is used by the `bumpVersions` feature.',
    type: 'string',
    parents: ['bumpVersions'],
  },
  {
    name: 'filePatterns',
    description:
      'A list of patterns to match files that contain the version string.',
    type: 'array',
    subType: 'string',
    parents: ['bumpVersions'],
  },
  {
    name: 'name',
    description:
      'A name for the bumpVersion config. This is used for logging and debugging.',
    type: 'string',
    parents: ['bumpVersions'],
  },
  {
    name: 'postUpgradeTasks',
    description:
      'Post-upgrade tasks that are executed before a commit is made by Renovate.',
    type: 'object',
    default: {
      commands: [],
      fileFilters: [],
      executionMode: 'update',
    },
  },
  {
    name: 'commands',
    description:
      'A list of post-upgrade commands that are executed before a commit is made by Renovate.',
    type: 'array',
    subType: 'string',
    parents: ['postUpgradeTasks'],
    default: [],
    cli: false,
  },
  {
    name: 'dataFileTemplate',
    description: 'A template to create post-upgrade command data file from.',
    type: 'string',
    parents: ['postUpgradeTasks'],
    cli: false,
    env: false,
  },
  {
    name: 'fileFilters',
    description:
      'Files that match the glob pattern will be committed after running a post-upgrade task.',
    type: 'array',
    subType: 'string',
    parents: ['postUpgradeTasks'],
    default: ['**/*'],
    cli: false,
  },
  {
    name: 'format',
    description: 'Format of the custom datasource.',
    type: 'string',
    parents: ['customDatasources'],
    default: 'json',
    allowedValues: ['json', 'plain'],
    cli: false,
    env: false,
  },
  {
    name: 'executionMode',
    description:
      'Controls when the post upgrade tasks run: on every update, or once per upgrade branch.',
    type: 'string',
    parents: ['postUpgradeTasks'],
    allowedValues: ['update', 'branch'],
    default: 'update',
    cli: false,
  },
  {
    name: 'onboardingBranch',
    description:
      'Change this value to override the default onboarding branch name.',
    type: 'string',
    default: 'renovate/configure',
    globalOnly: true,
    inheritConfigSupport: true,
    cli: false,
  },
  {
    name: 'onboardingCommitMessage',
    description:
      'Change this value to override the default onboarding commit message.',
    type: 'string',
    default: null,
    globalOnly: true,
    inheritConfigSupport: true,
    cli: false,
  },
  {
    name: 'onboardingConfigFileName',
    description:
      'Change this value to override the default onboarding config file name.',
    type: 'string',
    default: 'renovate.json',
    globalOnly: true,
    inheritConfigSupport: true,
    cli: false,
  },
  {
    name: 'onboardingNoDeps',
    description: 'Onboard the repository even if no dependencies are found.',
    type: 'string',
    default: 'auto',
    allowedValues: ['auto', 'enabled', 'disabled'],
    globalOnly: true,
    inheritConfigSupport: true,
  },
  {
    name: 'onboardingPrTitle',
    description:
      'Change this value to override the default onboarding PR title.',
    type: 'string',
    default: 'Configure Renovate',
    globalOnly: true,
    inheritConfigSupport: true,
    cli: false,
  },
  {
    name: 'configMigration',
    description: 'Enable this to get config migration PRs when needed.',
    stage: 'repository',
    type: 'boolean',
    default: false,
    experimental: true,
    experimentalDescription:
      'Config migration PRs are still being improved, in particular to reduce the amount of reordering and whitespace changes.',
    experimentalIssues: [16359],
  },
  {
    name: 'productLinks',
    description: 'Links which are used in PRs, issues and comments.',
    type: 'object',
    globalOnly: true,
    mergeable: true,
    default: {
      documentation: 'https://docs.renovatebot.com/',
      help: 'https://github.com/renovatebot/renovate/discussions',
      homepage: 'https://github.com/renovatebot/renovate',
    },
    additionalProperties: {
      type: 'string',
      format: 'uri',
    },
  },
  {
    name: 'secrets',
    description: 'Object which holds secret name/value pairs.',
    type: 'object',
    globalOnly: true,
    mergeable: true,
    default: {},
    additionalProperties: {
      type: 'string',
    },
  },
  {
    name: 'variables',
    description: 'Object which holds variable name/value pairs.',
    type: 'object',
    globalOnly: true,
    mergeable: true,
    default: {},
    additionalProperties: {
      type: 'string',
    },
  },
  {
    name: 'statusCheckNames',
    description: 'Custom strings to use as status check names.',
    type: 'object',
    mergeable: true,
    advancedUse: true,
    default: {
      artifactError: 'renovate/artifacts',
      configValidation: 'renovate/config-validation',
      mergeConfidence: 'renovate/merge-confidence',
      minimumReleaseAge: 'renovate/stability-days',
    },
  },
  {
    name: 'extends',
    description: 'Configuration presets to use or extend.',
    stage: 'package',
    type: 'array',
    subType: 'string',
    allowString: true,
    cli: false,
  },
  {
    name: 'ignorePresets',
    description:
      'A list of presets to ignore, including any that are nested inside an `extends` array.',
    stage: 'package',
    type: 'array',
    subType: 'string',
    allowString: true,
    cli: false,
  },
  {
    name: 'migratePresets',
    description:
      'Define presets here which have been removed or renamed and should be migrated automatically.',
    type: 'object',
    globalOnly: true,
    default: {},
    additionalProperties: {
      type: 'string',
    },
  },
  {
    name: 'presetCachePersistence',
    description: 'Cache resolved presets in package cache.',
    type: 'boolean',
    default: false,
    globalOnly: true,
  },
  {
    name: 'globalExtends',
    description:
      'Configuration presets to use or extend for a self-hosted config.',
    type: 'array',
    subType: 'string',
    globalOnly: true,
  },
  {
    name: 'description',
    description: 'Plain text description for a config or preset.',
    type: 'array',
    subType: 'string',
    stage: 'repository',
    allowString: true,
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'enabled',
    description: `Enable or disable corresponding functionality.`,
    stage: 'package',
    type: 'boolean',
    default: true,
    parents: [
      '.',
      'packageRules',
      ...AllManagersListLiteral,
      'hostRules',
      'vulnerabilityAlerts',
      ...UpdateTypesOptions,
    ],
  },
  {
    name: 'constraintsFiltering',
    description: 'Perform release filtering based on language constraints.',
    type: 'string',
    allowedValues: ['none', 'strict'],
    cli: false,
    default: 'none',
  },
  {
    name: 'repositoryCache',
    description:
      'This option decides if Renovate uses a JSON cache to speed up extractions.',
    globalOnly: true,
    type: 'string',
    allowedValues: ['disabled', 'enabled', 'reset'],
    stage: 'repository',
    default: 'disabled',
  },
  {
    name: 'repositoryCacheType',
    description:
      'Set the type of renovate repository cache if `repositoryCache` is enabled.',
    globalOnly: true,
    type: 'string',
    stage: 'repository',
    default: 'local',
  },
  {
    name: 'reportType',
    description: 'Set how, or if, reports should be generated.',
    globalOnly: true,
    type: 'string',
    default: null,
    experimental: true,
    allowedValues: ['logging', 'file', 's3'],
  },
  {
    name: 'reportPath',
    description:
      'Path to where the file should be written. In case of `s3` this has to be a full S3 URI.',
    globalOnly: true,
    type: 'string',
    default: null,
    experimental: true,
  },
  {
    name: 'force',
    description:
      'Any configuration set in this object will force override existing settings.',
    stage: 'package',
    globalOnly: true,
    type: 'object',
    cli: false,
    mergeable: true,
  },
  {
    name: 'forceCli',
    description:
      'Decides if CLI configuration options are moved to the `force` config section.',
    stage: 'global',
    type: 'boolean',
    default: true,
    globalOnly: true,
  },
  {
    name: 'draftPR',
    description:
      'If set to `true` then Renovate creates draft PRs, instead of normal status PRs.',
    type: 'boolean',
    default: false,
    supportedPlatforms: ['azure', 'forgejo', 'gitea', 'github', 'gitlab'],
  },
  {
    name: 'dryRun',
    description:
      'If enabled, perform a dry run by logging messages instead of creating/updating/deleting branches and PRs.',
    type: 'string',
    globalOnly: true,
    allowedValues: ['extract', 'lookup', 'full'],
    default: null,
  },
  {
    name: 'printConfig',
    description:
      'If enabled, Renovate logs the fully resolved config for each repository, plus the fully resolved presets.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'binarySource',
    description:
      'Controls how third-party tools like npm or Gradle are called: directly, via Docker sidecar containers, or via dynamic install.',
    globalOnly: true,
    type: 'string',
    allowedValues: ['global', 'docker', 'install', 'hermit'],
    default: 'install',
  },
  {
    name: 'redisUrl',
    description:
      'If set, this Redis URL will be used for caching instead of the file system.',
    stage: 'global',
    type: 'string',
    globalOnly: true,
  },
  {
    name: 'redisPrefix',
    description: 'Key prefix for redis cache entries.',
    stage: 'global',
    type: 'string',
    globalOnly: true,
  },
  {
    name: 'baseDir',
    description:
      'The base directory for Renovate to store local files, including repository files and cache. If left empty, Renovate will create its own temporary directory to use.',
    stage: 'global',
    type: 'string',
    globalOnly: true,
  },
  {
    name: 'cacheDir',
    description:
      'The directory where Renovate stores its cache. If left empty, Renovate creates a subdirectory within the `baseDir`.',
    globalOnly: true,
    type: 'string',
  },
  {
    name: 'containerbaseDir',
    description:
      'The directory where Renovate stores its containerbase cache. If left empty, Renovate creates a subdirectory within the `cacheDir`.',
    globalOnly: true,
    type: 'string',
  },
  {
    name: 'customEnvVariables',
    description:
      'Custom environment variables for child processes and sidecar Docker containers.',
    globalOnly: true,
    type: 'object',
    default: {},
  },
  {
    name: 'env',
    description:
      'Environment variables that Renovate uses when executing package manager commands.',
    type: 'object',
    default: {},
  },
  {
    name: 'customDatasources',
    description: 'Defines custom datasources for usage by managers.',
    type: 'object',
    experimental: true,
    experimentalIssues: [23286],
    default: {},
    mergeable: true,
  },
  {
    name: 'dockerChildPrefix',
    description:
      'Change this value to add a prefix to the Renovate Docker sidecar container names and labels.',
    type: 'string',
    globalOnly: true,
    default: 'renovate_',
  },
  {
    name: 'dockerCliOptions',
    description:
      'Pass CLI flags to `docker run` command when `binarySource=docker`.',
    type: 'string',
    globalOnly: true,
  },
  {
    name: 'dockerSidecarImage',
    description:
      'Change this value to override the default Renovate sidecar image.',
    type: 'string',
    default: 'ghcr.io/containerbase/sidecar:13.8.23',
    globalOnly: true,
  },
  {
    name: 'dockerUser',
    description:
      'Set the `UID` and `GID` for Docker-based binaries if you use `binarySource=docker`.',
    globalOnly: true,
    type: 'string',
  },
  {
    name: 'composerIgnorePlatformReqs',
    description:
      'Configure use of `--ignore-platform-reqs` or `--ignore-platform-req` for the Composer package manager.',
    type: 'array',
    subType: 'string',
    default: [],
  },
  {
    name: 'goGetDirs',
    description: 'Directory pattern to run `go get` on.',
    type: 'array',
    subType: 'string',
    default: ['./...'],
    supportedManagers: ['gomod'],
  },
  // Log options
  {
    name: 'logContext',
    description: 'Add a global or per-repo log context to each log entry.',
    globalOnly: true,
    type: 'string',
    default: null,
    stage: 'global',
  },
  // Onboarding
  {
    name: 'onboarding',
    description: 'Require a Configuration PR first.',
    stage: 'repository',
    type: 'boolean',
    globalOnly: true,
    inheritConfigSupport: true,
  },
  {
    name: 'onboardingConfig',
    description: 'Configuration to use for onboarding PRs.',
    stage: 'repository',
    type: 'object',
    default: { $schema: 'https://docs.renovatebot.com/renovate-schema.json' },
    globalOnly: true,
    inheritConfigSupport: true,
    mergeable: true,
  },
  {
    name: 'onboardingRebaseCheckbox',
    description:
      'Set to enable rebase/retry markdown checkbox for onboarding PRs.',
    type: 'boolean',
    default: false,
    supportedPlatforms: ['forgejo', 'gitea', 'github', 'gitlab'],
    globalOnly: true,
    experimental: true,
    experimentalIssues: [17633],
  },
  {
    name: 'forkProcessing',
    description:
      'Whether to process forked repositories. By default, all forked repositories are skipped when in `autodiscover` mode.',
    stage: 'repository',
    type: 'string',
    allowedValues: ['auto', 'enabled', 'disabled'],
    default: 'auto',
  },
  {
    name: 'includeMirrors',
    description:
      'Whether to process repositories that are mirrors. By default, repositories that are mirrors are skipped.',
    type: 'boolean',
    default: false,
    supportedPlatforms: ['gitlab'],
    globalOnly: true,
  },
  {
    name: 'forkCreation',
    description:
      'Whether to create forks as needed at runtime when running in "fork mode".',
    stage: 'repository',
    type: 'boolean',
    globalOnly: true,
    supportedPlatforms: ['github'],
    experimental: true,
    default: true,
  },
  {
    name: 'forkToken',
    description: 'Set a personal access token here to enable "fork mode".',
    stage: 'repository',
    type: 'string',
    globalOnly: true,
    supportedPlatforms: ['github'],
    experimental: true,
  },
  {
    name: 'forkOrg',
    description:
      'The preferred organization to create or find forked repositories, when in fork mode.',
    stage: 'repository',
    type: 'string',
    globalOnly: true,
    supportedPlatforms: ['github'],
    experimental: true,
  },
  {
    name: 'githubTokenWarn',
    description: 'Display warnings about GitHub token not being set.',
    type: 'boolean',
    default: true,
    globalOnly: true,
  },
  {
    name: 'encryptedWarning',
    description: 'Warning text to use if encrypted config is found.',
    type: 'string',
    globalOnly: true,
    advancedUse: true,
  },
  {
    name: 'inheritConfig',
    description:
      'If `true`, Renovate will inherit configuration from the `inheritConfigFileName` file in `inheritConfigRepoName`.',
    type: 'boolean',
    default: false,
    globalOnly: true,
  },
  {
    name: 'inheritConfigRepoName',
    description:
      'Renovate will look in this repo for the `inheritConfigFileName`.',
    type: 'string',
    default: '{{parentOrg}}/renovate-config',
    globalOnly: true,
  },
  {
    name: 'inheritConfigFileName',
    description:
      'Renovate will look for this config file name in the `inheritConfigRepoName`.',
    type: 'string',
    default: 'org-inherited-config.json',
    globalOnly: true,
  },
  {
    name: 'inheritConfigStrict',
    description:
      'If `true`, any `inheritedConfig` fetch error will result in an aborted run.',
    type: 'boolean',
    default: false,
    globalOnly: true,
  },
  {
    name: 'requireConfig',
    description:
      "Controls Renovate's behavior regarding repository config files such as `renovate.json`.",
    stage: 'repository',
    type: 'string',
    default: 'required',
    allowedValues: ['required', 'optional', 'ignored'],
    globalOnly: true,
    inheritConfigSupport: true,
  },
  {
    name: 'optimizeForDisabled',
    description:
      'Set to `true` to perform a check for disabled config prior to cloning.',
    stage: 'repository',
    type: 'boolean',
    default: false,
    globalOnly: true,
  },
  // Dependency Dashboard
  {
    name: 'dependencyDashboard',
    description:
      'Whether to create a "Dependency Dashboard" issue in the repository.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'dependencyDashboardApproval',
    description:
      'Controls if updates need manual approval from the Dependency Dashboard issue before PRs are created.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'dependencyDashboardAutoclose',
    description:
      'Set to `true` to let Renovate close the Dependency Dashboard issue if there are no more updates.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'dependencyDashboardTitle',
    description: 'Title for the Dependency Dashboard issue.',
    type: 'string',
    default: `Dependency Dashboard`,
  },
  {
    name: 'dependencyDashboardHeader',
    description:
      'Any text added here will be placed first in the Dependency Dashboard issue body.',
    type: 'string',
    default:
      'This issue lists Renovate updates and detected dependencies. Read the [Dependency Dashboard](https://docs.renovatebot.com/key-concepts/dashboard/) docs to learn more.',
  },
  {
    name: 'dependencyDashboardFooter',
    description:
      'Any text added here will be placed last in the Dependency Dashboard issue body, with a divider separator before it.',
    type: 'string',
  },
  {
    name: 'dependencyDashboardLabels',
    description:
      'These labels will always be applied on the Dependency Dashboard issue, even when they have been removed manually.',
    type: 'array',
    subType: 'string',
    default: null,
  },
  {
    name: 'dependencyDashboardOSVVulnerabilitySummary',
    description:
      'Control if the Dependency Dashboard issue lists CVEs supplied by [osv.dev](https://osv.dev).',
    type: 'string',
    allowedValues: ['none', 'all', 'unresolved'],
    default: 'none',
    experimental: true,
  },
  {
    name: 'configWarningReuseIssue',
    description:
      'Set this to `true` to make Renovate reuse/reopen an existing closed Config Warning issue, instead of opening a new one each time.',
    type: 'boolean',
    default: false,
  },

  // encryption
  {
    name: 'privateKey',
    description: 'Server-side private key.',
    stage: 'repository',
    type: 'string',
    replaceLineReturns: true,
    globalOnly: true,
  },
  {
    name: 'privateKeyOld',
    description: 'Secondary or old private key to try.',
    stage: 'repository',
    type: 'string',
    replaceLineReturns: true,
    globalOnly: true,
  },
  {
    name: 'privateKeyPath',
    description: 'Path to the Server-side private key.',
    stage: 'repository',
    type: 'string',
    globalOnly: true,
  },
  {
    name: 'privateKeyPathOld',
    description: 'Path to the Server-side old private key.',
    stage: 'repository',
    type: 'string',
    globalOnly: true,
  },
  {
    name: 'encrypted',
    description:
      'An object containing configuration encrypted with project key.',
    stage: 'repository',
    type: 'object',
    default: null,
  },
  // Scheduling
  {
    name: 'timezone',
    description:
      'Must conform to [IANA Time Zone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) format.',
    type: 'string',
  },
  {
    name: 'schedule',
    description: 'Limit branch creation to these times of day or week.',
    type: 'array',
    subType: 'string',
    allowString: true,
    cli: true,
    env: false,
    default: ['at any time'],
  },
  {
    name: 'automergeSchedule',
    description: 'Limit automerge to these times of day or week.',
    type: 'array',
    subType: 'string',
    allowString: true,
    cli: true,
    env: false,
    default: ['at any time'],
  },
  {
    name: 'updateNotScheduled',
    description:
      'Whether to update branches when not scheduled. Renovate will not create branches outside of the schedule.',
    stage: 'branch',
    type: 'boolean',
    default: true,
  },
  // Bot administration
  {
    name: 'persistRepoData',
    description:
      'If set to `true`: keep repository data between runs instead of deleting the data.',
    type: 'boolean',
    default: false,
    globalOnly: true,
  },
  {
    name: 'exposeAllEnv',
    description:
      'Set this to `true` to allow passing of all environment variables to package managers.',
    globalOnly: true,
    type: 'boolean',
    default: false,
  },
  {
    name: 'allowPlugins',
    description:
      'Set this to `true` if repositories are allowed to run install plugins.',
    globalOnly: true,
    type: 'boolean',
    default: false,
  },
  {
    name: 'allowScripts',
    description:
      'Set this to `true` if repositories are allowed to run install scripts.',
    globalOnly: true,
    type: 'boolean',
    default: false,
  },
  {
    name: 'allowCustomCrateRegistries',
    description: 'Set this to `true` to allow custom crate registries.',
    globalOnly: true,
    type: 'boolean',
    default: false,
  },
  {
    name: 'ignorePlugins',
    description:
      'Set this to `true` if `allowPlugins=true` but you wish to skip running plugins when updating lock files.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'ignoreScripts',
    description:
      'Set this to `false` if `allowScripts=true` and you wish to run scripts when updating lock files.',
    type: 'boolean',
    default: true,
    supportedManagers: ['npm', 'bun', 'composer', 'copier'],
  },
  {
    name: 'platform',
    description: 'Platform type of repository.',
    type: 'string',
    allowedValues: getPlatformList(),
    default: 'github',
    globalOnly: true,
  },
  {
    name: 'endpoint',
    description: 'Custom endpoint to use.',
    type: 'string',
    globalOnly: true,
    default: null,
  },
  {
    name: 'token',
    description: 'Repository Auth Token.',
    stage: 'repository',
    type: 'string',
    globalOnly: true,
  },
  {
    name: 'username',
    description: 'Username for authentication.',
    stage: 'repository',
    type: 'string',
    supportedPlatforms: ['azure', 'bitbucket', 'bitbucket-server'],
    globalOnly: true,
  },
  {
    name: 'password',
    description: 'Password for authentication.',
    stage: 'repository',
    type: 'string',
    supportedPlatforms: ['azure', 'bitbucket', 'bitbucket-server'],
    globalOnly: true,
  },
  {
    name: 'npmrc',
    description:
      'String copy of `.npmrc` file. Use `\\n` instead of line breaks.',
    stage: 'branch',
    type: 'string',
  },
  {
    name: 'npmrcMerge',
    description:
      'Whether to merge `config.npmrc` with repo `.npmrc` content if both are found.',
    stage: 'branch',
    type: 'boolean',
    default: false,
  },
  {
    name: 'npmToken',
    description: 'npm token used to authenticate with the default registry.',
    stage: 'branch',
    type: 'string',
  },
  {
    name: 'updateLockFiles',
    description: 'Set to `false` to disable lock file updating.',
    type: 'boolean',
    default: true,
    supportedManagers: ['npm'],
  },
  {
    name: 'skipInstalls',
    description:
      'Skip installing modules/dependencies if lock file updating is possible without a full install.',
    type: 'boolean',
    default: null,
  },
  {
    name: 'autodiscover',
    description: 'Autodiscover all repositories.',
    stage: 'global',
    type: 'boolean',
    default: false,
    globalOnly: true,
  },
  {
    name: 'autodiscoverFilter',
    description: 'Filter the list of autodiscovered repositories.',
    stage: 'global',
    type: 'array',
    subType: 'string',
    allowString: true,
    default: null,
    globalOnly: true,
  },
  {
    name: 'autodiscoverNamespaces',
    description:
      'Filter the list of autodiscovered repositories by namespaces.',
    stage: 'global',
    type: 'array',
    subType: 'string',
    default: null,
    globalOnly: true,
    supportedPlatforms: ['forgejo', 'gitea', 'gitlab'],
  },
  {
    name: 'autodiscoverProjects',
    description:
      'Filter the list of autodiscovered repositories by project names.',
    stage: 'global',
    type: 'array',
    subType: 'string',
    default: null,
    globalOnly: true,
    supportedPlatforms: ['bitbucket'],
    patternMatch: true,
  },
  {
    name: 'autodiscoverTopics',
    description: 'Filter the list of autodiscovered repositories by topics.',
    stage: 'global',
    type: 'array',
    subType: 'string',
    default: null,
    globalOnly: true,
    supportedPlatforms: ['forgejo', 'gitea', 'github', 'gitlab'],
  },
  {
    name: 'prCommitsPerRunLimit',
    description:
      'Set the maximum number of commits per Renovate run. By default there is no limit.',
    stage: 'global',
    type: 'integer',
    default: 0,
    globalOnly: true,
  },
  {
    name: 'repositories',
    description: 'List of Repositories.',
    stage: 'global',
    type: 'array',
    subType: 'string',
    cli: false,
    globalOnly: true,
  },
  {
    name: 'baseBranchPatterns',
    description:
      'List of one or more custom base branches defined as exact strings and/or via regex expressions.',
    type: 'array',
    subType: 'string',
    stage: 'package',
    cli: false,
  },
  {
    name: 'useBaseBranchConfig',
    description:
      'Whether to read configuration from `baseBranches` instead of only the default branch.',
    type: 'string',
    allowedValues: ['merge', 'none'],
    default: 'none',
  },
  {
    name: 'gitAuthor',
    description:
      'Author to use for Git commits. Must conform to [RFC5322](https://datatracker.ietf.org/doc/html/rfc5322).',
    type: 'string',
  },
  {
    name: 'gitPrivateKey',
    description: 'PGP key to use for signing Git commits.',
    type: 'string',
    cli: false,
    globalOnly: true,
    stage: 'global',
  },
  {
    name: 'gitIgnoredAuthors',
    description:
      'Git authors which are ignored by Renovate. Must conform to [RFC5322](https://datatracker.ietf.org/doc/html/rfc5322).',
    type: 'array',
    subType: 'string',
    stage: 'repository',
  },
  {
    name: 'gitTimeout',
    description:
      'Configure the timeout with a number of milliseconds to wait for a Git task.',
    type: 'integer',
    globalOnly: true,
    default: 0,
  },
  {
    name: 'enabledManagers',
    description:
      'A list of package managers to enable. Only managers on the list are enabled.',
    type: 'array',
    subType: 'string',
    mergeable: false,
    stage: 'repository',
  },
  {
    name: 'includePaths',
    description: 'Include package files only within these defined paths.',
    type: 'array',
    subType: 'string',
    stage: 'repository',
    default: [],
  },
  {
    name: 'ignorePaths',
    description:
      'Skip any package file whose path matches one of these. Can be a string or glob pattern.',
    type: 'array',
    mergeable: false,
    subType: 'string',
    stage: 'repository',
    default: ['**/node_modules/**', '**/bower_components/**'],
  },
  {
    name: 'excludeCommitPaths',
    description:
      'A file matching any of these glob patterns will not be committed, even if the file has been updated.',
    type: 'array',
    subType: 'string',
    default: [],
    advancedUse: true,
  },
  {
    name: 'executionTimeout',
    description:
      'Default execution timeout in minutes for child processes Renovate creates.',
    type: 'integer',
    default: 15,
    globalOnly: true,
  },
  {
    name: 'registryAliases',
    description: 'Aliases for registries.',
    mergeable: true,
    type: 'object',
    default: {},
    additionalProperties: {
      type: 'string',
    },
    supportedManagers: [
      'ansible',
      'bitbucket-pipelines',
      'buildpacks',
      'crossplane',
      'devcontainer',
      'docker-compose',
      'dockerfile',
      'droneci',
      'gitlabci',
      'helm-requirements',
      'helmfile',
      'helmv3',
      'kubernetes',
      'kustomize',
      'maven',
      'terraform',
      'vendir',
      'woodpecker',
    ],
  },
  {
    name: 'defaultRegistryUrls',
    description:
      'List of registry URLs to use as the default for a datasource.',
    type: 'array',
    subType: 'string',
    default: null,
    stage: 'branch',
    cli: false,
    env: false,
  },
  {
    name: 'defaultRegistryUrlTemplate',
    description:
      'Template for generating a `defaultRegistryUrl` for custom datasource.',
    type: 'string',
    default: '',
    parents: ['customDatasources'],
    cli: false,
    env: false,
  },
  {
    name: 'registryUrls',
    description:
      'List of URLs to try for dependency lookup. Package manager specific.',
    type: 'array',
    subType: 'string',
    default: null,
    stage: 'branch',
    cli: false,
    env: false,
  },
  {
    name: 'extractVersion',
    description:
      "A regex (`re2`) to extract a version from a datasource's raw version string.",
    type: 'string',
    format: 'regex',
    cli: false,
    env: false,
  },
  {
    name: 'versionCompatibility',
    description:
      'A regex (`re2`) with named capture groups to show how version and compatibility are split from a raw version string.',
    type: 'string',
    format: 'regex',
    cli: false,
    env: false,
  },
  {
    name: 'versioning',
    description: 'Versioning to use for filtering and comparisons.',
    type: 'string',
    allowedValues: getVersioningList(),
    cli: false,
    env: false,
  },
  {
    name: 'azureWorkItemId',
    description:
      'The id of an existing work item on Azure Boards to link to each PR.',
    type: 'integer',
    default: 0,
    supportedPlatforms: ['azure'],
  },
  {
    name: 'autoApprove',
    description: 'Set to `true` to automatically approve PRs.',
    type: 'boolean',
    default: false,
    supportedPlatforms: ['azure', 'gerrit', 'gitlab'],
  },
  // depType
  {
    name: 'ignoreDeps',
    description: 'Dependencies to ignore.',
    type: 'array',
    subType: 'string',
    stage: 'package',
    mergeable: true,
  },
  {
    name: 'updateInternalDeps',
    description:
      'Whether to update internal dep versions in a monorepo. Works on Yarn Workspaces.',
    type: 'boolean',
    default: false,
    stage: 'package',
  },
  {
    name: 'packageRules',
    description: 'Rules for matching packages.',
    type: 'array',
    stage: 'package',
    mergeable: true,
  },
  {
    name: 'matchCurrentAge',
    description:
      'Matches the current age of the package derived from its release timestamp. Valid only within a `packageRules` object.',
    type: 'string',
    parents: ['packageRules'],
    stage: 'package',
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchCategories',
    description:
      'List of categories to match (for example: `["python"]`). Valid only within a `packageRules` object.',
    type: 'array',
    subType: 'string',
    allowString: true,
    parents: ['packageRules'],
    stage: 'package',
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchRepositories',
    description:
      'List of repositories to match (e.g. `["**/*-archived"]`). Valid only within a `packageRules` object.',
    type: 'array',
    subType: 'string',
    allowString: true,
    stage: 'package',
    parents: ['packageRules'],
    mergeable: true,
    cli: false,
    env: false,
    patternMatch: true,
  },
  {
    name: 'matchBaseBranches',
    description:
      'List of strings containing exact matches (e.g. `["main"]`) and/or regex expressions (e.g. `["/^release/.*/"]`). Valid only within a `packageRules` object.',
    type: 'array',
    subType: 'string',
    allowString: true,
    parents: ['packageRules'],
    stage: 'package',
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchManagers',
    description:
      'List of package managers to match (e.g. `["pipenv"]`). Valid only within a `packageRules` object.',
    type: 'array',
    subType: 'string',
    allowString: true,
    parents: ['packageRules'],
    stage: 'package',
    mergeable: true,
    patternMatch: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchDatasources',
    description:
      'List of datasources to match (e.g. `["orb"]`). Valid only within a `packageRules` object.',
    type: 'array',
    subType: 'string',
    allowString: true,
    parents: ['packageRules'],
    stage: 'package',
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchDepTypes',
    description:
      'List of depTypes to match (e.g. [`peerDependencies`]). Valid only within `packageRules` object.',
    type: 'array',
    subType: 'string',
    allowString: true,
    parents: ['packageRules'],
    stage: 'package',
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchPackageNames',
    description:
      'Package names to match. Valid only within a `packageRules` object.',
    type: 'array',
    subType: 'string',
    allowString: true,
    stage: 'package',
    parents: ['packageRules'],
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchDepNames',
    description:
      'Dep names to match. Valid only within a `packageRules` object.',
    type: 'array',
    subType: 'string',
    allowString: true,
    stage: 'package',
    parents: ['packageRules'],
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchCurrentValue',
    description:
      'A regex or glob pattern to match against the raw `currentValue` string of a dependency. Valid only within a `packageRules` object.',
    type: 'string',
    stage: 'package',
    parents: ['packageRules'],
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchCurrentVersion',
    description:
      'A version, or range of versions, to match against the current version of a package. Valid only within a `packageRules` object.',
    type: 'string',
    stage: 'package',
    parents: ['packageRules'],
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchNewValue',
    description:
      'A regex or glob pattern to match against the raw `newValue` string of a dependency. Valid only within a `packageRules` object.',
    type: 'string',
    stage: 'package',
    parents: ['packageRules'],
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'sourceUrl',
    description: 'The source URL of the package.',
    type: 'string',
    parents: ['packageRules'],
    cli: false,
    env: false,
  },
  {
    name: 'sourceDirectory',
    description:
      'The source directory in which the package is present at its source.',
    type: 'string',
    parents: ['packageRules'],
    cli: false,
    env: false,
  },
  {
    name: 'matchSourceUrls',
    description:
      'A list of exact match URLs (or URL patterns) to match sourceUrl against.',
    type: 'array',
    subType: 'string',
    allowString: true,
    stage: 'package',
    parents: ['packageRules'],
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'autoReplaceGlobalMatch',
    description:
      'Control whether replacement regular expressions are global matches or only the first match.',
    type: 'boolean',
    default: true,
  },
  {
    name: 'replacementName',
    description:
      'The name of the new dependency that replaces the old deprecated dependency.',
    type: 'string',
    stage: 'package',
    parents: ['packageRules'],
    cli: false,
    env: false,
  },
  {
    name: 'replacementNameTemplate',
    description: 'Controls what the replacement package name.',
    type: 'string',
    default: '{{{packageName}}}',
    stage: 'package',
    parents: ['packageRules'],
    cli: false,
    env: false,
  },
  {
    name: 'replacementVersion',
    description:
      'The version of the new dependency that replaces the old deprecated dependency.',
    type: 'string',
    stage: 'package',
    parents: ['packageRules'],
    cli: false,
    env: false,
  },
  {
    name: 'replacementVersionTemplate',
    description:
      'Template field for the version of the new dependency that replaces the old deprecated dependency.',
    type: 'string',
    stage: 'package',
    parents: ['packageRules'],
    cli: false,
    env: false,
  },
  {
    name: 'replacementApproach',
    description:
      'Select whether to perform a direct replacement or alias replacement.',
    type: 'string',
    stage: 'branch',
    allowedValues: ['replace', 'alias'],
    supportedManagers: ['npm'],
    default: 'replace',
  },
  {
    name: 'matchConfidence',
    description:
      'Merge confidence levels to match against (`low`, `neutral`, `high`, `very high`). Valid only within `packageRules` object.',
    type: 'array',
    subType: 'string',
    allowedValues: ['low', 'neutral', 'high', 'very high'],
    allowString: true,
    stage: 'package',
    parents: ['packageRules'],
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchUpdateTypes',
    description:
      'Update types to match against (`major`, `minor`, `pin`, `pinDigest`, etc). Valid only within `packageRules` object.',
    type: 'array',
    subType: 'string',
    allowedValues: [
      'major',
      'minor',
      'patch',
      'pin',
      'pinDigest',
      'digest',
      'lockFileMaintenance',
      'rollback',
      'bump',
      'replacement',
    ],
    allowString: true,
    stage: 'package',
    parents: ['packageRules'],
    mergeable: true,
    cli: false,
    env: false,
  },
  {
    name: 'matchFileNames',
    description:
      'List of strings to do an exact match against package and lock files with full path. Only works inside a `packageRules` object.',
    type: 'array',
    subType: 'string',
    stage: 'repository',
    parents: ['packageRules'],
    cli: false,
    env: false,
  },
  {
    name: 'matchJsonata',
    description:
      'A JSONata expression to match against the full config object. Valid only within a `packageRules` object.',
    type: 'array',
    subType: 'string',
    stage: 'package',
    parents: ['packageRules'],
    mergeable: true,
    cli: false,
    env: false,
  },
  // Version behavior
  {
    name: 'allowedVersions',
    description:
      'A version range or regex pattern capturing allowed versions for dependencies.',
    type: 'string',
    parents: ['packageRules'],
    stage: 'package',
    cli: false,
    env: false,
  },
  {
    name: 'changelogUrl',
    description:
      'Set a custom URL for the changelog. Renovate will put this URL in the PR body text.',
    type: 'string',
    stage: 'pr',
    parents: ['packageRules'],
    cli: false,
    env: false,
  },
  {
    name: 'pinDigests',
    description: 'Whether to add digests to Dockerfile source images.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'separateMajorMinor',
    description:
      'If set to `false`, Renovate will upgrade dependencies to their latest release only. Renovate will not separate major or minor branches.',
    type: 'boolean',
    default: true,
  },
  {
    name: 'separateMultipleMajor',
    description:
      'If set to `true`, PRs will be raised separately for each available `major` upgrade version.',
    stage: 'package',
    type: 'boolean',
    default: false,
  },
  {
    name: 'separateMultipleMinor',
    description:
      'If set to `true`, Renovate creates separate PRs for each `minor` stream.',
    stage: 'package',
    type: 'boolean',
    default: false,
    experimental: true,
  },
  {
    name: 'separateMinorPatch',
    description:
      'If set to `true`, Renovate will separate `minor` and `patch` updates into separate branches.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'ignoreUnstable',
    description: 'Ignore versions with unstable SemVer.',
    stage: 'package',
    type: 'boolean',
    default: true,
  },
  {
    name: 'ignoreDeprecated',
    description:
      'Avoid upgrading from a non-deprecated version to a deprecated one.',
    stage: 'package',
    type: 'boolean',
    default: true,
  },
  {
    name: 'followTag',
    description: 'If defined, packages will follow this release tag exactly.',
    stage: 'package',
    type: 'string',
    cli: false,
    env: false,
    advancedUse: true,
  },
  {
    name: 'respectLatest',
    description: 'Ignore versions newer than npm "latest" version.',
    stage: 'package',
    type: 'boolean',
    default: true,
  },
  {
    name: 'rangeStrategy',
    description: 'Determines how to modify or update existing ranges.',
    type: 'string',
    default: 'auto',
    allowedValues: [
      'auto',
      'pin',
      'bump',
      'replace',
      'widen',
      'update-lockfile',
      'in-range-only',
    ],
    cli: false,
    env: false,
  },
  {
    name: 'branchPrefix',
    description: 'Prefix to use for all branch names.',
    stage: 'branch',
    type: 'string',
    default: `renovate/`,
  },
  {
    name: 'branchPrefixOld',
    description: 'Old branchPrefix value to check for existing PRs.',
    stage: 'branch',
    type: 'string',
    default: `renovate/`,
  },
  {
    name: 'bumpVersion',
    description: 'Bump the version in the package file being updated.',
    type: 'string',
    allowedValues: ['major', 'minor', 'patch', 'prerelease'],
    supportedManagers: ['helmv3', 'npm', 'nuget', 'maven', 'sbt'],
  },
  // Major/Minor/Patch
  {
    name: 'major',
    description: 'Configuration to apply when an update type is `major`.',
    stage: 'package',
    type: 'object',
    default: {},
    cli: false,
    mergeable: true,
  },
  {
    name: 'minor',
    description: 'Configuration to apply when an update type is `minor`.',
    stage: 'package',
    type: 'object',
    default: {},
    cli: false,
    mergeable: true,
  },
  {
    name: 'patch',
    description: 'Configuration to apply when an update type is `patch`.',
    stage: 'package',
    type: 'object',
    default: {},
    cli: false,
    mergeable: true,
  },
  {
    name: 'pin',
    description: 'Configuration to apply when an update type is `pin`.',
    stage: 'package',
    type: 'object',
    default: {
      rebaseWhen: 'behind-base-branch',
      groupName: 'Pin Dependencies',
      groupSlug: 'pin-dependencies',
      commitMessageAction: 'Pin',
      group: {
        commitMessageTopic: 'dependencies',
        commitMessageExtra: '',
      },
    },
    cli: false,
    mergeable: true,
  },
  {
    name: 'digest',
    description:
      'Configuration to apply when updating a digest (no change in tag/version).',
    stage: 'package',
    type: 'object',
    default: {
      branchTopic: '{{{depNameSanitized}}}-digest',
      commitMessageExtra: 'to {{newDigestShort}}',
      commitMessageTopic: '{{{depName}}} digest',
    },
    cli: false,
    mergeable: true,
  },
  {
    name: 'pinDigest',
    description:
      'Configuration to apply when pinning a digest (no change in tag/version).',
    stage: 'package',
    type: 'object',
    default: {
      groupName: 'Pin Dependencies',
      groupSlug: 'pin-dependencies',
      commitMessageAction: 'Pin',
      group: {
        commitMessageTopic: 'dependencies',
        commitMessageExtra: '',
      },
    },
    cli: false,
    mergeable: true,
  },
  {
    name: 'rollback',
    description: 'Configuration to apply when rolling back a version.',
    stage: 'package',
    type: 'object',
    default: {
      branchTopic: '{{{depNameSanitized}}}-rollback',
      commitMessageAction: 'Roll back',
      semanticCommitType: 'fix',
    },
    cli: false,
    mergeable: true,
  },
  {
    name: 'replacement',
    description: 'Configuration to apply when replacing a dependency.',
    stage: 'package',
    type: 'object',
    default: {
      branchTopic: '{{{depNameSanitized}}}-replacement',
      commitMessageAction: 'Replace',
      commitMessageExtra:
        'with {{newName}} {{#if isMajor}}{{{prettyNewMajor}}}{{else}}{{#if isSingleVersion}}{{{prettyNewVersion}}}{{else}}{{{newValue}}}{{/if}}{{/if}}',
      prBodyNotes: [
        'This is a special PR that replaces `{{{depName}}}` with the community suggested minimal stable replacement version.',
      ],
    },
    cli: false,
    mergeable: true,
  },
  // Semantic commit / Semantic release
  {
    name: 'semanticCommits',
    description: 'Enable Semantic Commit prefixes for commits and PR titles.',
    type: 'string',
    allowedValues: ['auto', 'enabled', 'disabled'],
    default: 'auto',
  },
  {
    name: 'semanticCommitType',
    description: 'Commit type to use if Semantic Commits is enabled.',
    type: 'string',
    default: 'chore',
  },
  {
    name: 'semanticCommitScope',
    description: 'Commit scope to use if Semantic Commits are enabled.',
    type: 'string',
    default: 'deps',
  },
  {
    name: 'commitMessageLowerCase',
    description: 'Lowercase PR- and commit titles.',
    type: 'string',
    allowedValues: ['auto', 'never'],
    default: 'auto',
  },
  // PR Behavior
  {
    name: 'keepUpdatedLabel',
    description:
      'If set, users can add this label to PRs to request they be kept updated with the base branch.',
    type: 'string',
    supportedPlatforms: [
      'azure',
      'forgejo',
      'gerrit',
      'gitea',
      'github',
      'gitlab',
    ],
  },
  {
    name: 'rollbackPrs',
    description:
      'Create PRs to roll back versions if the current version is not found in the registry.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'recreateWhen',
    description: 'Recreate PRs even if same ones were closed previously.',
    type: 'string',
    default: 'auto',
    allowedValues: ['auto', 'always', 'never'],
  },
  {
    name: 'rebaseWhen',
    description: 'Controls when Renovate rebases an existing branch.',
    type: 'string',
    allowedValues: [
      'auto',
      'never',
      'conflicted',
      'behind-base-branch',
      'automerging',
    ],
    default: 'auto',
  },
  {
    name: 'rebaseLabel',
    description: 'Label to request a rebase from Renovate bot.',
    type: 'string',
    default: 'rebase',
  },
  {
    name: 'stopUpdatingLabel',
    description: 'Label to make Renovate stop updating a PR.',
    type: 'string',
    default: 'stop-updating',
    supportedPlatforms: [
      'azure',
      'forgejo',
      'gerrit',
      'gitea',
      'github',
      'gitlab',
    ],
  },
  {
    name: 'minimumReleaseAge',
    description: 'Time required before a new release is considered stable.',
    type: 'string',
    default: null,
  },
  {
    name: 'abandonmentThreshold',
    description:
      'Flags packages that have not been updated within this period as abandoned.',
    type: 'string',
    default: null,
  },
  {
    name: 'dependencyDashboardReportAbandonment',
    description:
      'Controls whether abandoned packages are reported in the dependency dashboard.',
    type: 'boolean',
    default: true,
  },
  {
    name: 'internalChecksAsSuccess',
    description:
      'Whether to consider passing internal checks such as `minimumReleaseAge` when determining branch status.',
    type: 'boolean',
    default: false,
  },
  /*
   * Undocumented experimental feature
  {
    name: 'minimumConfidence',
    description:
      'Minimum Merge confidence level to filter by. Requires authentication to work.',
    type: 'string',
    allowedValues: ['low', 'neutral', 'high', 'very high'],
    default: 'low',
  },
  */
  {
    name: 'internalChecksFilter',
    description: 'When and how to filter based on internal checks.',
    type: 'string',
    allowedValues: ['strict', 'flexible', 'none'],
    default: 'strict',
  },
  {
    name: 'processEnv',
    description: 'Environment variables to be used in global config only.',
    type: 'object',
    default: {},
    globalOnly: true,
    stage: 'global',
    additionalProperties: {
      type: 'string',
    },
  },
  {
    name: 'prCreation',
    description: 'When to create the PR for a branch.',
    type: 'string',
    allowedValues: ['immediate', 'not-pending', 'status-success', 'approval'],
    default: 'immediate',
  },
  {
    name: 'prNotPendingHours',
    description: 'Timeout in hours for when `prCreation=not-pending`.',
    type: 'integer',
    default: 25,
  },
  {
    name: 'prHourlyLimit',
    description:
      'Rate limit PRs to maximum x created per hour. 0 means no limit.',
    type: 'integer',
    default: 2,
  },
  {
    name: 'prConcurrentLimit',
    description:
      'Limit to a maximum of x concurrent branches/PRs. 0 means no limit.',
    type: 'integer',
    default: 10,
  },
  {
    name: 'branchConcurrentLimit',
    description:
      'Limit to a maximum of x concurrent branches. 0 means no limit, `null` (default) inherits value from `prConcurrentLimit`.',
    type: 'integer',
    default: null, // inherit prConcurrentLimit
  },
  {
    name: 'prPriority',
    description:
      'Set sorting priority for PR creation. PRs with higher priority are created first, negative priority last.',
    type: 'integer',
    allowNegative: true,
    default: 0,
    parents: ['packageRules'],
    cli: false,
    env: false,
  },
  {
    name: 'overrideDatasource',
    description: 'Override the datasource value.',
    type: 'string',
    stage: 'package',
    parents: ['packageRules'],
    cli: false,
    env: false,
    advancedUse: true,
  },
  {
    name: 'overrideDepName',
    description: 'Override the depName value.',
    type: 'string',
    stage: 'package',
    parents: ['packageRules'],
    cli: false,
    env: false,
    advancedUse: true,
  },
  {
    name: 'overridePackageName',
    description: 'Override the packageName value.',
    type: 'string',
    stage: 'package',
    parents: ['packageRules'],
    cli: false,
    env: false,
    advancedUse: true,
  },
  {
    name: 'bbAutoResolvePrTasks',
    description:
      'The PR tasks will be automatically completed after the PR is raised.',
    type: 'boolean',
    default: false,
    supportedPlatforms: ['bitbucket'],
  },
  {
    name: 'bbUseDefaultReviewers',
    description: 'Use the default reviewers (Bitbucket only).',
    type: 'boolean',
    default: true,
    supportedPlatforms: ['bitbucket', 'bitbucket-server'],
  },
  {
    name: 'bbUseDevelopmentBranch',
    description: `Use the repository's [development branch](https://support.atlassian.com/bitbucket-cloud/docs/branch-a-repository/#The-branching-model) as the repository's default branch.`,
    type: 'boolean',
    default: false,
    supportedPlatforms: ['bitbucket'],
    globalOnly: true,
    inheritConfigSupport: true,
  },
  // Automatic merging
  {
    name: 'automerge',
    description:
      'Whether to automerge branches/PRs automatically, without human intervention.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'automergeType',
    description: 'How to automerge, if enabled.',
    type: 'string',
    allowedValues: ['branch', 'pr', 'pr-comment'],
    default: 'pr',
  },
  {
    name: 'automergeStrategy',
    description:
      'The merge strategy to use when automerging PRs. Used only if `automergeType=pr`.',
    type: 'string',
    allowedValues: [
      'auto',
      'fast-forward',
      'merge-commit',
      'rebase',
      'rebase-merge',
      'squash',
    ],
    default: 'auto',
    supportedPlatforms: ['azure', 'bitbucket', 'forgejo', 'gitea', 'github'],
  },
  {
    name: 'automergeComment',
    description:
      'PR comment to add to trigger automerge. Only used if `automergeType=pr-comment`.',
    type: 'string',
    default: 'automergeComment',
  },
  {
    name: 'ignoreTests',
    description: 'Set to `true` to enable automerging without tests.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'transformTemplates',
    description: 'List of jsonata transformation rules.',
    type: 'array',
    subType: 'string',
    parents: ['customDatasources'],
    default: [],
  },
  {
    name: 'vulnerabilityAlerts',
    description:
      'Config to apply when a PR is needed due to a vulnerability in the existing package version.',
    type: 'object',
    default: {
      groupName: null,
      schedule: [],
      dependencyDashboardApproval: false,
      minimumReleaseAge: null,
      rangeStrategy: 'update-lockfile',
      commitMessageSuffix: '[SECURITY]',
      branchTopic: `{{{datasource}}}-{{{depNameSanitized}}}-vulnerability`,
      prCreation: 'immediate',
      vulnerabilityFixStrategy: 'lowest',
    },
    mergeable: true,
    cli: false,
    env: false,
    supportedPlatforms: ['github'],
  },
  {
    name: 'vulnerabilityFixStrategy',
    description:
      'Strategy to use when fixing vulnerabilities. `lowest` will propose the earliest version with a fix, `highest` will always pick the latest version.',
    type: 'string',
    allowedValues: ['lowest', 'highest'],
    default: 'lowest',
    parents: ['vulnerabilityAlerts'],
  },
  {
    name: 'osvVulnerabilityAlerts',
    description: 'Use vulnerability alerts from `osv.dev`.',
    type: 'boolean',
    default: false,
    experimental: true,
    experimentalIssues: [20542],
  },
  {
    name: 'pruneBranchAfterAutomerge',
    description: 'Set to `true` to enable branch pruning after automerging.',
    type: 'boolean',
    default: true,
  },
  // Default templates
  {
    name: 'branchName',
    description: 'Branch name template.',
    type: 'string',
    default: '{{{branchPrefix}}}{{{additionalBranchPrefix}}}{{{branchTopic}}}',
    deprecationMsg:
      'We strongly recommended that you avoid configuring this field directly. Please edit `branchPrefix`, `additionalBranchPrefix`, or `branchTopic` instead.',
    cli: false,
  },
  {
    name: 'additionalBranchPrefix',
    description: 'Additional string value to be appended to `branchPrefix`.',
    type: 'string',
    default: '',
    cli: false,
  },
  {
    name: 'branchTopic',
    description: 'Branch topic.',
    type: 'string',
    default:
      '{{{depNameSanitized}}}-{{{newMajor}}}{{#if separateMinorPatch}}{{#if isPatch}}.{{{newMinor}}}{{/if}}{{/if}}{{#if separateMultipleMinor}}{{#if isMinor}}.{{{newMinor}}}{{/if}}{{/if}}.x{{#if isLockfileUpdate}}-lockfile{{/if}}',
    cli: false,
  },
  {
    name: 'commitMessage',
    description: 'Message to use for commit messages and pull request titles.',
    type: 'string',
    default:
      '{{{commitMessagePrefix}}} {{{commitMessageAction}}} {{{commitMessageTopic}}} {{{commitMessageExtra}}} {{{commitMessageSuffix}}}',
    deprecationMsg:
      'We deprecated editing the `commitMessage` directly, and we recommend you stop using this config option. Instead use config options like `commitMessageAction`, `commitMessageExtra`, and so on, to create the commit message you want.',
    cli: false,
  },
  {
    name: 'commitBody',
    description:
      'Commit message body template. Will be appended to commit message, separated by two line returns.',
    type: 'string',
    cli: false,
  },
  {
    name: 'commitBodyTable',
    description:
      'If enabled, append a table in the commit message body describing all updates in the commit.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'commitMessagePrefix',
    description:
      'Prefix to add to start of commit messages and PR titles. Uses a semantic prefix if `semanticCommits` is enabled.',
    type: 'string',
    cli: false,
    advancedUse: true,
  },
  {
    name: 'commitMessageAction',
    description: 'Action verb to use in commit messages and PR titles.',
    type: 'string',
    default: 'Update',
    cli: false,
    advancedUse: true,
  },
  {
    name: 'commitMessageTopic',
    description:
      'The upgrade topic/noun used in commit messages and PR titles.',
    type: 'string',
    default: 'dependency {{depName}}',
    cli: false,
    advancedUse: true,
  },
  {
    name: 'commitMessageExtra',
    description:
      'Extra description used after the commit message topic - typically the version.',
    type: 'string',
    default:
      'to {{#if isPinDigest}}{{{newDigestShort}}}{{else}}{{#if isMajor}}{{prettyNewMajor}}{{else}}{{#if isSingleVersion}}{{prettyNewVersion}}{{else}}{{#if newValue}}{{{newValue}}}{{else}}{{{newDigestShort}}}{{/if}}{{/if}}{{/if}}{{/if}}',
    cli: false,
    advancedUse: true,
  },
  {
    name: 'commitMessageSuffix',
    description: 'Suffix to add to end of commit messages and PR titles.',
    type: 'string',
    cli: false,
    advancedUse: true,
  },
  {
    name: 'prBodyTemplate',
    description:
      'Pull Request body template. Controls which sections are rendered in the body of the pull request.',
    type: 'string',
    default:
      '{{{header}}}{{{table}}}{{{warnings}}}{{{notes}}}{{{changelogs}}}{{{configDescription}}}{{{controls}}}{{{footer}}}',
    cli: false,
  },
  {
    name: 'prTitle',
    description:
      'Pull Request title template. Inherits from `commitMessage` if null.',
    type: 'string',
    default: null,
    deprecationMsg:
      'Direct editing of `prTitle` is now deprecated. Instead use config options like `commitMessageAction`, `commitMessageExtra`, and so on, as they will be passed through to `prTitle`.',
    cli: false,
  },
  {
    name: 'prTitleStrict',
    description:
      'Whether to bypass appending extra context to the Pull Request title.',
    type: 'boolean',
    default: false,
    experimental: true,
    cli: false,
  },
  {
    name: 'prHeader',
    description: 'Text added here will be placed first in the PR body.',
    type: 'string',
  },
  {
    name: 'prFooter',
    description:
      'Text added here will be placed last in the PR body, with a divider separator before it.',
    type: 'string',
    default: `This PR has been generated by [Renovate Bot](https://github.com/renovatebot/renovate).`,
  },
  {
    name: 'customizeDashboard',
    description: 'Customize sections in the Dependency Dashboard issue.',
    type: 'object',
    default: {},
    freeChoice: true,
    additionalProperties: {
      type: 'string',
    },
  },
  {
    name: 'lockFileMaintenance',
    description: 'Configuration for lock file maintenance.',
    stage: 'branch',
    type: 'object',
    default: {
      enabled: false,
      recreateWhen: 'always',
      rebaseStalePrs: true,
      branchTopic: 'lock-file-maintenance',
      commitMessageAction: 'Lock file maintenance',
      commitMessageTopic: null,
      commitMessageExtra: null,
      schedule: ['before 4am on monday'],
      groupName: null,
      prBodyDefinitions: {
        Change: 'All locks refreshed',
      },
    },
    cli: false,
    mergeable: true,
  },
  {
    name: 'hashedBranchLength',
    description:
      'If enabled, branch names will use a hashing function to ensure each branch has that length.',
    type: 'integer',
    default: null,
    cli: false,
  },
  // Dependency Groups
  {
    name: 'groupName',
    description: 'Human understandable name for the dependency group.',
    type: 'string',
    default: null,
  },
  {
    name: 'groupSlug',
    description:
      'Slug to use for group (e.g. in branch name). Slug is calculated from `groupName` if `null`.',
    type: 'string',
    default: null,
    cli: false,
    env: false,
  },
  {
    name: 'group',
    description: 'Config if `groupName` is enabled.',
    type: 'object',
    default: {
      branchTopic: '{{{groupSlug}}}',
      commitMessageTopic: '{{{groupName}}}',
    },
    cli: false,
    env: false,
    mergeable: true,
    advancedUse: true,
  },
  // Pull Request options
  {
    name: 'labels',
    description: 'Labels to set in Pull Request.',
    type: 'array',
    subType: 'string',
  },
  {
    name: 'addLabels',
    description: 'Labels to add to Pull Request.',
    type: 'array',
    subType: 'string',
    mergeable: true,
  },
  {
    name: 'assignees',
    description:
      'Assignees for Pull Request (either username or email address depending on the platform).',
    type: 'array',
    subType: 'string',
  },
  {
    name: 'assigneesFromCodeOwners',
    description:
      'Determine assignees based on configured code owners and changes in PR.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'expandCodeOwnersGroups',
    description:
      'Expand the configured code owner groups into a full list of group members.',
    type: 'boolean',
    default: false,
    supportedPlatforms: ['gitlab'],
  },
  {
    name: 'assigneesSampleSize',
    description: 'Take a random sample of given size from `assignees`.',
    type: 'integer',
    default: null,
  },
  {
    name: 'assignAutomerge',
    description:
      'Assign reviewers and assignees even if the PR is to be automerged.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'ignoreReviewers',
    description:
      'Reviewers to be ignored in PR reviewers presence (either username or email address depending on the platform).',
    type: 'array',
    subType: 'string',
  },
  {
    name: 'reviewers',
    description:
      'Requested reviewers for Pull Requests (either username or email address depending on the platform).',
    type: 'array',
    subType: 'string',
  },
  {
    name: 'reviewersFromCodeOwners',
    description:
      'Determine reviewers based on configured code owners and changes in PR.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'filterUnavailableUsers',
    description: 'Filter reviewers and assignees based on their availability.',
    type: 'boolean',
    default: false,
    supportedPlatforms: ['gitlab'],
  },
  {
    name: 'forkModeDisallowMaintainerEdits',
    description:
      'Disallow maintainers to push to Renovate pull requests when running in fork mode.',
    type: 'boolean',
    default: false,
    supportedPlatforms: ['github'],
  },
  {
    name: 'confidential',
    description:
      'If enabled, issues created by Renovate are set as confidential.',
    type: 'boolean',
    default: false,
    supportedPlatforms: ['gitlab'],
  },
  {
    name: 'reviewersSampleSize',
    description: 'Take a random sample of given size from `reviewers`.',
    type: 'integer',
    default: null,
  },
  {
    name: 'additionalReviewers',
    description:
      'Additional reviewers for Pull Requests (in contrast to `reviewers`, this option adds to the existing reviewer list, rather than replacing it).',
    type: 'array',
    subType: 'string',
    mergeable: true,
  },
  {
    name: 'managerFilePatterns',
    description: 'RegEx (`re2`) and glob patterns for matching manager files.',
    type: 'array',
    subType: 'string',
    stage: 'repository',
    allowString: true,
    patternMatch: true,
    mergeable: true,
    cli: false,
    env: false,
    parents: [...AllManagersListLiteral, 'customManagers'],
  },
  {
    name: 'postUpdateOptions',
    description:
      'Enable post-update options to be run after package/artifact updating.',
    type: 'array',
    default: [],
    subType: 'string',
    allowedValues: [
      'bundlerConservative',
      'gomodMassage',
      'gomodTidy',
      'gomodTidy1.17',
      'gomodTidyE',
      'gomodUpdateImportPaths',
      'gomodSkipVendor',
      'gomodVendor',
      'helmUpdateSubChartArchives',
      'kustomizeInflateHelmCharts',
      'npmDedupe',
      'pnpmDedupe',
      'yarnDedupeFewer',
      'yarnDedupeHighest',
    ],
    cli: false,
    env: false,
    mergeable: true,
  },
  {
    name: 'constraints',
    description:
      'Configuration object to define language or manager version constraints.',
    type: 'object',
    default: {},
    mergeable: true,
    cli: false,
    supportedManagers: [
      'bundler',
      'composer',
      'gomod',
      'npm',
      'pep621',
      'pipenv',
      'poetry',
    ],
    freeChoice: true,
    additionalProperties: {
      type: 'string',
    },
  },
  {
    name: 'hostRules',
    description: 'Host rules/configuration including credentials.',
    type: 'array',
    subType: 'object',
    stage: 'repository',
    cli: true,
    mergeable: true,
  },
  {
    name: 'hostType',
    description:
      'hostType for a package rule. Can be a platform name or a datasource name.',
    type: 'string',
    stage: 'repository',
    parents: ['hostRules'],
    cli: false,
    env: false,
  },
  {
    name: 'matchHost',
    description: 'A domain name, host name or base URL to match against.',
    type: 'string',
    stage: 'repository',
    parents: ['hostRules'],
    cli: false,
    env: false,
  },
  {
    name: 'readOnly',
    description:
      'Match against requests that only read data and do not mutate anything.',
    type: 'boolean',
    stage: 'repository',
    parents: ['hostRules'],
    cli: false,
    env: false,
  },
  {
    name: 'timeout',
    description: 'Timeout (in milliseconds) for queries to external endpoints.',
    type: 'integer',
    stage: 'repository',
    parents: ['hostRules'],
    cli: false,
    env: false,
  },
  {
    name: 'insecureRegistry',
    description: 'Explicitly turn on insecure Docker registry access (HTTP).',
    type: 'boolean',
    default: false,
    stage: 'repository',
    parents: ['hostRules'],
    cli: false,
    env: false,
    advancedUse: true,
  },
  {
    name: 'abortOnError',
    description:
      'If enabled, Renovate aborts its run when HTTP request errors occur.',
    type: 'boolean',
    default: false,
    stage: 'repository',
    parents: ['hostRules'],
    cli: false,
    env: false,
  },
  {
    name: 'abortIgnoreStatusCodes',
    description:
      'A list of HTTP status codes safe to ignore even when `abortOnError=true`.',
    type: 'array',
    subType: 'number',
    stage: 'repository',
    parents: ['hostRules'],
    cli: false,
    env: false,
  },
  {
    name: 'enableHttp2',
    description: 'Enable got HTTP/2 support.',
    type: 'boolean',
    default: false,
    stage: 'repository',
    parents: ['hostRules'],
    cli: false,
    env: false,
  },
  {
    name: 'concurrentRequestLimit',
    description: 'Limit concurrent requests per host.',
    type: 'integer',
    stage: 'repository',
    parents: ['hostRules'],
    default: null,
    cli: false,
    env: false,
  },
  {
    name: 'maxRequestsPerSecond',
    description: 'Limit requests rate per host.',
    type: 'integer',
    stage: 'repository',
    parents: ['hostRules'],
    default: 0,
    cli: false,
    env: false,
  },
  {
    name: 'authType',
    description:
      'Authentication type for HTTP header. e.g. `"Bearer"` or `"Basic"`. Use `"Token-Only"` to use only the token without an authorization type.',
    type: 'string',
    stage: 'repository',
    parents: ['hostRules'],
    default: 'Bearer',
    cli: false,
    env: false,
  },
  {
    name: 'dnsCache',
    description: 'Enable got DNS cache.',
    type: 'boolean',
    default: false,
    stage: 'repository',
    parents: ['hostRules'],
    cli: false,
    env: false,
    experimental: true,
    deprecationMsg:
      'This option is deprecated and will be removed in a future release.',
  },
  {
    name: 'keepAlive',
    description: 'Enable HTTP keep-alive for hosts.',
    type: 'boolean',
    default: false,
    stage: 'repository',
    parents: ['hostRules'],
    cli: false,
    env: false,
    advancedUse: true,
  },
  {
    name: 'headers',
    description:
      'Put fields to be forwarded to the HTTP request headers in the headers config option.',
    type: 'object',
    parents: ['hostRules'],
    cli: false,
    env: false,
    advancedUse: true,
  },
  {
    name: 'artifactAuth',
    description:
      'A list of package managers to enable artifact auth. Only managers on the list are enabled. All are enabled if `null`.',
    experimental: true,
    type: 'array',
    subType: 'string',
    stage: 'repository',
    parents: ['hostRules'],
    allowedValues: ['composer'],
    default: null,
    cli: false,
    env: false,
  },
  {
    name: 'httpsCertificateAuthority',
    description: 'The overriding trusted CA certificate.',
    type: 'string',
    stage: 'repository',
    parents: ['hostRules'],
    default: null,
    cli: false,
    env: false,
  },
  {
    name: 'httpsPrivateKey',
    description: 'The private key in PEM format.',
    type: 'string',
    stage: 'repository',
    parents: ['hostRules'],
    default: null,
    cli: false,
    env: false,
  },
  {
    name: 'httpsCertificate',
    description: 'The certificate chains in PEM format.',
    type: 'string',
    stage: 'repository',
    parents: ['hostRules'],
    default: null,
    cli: false,
    env: false,
  },
  {
    name: 'cacheHardTtlMinutes',
    description:
      'Maximum duration in minutes to keep datasource cache entries.',
    type: 'integer',
    stage: 'repository',
    default: 7 * 24 * 60,
    globalOnly: true,
  },
  {
    name: 'cacheTtlOverride',
    description: 'An object that contains cache namespace TTL override values.',
    type: 'object',
    stage: 'repository',
    default: {},
    globalOnly: true,
    experimental: true,
    advancedUse: true,
  },
  {
    name: 'prBodyDefinitions',
    description: 'Table column definitions to use in PR tables.',
    type: 'object',
    freeChoice: true,
    mergeable: true,
    default: {
      Package:
        '{{{depNameLinked}}}{{#if newName}}{{#unless (equals depName newName)}} → {{{newNameLinked}}}{{/unless}}{{/if}}',
      Type: '{{{depType}}}',
      Update: '{{{updateType}}}',
      'Current value': '{{{currentValue}}}',
      'New value': '{{{newValue}}}',
      Change: '`{{{displayFrom}}}` -> `{{{displayTo}}}`',
      Pending: '{{{displayPending}}}',
      References: '{{{references}}}',
      'Package file': '{{{packageFile}}}',
      Age: "{{#if newVersion}}[![age](https://developer.mend.io/api/mc/badges/age/{{datasource}}/{{replace '/' '%2f' packageName}}/{{{newVersion}}}?slim=true)](https://docs.renovatebot.com/merge-confidence/){{/if}}",
      Adoption:
        "{{#if newVersion}}[![adoption](https://developer.mend.io/api/mc/badges/adoption/{{datasource}}/{{replace '/' '%2f' packageName}}/{{{newVersion}}}?slim=true)](https://docs.renovatebot.com/merge-confidence/){{/if}}",
      Passing:
        "{{#if newVersion}}[![passing](https://developer.mend.io/api/mc/badges/compatibility/{{datasource}}/{{replace '/' '%2f' packageName}}/{{{currentVersion}}}/{{{newVersion}}}?slim=true)](https://docs.renovatebot.com/merge-confidence/){{/if}}",
      Confidence:
        "{{#if newVersion}}[![confidence](https://developer.mend.io/api/mc/badges/confidence/{{datasource}}/{{replace '/' '%2f' packageName}}/{{{currentVersion}}}/{{{newVersion}}}?slim=true)](https://docs.renovatebot.com/merge-confidence/){{/if}}",
    },
  },
  {
    name: 'prBodyColumns',
    description: 'List of columns to use in PR bodies.',
    type: 'array',
    subType: 'string',
    default: ['Package', 'Type', 'Update', 'Change', 'Pending'],
  },
  {
    name: 'prBodyNotes',
    description:
      'List of extra notes or templates to include in the Pull Request body.',
    type: 'array',
    subType: 'string',
    default: [],
    allowString: true,
    mergeable: true,
  },
  {
    name: 'suppressNotifications',
    description:
      'Options to suppress various types of warnings and other notifications.',
    type: 'array',
    subType: 'string',
    default: [],
    allowedValues: [
      'artifactErrors',
      'branchAutomergeFailure',
      'configErrorIssue',
      'dependencyLookupWarnings',
      'lockFileErrors',
      'missingCredentialsError',
      'onboardingClose',
      'prEditedNotification',
      'prIgnoreNotification',
    ],
    cli: false,
    env: false,
    mergeable: true,
  },
  {
    name: 'pruneStaleBranches',
    description: 'Set to `false` to disable pruning stale branches.',
    type: 'boolean',
    default: true,
  },
  {
    name: 'unicodeEmoji',
    description: 'Enable or disable Unicode emoji.',
    type: 'boolean',
    default: true,
    globalOnly: true,
  },
  {
    name: 'gitLabIgnoreApprovals',
    description: `Ignore approval rules for MRs created by Renovate, which is useful for automerge.`,
    type: 'boolean',
    default: false,
  },
  {
    name: 'customManagers',
    description: 'Custom managers using regex matching.',
    type: 'array',
    subType: 'object',
    default: [],
    stage: 'package',
    cli: true,
    mergeable: true,
  },
  {
    name: 'customType',
    description:
      'Custom manager to use. Valid only within a `customManagers` object.',
    type: 'string',
    allowedValues: ['jsonata', 'regex'],
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'fileFormat',
    description:
      'It specifies the syntax of the package file being managed by the custom JSONata manager.',
    type: 'string',
    allowedValues: ['json', 'toml', 'yaml'],
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'matchStrings',
    description:
      'Queries to use. Valid only within `bumpVersions` or `customManagers` object.',
    type: 'array',
    subType: 'string',
    parents: ['bumpVersions', 'customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'matchStringsStrategy',
    description: 'Strategy how to interpret matchStrings.',
    type: 'string',
    default: 'any',
    allowedValues: ['any', 'recursive', 'combination'],
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'depNameTemplate',
    description:
      'Optional depName for extracted dependencies. Valid only within a `customManagers` object.',
    type: 'string',
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'packageNameTemplate',
    description:
      'Optional packageName for extracted dependencies, else defaults to `depName` value. Valid only within a `customManagers` object.',
    type: 'string',
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'datasourceTemplate',
    description:
      'Optional datasource for extracted dependencies. Valid only within a `customManagers` object.',
    type: 'string',
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'depTypeTemplate',
    description:
      'Optional `depType` for extracted dependencies. Valid only within a `customManagers` object.',
    type: 'string',
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'currentValueTemplate',
    description:
      'Optional `currentValue` for extracted dependencies. Valid only within a `customManagers` object.',
    type: 'string',
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'versioningTemplate',
    description:
      'Optional versioning for extracted dependencies. Valid only within a `customManagers` object.',
    type: 'string',
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'registryUrlTemplate',
    description:
      'Optional registry URL for extracted dependencies. Valid only within a `customManagers` object.',
    type: 'string',
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'extractVersionTemplate',
    description:
      'Optional `extractVersion` for extracted dependencies. Valid only within a `customManagers` object.',
    type: 'string',
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'autoReplaceStringTemplate',
    description:
      'Optional `extractVersion` for extracted dependencies. Valid only within a `customManagers` object.',
    type: 'string',
    parents: ['customManagers'],
    cli: false,
    env: false,
  },
  {
    name: 'fetchChangeLogs',
    description: 'Controls if and when changelogs/release notes are fetched.',
    type: 'string',
    allowedValues: ['off', 'branch', 'pr'],
    default: 'pr',
    cli: false,
  },
  {
    name: 'cloneSubmodules',
    description:
      'Set to `true` to initialize submodules during repository clone.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'cloneSubmodulesFilter',
    description:
      'List of submodules names or patterns to clone when cloneSubmodules=true.',
    type: 'array',
    subType: 'string',
    default: ['*'],
  },
  {
    name: 'ignorePrAuthor',
    description:
      'Set to `true` to fetch the entire list of PRs instead of only those authored by the Renovate user.',
    type: 'boolean',
    default: false,
  },
  {
    name: 'gitNoVerify',
    description:
      'Which Git commands will be run with the `--no-verify` option.',
    type: 'array',
    subType: 'string',
    allowString: true,
    allowedValues: ['commit', 'push'],
    default: ['commit', 'push'],
    stage: 'global',
    globalOnly: true,
  },
  {
    name: 'updatePinnedDependencies',
    description:
      'Whether to update pinned (single version) dependencies or not.',
    type: 'boolean',
    default: true,
  },
  {
    name: 'gitUrl',
    description:
      'Overrides the default resolution for Git remote, e.g. to switch GitLab from HTTPS to SSH-based.',
    type: 'string',
    supportedPlatforms: ['bitbucket-server', 'forgejo', 'gitea', 'gitlab'],
    allowedValues: ['default', 'ssh', 'endpoint'],
    default: 'default',
    stage: 'repository',
    globalOnly: true,
  },
  {
    name: 'writeDiscoveredRepos',
    description: 'Writes discovered repositories to a JSON file and then exit.',
    type: 'string',
    globalOnly: true,
  },
  {
    name: 'platformAutomerge',
    description: `Controls if platform-native auto-merge is used.`,
    type: 'boolean',
    default: true,
    supportedPlatforms: ['azure', 'forgejo', 'gitea', 'github', 'gitlab'],
  },
  {
    name: 'userStrings',
    description:
      'User-facing strings for the Renovate comment when a PR is closed.',
    type: 'object',
    freeChoice: true,
    default: {
      ignoreTopic: 'Renovate Ignore Notification',
      ignoreMajor:
        'Because you closed this PR without merging, Renovate will ignore this update. You will not get PRs for *any* future `{{{newMajor}}}.x` releases. But if you manually upgrade to `{{{newMajor}}}.x` then Renovate will re-enable `minor` and `patch` updates automatically.',
      ignoreDigest:
        'Because you closed this PR without merging, Renovate will ignore this update. You will not get PRs for the `{{{depName}}}` `{{{newDigestShort}}}` update again.',
      ignoreOther:
        'Because you closed this PR without merging, Renovate will ignore this update (`{{{newValue}}}`). You will get a PR once a newer version is released. To ignore this dependency forever, add it to the `ignoreDeps` array of your Renovate config.',
      artifactErrorWarning: 'You probably do not want to merge this PR as-is.',
    },
  },
  {
    name: 'platformCommit',
    description:
      'Use platform API to perform commits instead of using Git directly.',
    type: 'string',
    default: 'auto',
    allowedValues: ['auto', 'disabled', 'enabled'],
    supportedPlatforms: ['github'],
  },
  {
    name: 'branchNameStrict',
    description: `Whether to be strict about the use of special characters within the branch name.`,
    type: 'boolean',
    default: false,
  },
  {
    name: 'checkedBranches',
    description:
      'A list of branch names to mark for creation or rebasing as if it was selected in the Dependency Dashboard issue.',
    type: 'array',
    subType: 'string',
    experimental: true,
    globalOnly: true,
    default: [],
  },
  {
    name: 'maxRetryAfter',
    description:
      'Maximum retry-after header value to wait for before retrying a failed request.',
    type: 'integer',
    default: 60,
    stage: 'package',
    parents: ['hostRules'],
    cli: false,
    env: false,
  },
  {
    name: 'logLevelRemap',
    description: 'Remap log levels to different levels.',
    type: 'array',
    subType: 'object',
    stage: 'repository',
    cli: false,
    env: false,
    mergeable: true,
  },
  {
    name: 'matchMessage',
    description: 'Regex/minimatch expression to match against log message.',
    type: 'string',
    parents: ['logLevelRemap'],
    cli: false,
    env: false,
  },
  {
    name: 'newLogLevel',
    description: 'New log level to use if matchMessage matches.',
    type: 'string',
    allowedValues: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
    parents: ['logLevelRemap'],
    cli: false,
    env: false,
  },
  {
    name: 'milestone',
    description: `The number of a milestone. If set, the milestone will be set when Renovate creates the PR.`,
    type: 'integer',
    default: null,
    supportedPlatforms: ['github'],
  },
  {
    name: 'httpCacheTtlDays',
    description: 'Maximum duration in days to keep HTTP cache entries.',
    type: 'integer',
    stage: 'repository',
    default: 90,
    globalOnly: true,
  },
  {
    name: 'dockerMaxPages',
    description:
      'By default, Renovate fetches up to 20 pages of Docker tags from registries. But you can set your own limit with this config option.',
    type: 'integer',
    default: 20,
    globalOnly: true,
  },
  {
    name: 'deleteConfigFile',
    description:
      'If set to `true`, Renovate tries to delete the self-hosted config file after reading it.',
    type: 'boolean',
    default: false,
    globalOnly: true,
  },
  {
    name: 's3Endpoint',
    description:
      'If set, Renovate will use this string as the `endpoint` when creating the AWS S3 client instance.',
    type: 'string',
    globalOnly: true,
  },
  {
    name: 's3PathStyle',
    description:
      'If set, Renovate will enable `forcePathStyle` when creating the AWS S3 client instance.',
    type: 'boolean',
    default: false,
    globalOnly: true,
  },
  {
    name: 'cachePrivatePackages',
    description:
      'Cache private packages in the datasource cache. This is useful for self-hosted setups',
    type: 'boolean',
    default: false,
    globalOnly: true,
  },
];

export function getOptions(): RenovateOptions[] {
  return options;
}

function loadManagerOptions(): void {
  const allManagers = new Map([...getManagers(), ...getCustomManagers()]);
  for (const [name, config] of allManagers.entries()) {
    if (config.defaultConfig) {
      const managerConfig: RenovateOptions = {
        name,
        description: `Configuration object for the ${name} manager`,
        stage: 'package',
        type: 'object',
        default: config.defaultConfig,
        mergeable: true,
        cli: false,
        autogenerated: true,
      };
      options.push(managerConfig);
    }
  }
}

loadManagerOptions();
