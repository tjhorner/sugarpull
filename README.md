# sugarpull

Command line utility for downloading data and reports from Dexcom Clarity.

## Background

Dexcom Clarity is a great tool for analyzing the glucose data from your CGM, but there is one big downside: all your data lives in The Cloud™, which as we know is just someone else's computer. And that computer can go down at any time, even permanently. That's why it's important to own your data, especially if it's health related.

It's great that Dexcom Clarity provides exports of data and reports, but these must be downloaded manually from the website. So if you'd like to archive your data, you have to remember to do this regularly. That's where sugarpull comes in: you can automate this process by running it on a schedule, and it will download your data and reports for you.

## Installation

You will need npm.

You can run sugarpull with `npx`:

```shell
npx sugarpull --help
```

Or you can install it globally:

```shell
npm install -g sugarpull
sugarpull --help
```

## Usage

### Obtain Share Code

Instead of authenticating with your Dexcom account, sugarpull uses a share code to access your data. For some reason, you can only generate one from the Clarity mobile app and not the website, so you'll need to download that first.

1. Open the Clarity app on your phone.
2. Navigate to "Profile".
3. Tap "Authorize Sharing".
4. Tap "Generate Code".
5. Select the 12-month option.
6. Copy the code to your clipboard.

You may have noticed that this share code only lasts for a limited amount of time. It is recommended you set up monitoring for whatever you use to schedule the sugarpull command to run, so you are notified when the code expires.

### Download Command

The primary (and only) command available is the `download` command. This command can download both the raw data as a CSV and the various PDF reports provided by Clarity.

Here is an example which downloads the raw data and all available reports for the previous month:

```shell
# You can also provide the share code as an env var: DEXCOM_SHARE_CODE
sugarpull download -s ABCDEFHIJ --csv --report all --period month
```

For more information, run `sugarpull download --help`.

### Scheduled Archives

The most useful way to use sugarpull is for archiving your data on a schedule. You can use cron or a similar tool to run the `download` command at regular intervals. For example, using cron to download the previous month's data and reports on the first of the month at 3 AM:

```shell
# Replace /data/save/directory with where you want to save the data
0 3 1 * * sugarpull download /data/save/directory -s ABCDEFHIJ --csv --report all --period month
```

**Note**: The special value `month` for the `--period` flag makes sure to include the entire previous month's data, even if that month has an abnormal number of days, taking into account leap years, etc. That's why it's better than just using a fixed date range.

If you are using cron and want to set up monitoring for the job, you can use a service like [Cronitor](https://cronitor.io/) to keep tabs on it. This way you will be notified if the job fails or the share code expires.

## Full Command Reference

<!-- commands -->
* [`sugarpull download [OUT]`](#sugarpull-download-out)
* [`sugarpull help [COMMANDS]`](#sugarpull-help-commands)
* [`sugarpull plugins`](#sugarpull-plugins)
* [`sugarpull plugins:install PLUGIN...`](#sugarpull-pluginsinstall-plugin)
* [`sugarpull plugins:inspect PLUGIN...`](#sugarpull-pluginsinspect-plugin)
* [`sugarpull plugins:install PLUGIN...`](#sugarpull-pluginsinstall-plugin-1)
* [`sugarpull plugins:link PLUGIN`](#sugarpull-pluginslink-plugin)
* [`sugarpull plugins:uninstall PLUGIN...`](#sugarpull-pluginsuninstall-plugin)
* [`sugarpull plugins reset`](#sugarpull-plugins-reset)
* [`sugarpull plugins:uninstall PLUGIN...`](#sugarpull-pluginsuninstall-plugin-1)
* [`sugarpull plugins:uninstall PLUGIN...`](#sugarpull-pluginsuninstall-plugin-2)
* [`sugarpull plugins update`](#sugarpull-plugins-update)

## `sugarpull download [OUT]`

Download reports and data from Dexcom Clarity

```
USAGE
  $ sugarpull download [OUT] -s <value> [-r
    all|overview|patterns|daily|compare|overlay|hourlyStatistics|dailyStatistics|agp] [--reportFileName <value>] [-c]
    [--csvFileName <value>] [-p <value>] [-u mgdl|mmol]

ARGUMENTS
  OUT  [default: .] Directory to save downloaded files

FLAGS
  -p, --period=<value>     [default: month] Date range to download
  -s, --shareCode=<value>  (required) Dexcom Clarity share code (you can also use env var `DEXCOM_SHARE_CODE`)
  -u, --units=<option>     Glucose units to download (default is your account's setting)
                           <options: mgdl|mmol>

CSV DATA FLAGS
  -c, --csv                  Download glucose data as CSV
      --csvFileName=<value>  [default: clarity_data_DATERANGE.csv] Filename to save the CSV data as

PDF REPORTS FLAGS
  -r, --report=<option>...      PDF report types to download (provide multiple times to download multiple reports, or
                                provide 'all' to download all)
                                <options:
                                all|overview|patterns|daily|compare|overlay|hourlyStatistics|dailyStatistics|agp>
      --reportFileName=<value>  [default: clarity_report_DATERANGE.pdf] Filename to save the PDF report as

DESCRIPTION
  Download reports and data from Dexcom Clarity

EXAMPLES
  Download the CSV data for last month

    $ sugarpull download --shareCode ABCDEFHIJ --csv --period month

  Download the CSV data and all reports for last month

    $ sugarpull download --shareCode ABCDEFHIJ --csv --report all --period month

  Download the AGP report for the past 90 days

    $ sugarpull download --shareCode ABCDEFHIJ --csv --report all --period 90

FLAG DESCRIPTIONS
  -p, --period=<value>  Date range to download

    Provide as number of days in the past (e.g., '90'), an absolute date in the format 'YYYY-MM-DD/YYYY-MM-DD', or use
    special value 'month' to download last month's data; this will work even for months with an abnormal number of days
    (e.g. February).

  --csvFileName=<value>  Filename to save the CSV data as

    The token DATERANGE will be replaced with the actual date range of the data

  --reportFileName=<value>  Filename to save the PDF report as

    The token DATERANGE will be replaced with the actual date range of the report
```

_See code: [src/commands/download.ts](https://github.com/tjhorner/sugarpull/blob/v0.0.1/src/commands/download.ts)_

## `sugarpull help [COMMANDS]`

Display help for sugarpull.

```
USAGE
  $ sugarpull help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for sugarpull.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.12/src/commands/help.ts)_

## `sugarpull plugins`

List installed plugins.

```
USAGE
  $ sugarpull plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ sugarpull plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.1/src/commands/plugins/index.ts)_

## `sugarpull plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ sugarpull plugins add plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ sugarpull plugins add

EXAMPLES
  $ sugarpull plugins add myplugin 

  $ sugarpull plugins add https://github.com/someuser/someplugin

  $ sugarpull plugins add someuser/someplugin
```

## `sugarpull plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ sugarpull plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ sugarpull plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.1/src/commands/plugins/inspect.ts)_

## `sugarpull plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ sugarpull plugins install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -s, --silent   Silences yarn output.
  -v, --verbose  Show verbose yarn output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ sugarpull plugins add

EXAMPLES
  $ sugarpull plugins install myplugin 

  $ sugarpull plugins install https://github.com/someuser/someplugin

  $ sugarpull plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.1/src/commands/plugins/install.ts)_

## `sugarpull plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ sugarpull plugins link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ sugarpull plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.1/src/commands/plugins/link.ts)_

## `sugarpull plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sugarpull plugins remove plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sugarpull plugins unlink
  $ sugarpull plugins remove

EXAMPLES
  $ sugarpull plugins remove myplugin
```

## `sugarpull plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ sugarpull plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.1/src/commands/plugins/reset.ts)_

## `sugarpull plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sugarpull plugins uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sugarpull plugins unlink
  $ sugarpull plugins remove

EXAMPLES
  $ sugarpull plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.1/src/commands/plugins/uninstall.ts)_

## `sugarpull plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sugarpull plugins unlink plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sugarpull plugins unlink
  $ sugarpull plugins remove

EXAMPLES
  $ sugarpull plugins unlink myplugin
```

## `sugarpull plugins update`

Update installed plugins.

```
USAGE
  $ sugarpull plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v4.2.1/src/commands/plugins/update.ts)_
<!-- commandsstop -->
* [`sugarpull download [OUT]`](#sugarpull-download-out)

## `sugarpull download [OUT]`

Download reports and data from Dexcom Clarity

```
USAGE
  $ sugarpull download [OUT] -s <value> [-r
    all|overview|patterns|daily|compare|overlay|hourlyStatistics|dailyStatistics|agp] [--reportFileName <value>] [-c]
    [--csvFileName <value>] [-p <value>] [-u mgdl|mmol]

ARGUMENTS
  OUT  [default: .] Directory to save downloaded files

FLAGS
  -p, --period=<value>     [default: month] Date range to download
  -s, --shareCode=<value>  (required) Dexcom Clarity share code (you can also use env var `DEXCOM_SHARE_CODE`)
  -u, --units=<option>     Glucose units to download (default is your account's setting)
                           <options: mgdl|mmol>

CSV DATA FLAGS
  -c, --csv                  Download glucose data as CSV
      --csvFileName=<value>  [default: clarity_data_DATERANGE.csv] Filename to save the CSV data as

PDF REPORTS FLAGS
  -r, --report=<option>...      PDF report types to download (provide multiple times to download multiple reports, or
                                provide 'all' to download all)
                                <options:
                                all|overview|patterns|daily|compare|overlay|hourlyStatistics|dailyStatistics|agp>
      --reportFileName=<value>  [default: clarity_report_DATERANGE.pdf] Filename to save the PDF report as

DESCRIPTION
  Download reports and data from Dexcom Clarity

EXAMPLES
  Download the CSV data for last month

    $ sugarpull download --shareCode ABCDEFHIJ --csv --period month

  Download the CSV data and all reports for last month

    $ sugarpull download --shareCode ABCDEFHIJ --csv --report all --period month

  Download the AGP report for the past 90 days

    $ sugarpull download --shareCode ABCDEFHIJ --csv --report all --period 90

FLAG DESCRIPTIONS
  -p, --period=<value>  Date range to download

    Provide as number of days in the past (e.g., '90'), an absolute date in the format 'YYYY-MM-DD/YYYY-MM-DD', or use
    special value 'month' to download last month's data; this will work even for months with an abnormal number of days
    (e.g. February).

  --csvFileName=<value>  Filename to save the CSV data as

    The token DATERANGE will be replaced with the actual date range of the data

  --reportFileName=<value>  Filename to save the PDF report as

    The token DATERANGE will be replaced with the actual date range of the report
```
