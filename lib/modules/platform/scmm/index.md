# SCM-Manager

Renovate supports [SCM-Manager](https://scm-manager.org).

## Authentication

First, create an API Key for the bot account.
The bot account should have full name and email address configured.
Then let Renovate use your API Key by setting the `RENOVATE_TOKEN` environment variable with your key

You must set `platform=scmm` in your Renovate config file.

The Bot account must have the `OWNER` role for a repository

