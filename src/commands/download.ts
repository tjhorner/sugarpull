import { Args, Command, Flags } from "@oclif/core"
import { DexcomClarityClient, GlucoseUnits, ReportType, reportTypes as allReportTypes } from "../lib/dexcom.js"
import { DateTime } from "luxon"
import fs from "fs/promises"
import path from "path"
import { downloadFile } from "../lib/download.js"

export default class Download extends Command {
  static description = "Download reports and data from Dexcom Clarity"

  static examples = [
    {
      description: "Download the CSV data for last month",
      command: "<%= config.bin %> <%= command.id %> --shareCode ABCDEFHIJ --csv --period month",
    },
    {
      description: "Download the CSV data and all reports for last month",
      command: "<%= config.bin %> <%= command.id %> --shareCode ABCDEFHIJ --csv --report all --period month",
    },
    {
      description: "Download the AGP report for the past 90 days",
      command: "<%= config.bin %> <%= command.id %> --shareCode ABCDEFHIJ --csv --report all --period 90",
    }
  ]

  static flags = {
    report: Flags.string({
      multiple: true,
      description: "PDF report types to download (provide multiple times to download multiple reports, or provide 'all' to download all)",
      options: ["all", ...allReportTypes],
      char: "r",
      helpGroup: "PDF REPORTS"
    }),
    reportFileName: Flags.string({
      summary: "Filename to save the PDF report as",
      description: "The token DATERANGE will be replaced with the actual date range of the report",
      default: "clarity_report_DATERANGE.pdf",
      helpGroup: "PDF REPORTS"
    }),
    csv: Flags.boolean({
      description: "Download glucose data as CSV",
      default: false,
      char: "c",
      helpGroup: "CSV DATA"
    }),
    csvFileName: Flags.string({
      summary: "Filename to save the CSV data as",
      description: "The token DATERANGE will be replaced with the actual date range of the data",
      default: "clarity_data_DATERANGE.csv",
      helpGroup: "CSV DATA"
    }),
    period: Flags.string({
      summary: "Date range to download",
      description: "Provide as number of days in the past (e.g., '90'), an absolute date in the format 'YYYY-MM-DD/YYYY-MM-DD', or use special value 'month' to download last month's data; this will work even for months with an abnormal number of days (e.g. February).",
      char: "p",
      default: "month"
    }),
    shareCode: Flags.string({
      description: "Dexcom Clarity share code (you can also use env var `DEXCOM_SHARE_CODE`)",
      env: "DEXCOM_SHARE_CODE",
      char: "s",
      required: true
    }),
    units: Flags.string({
      description: "Glucose units to download (default is your account's setting)",
      options: ["mgdl", "mmol"],
      char: "u"
    })
  }

  static args = {
    out: Args.directory({
      description: "Directory to save downloaded files",
      default: "."
    })
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Download)

    const shareCode = flags.shareCode.replaceAll("-", "")
    const clarityClient = await DexcomClarityClient.fromShareCode(shareCode)

    let dataPeriod = flags.period
    if (dataPeriod === "month") {
      const firstOfLastMonth = DateTime.local().minus({ months: 1 }).startOf("month")
      const lastOfLastMonth = DateTime.local().minus({ months: 1 }).endOf("month")
      dataPeriod = `${firstOfLastMonth.toISODate()}/${lastOfLastMonth.toISODate()}`
    }

    if (dataPeriod.match(/^\d+$/)) {
      const start = DateTime.local().minus({ days: parseInt(dataPeriod) }).startOf("day")
      const end = DateTime.local().endOf("day")
      dataPeriod = `${start.toISODate()}/${end.toISODate()}`
    }

    const fileSafePeriod = dataPeriod.replace(/\//g, ":")

    if (flags.csv) {
      console.log("Downloading CSV...")
      const csv = await clarityClient.exportCsv(dataPeriod, flags.units as GlucoseUnits | undefined)
      const csvFileName = flags.csvFileName.replaceAll("DATERANGE", fileSafePeriod)
      const csvOutPath = path.join(args.out, csvFileName)
      await fs.writeFile(csvOutPath, csv)
    }

    if (flags.report) {
      console.log("Downloading PDF report...")
      const reportTypes = flags.report.includes("all") ? allReportTypes : flags.report

      const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const reportRequest = await clarityClient.generateReport(reportTypes as ReportType[], dataPeriod, currentTimeZone, true, flags.units as GlucoseUnits | undefined)

      console.log("Waiting for PDF generation to complete...")

      const completedReport = await clarityClient.pollForReportCompletion(reportRequest.url)
      const reportFileName = flags.reportFileName.replaceAll("DATERANGE", fileSafePeriod)
      const reportOutPath = path.join(args.out, reportFileName)

      await downloadFile(completedReport.url, reportOutPath)
    }
  }
}
