import axios, { AxiosInstance } from "axios"

interface SubjectInfo {
  email: string
  first_name: string
  last_name: string
  glucose_unit: GlucoseUnits
  locale: string
  country: string
}

interface AnalysisSessionInfo {
  analysisSessionId: string
  dateTime: string
  defaultReportEndDate: string
  eventDates: string
  observationDates: string
  subjectId: string
}

interface ReportProgressInfo {
  percent: number
  status: string
  url: string
  uuid: string
}

export type GlucoseUnits = "mgdl" | "mmol"

export type ReportType = "overview" | "patterns" | "daily" | "compare" | "overlay" | "hourlyStatistics" | "dailyStatistics" | "agp"

export class DexcomClarityClient {
  private accessToken: string
  private axiosClient: AxiosInstance
  private memoizedSubjectInfo: SubjectInfo | undefined

  constructor(accessToken: string, rogueSession: string) {
    this.accessToken = accessToken
    this.axiosClient = axios.create({
      headers: {
        "Access-Token": this.accessToken,
        "Cookie": `_rogue_material_session=${rogueSession}`,
      }
    })
  }

  private static addDashesToShareCode(shareCode: string): string {
    return shareCode.replace(/(.{4})/g, "$1-").slice(0, -1)
  }

  static async fromShareCode(shareCode: string): Promise<DexcomClarityClient> {
    const resp = await axios.get(`https://clarity.dexcom.com/api/access_code/redeem?accesscode=${shareCode}`)
    const { accessToken } = resp.data

    const cookieResp = await axios.post("https://clarity.dexcom.com/user/sharing", `sharing_code=${this.addDashesToShareCode(shareCode)}&commit=`, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://clarity.dexcom.com",
        "Referer": "https://clarity.dexcom.com/professional/",
      },
      maxRedirects: 0,
      validateStatus: status => status === 302
    })

    const rogueSession = cookieResp.headers["set-cookie"]![0].split(";")[0].split("=")[1]
    return new DexcomClarityClient(accessToken, rogueSession)
  }

  async getSubjectInfo(): Promise<SubjectInfo> {
    if (this.memoizedSubjectInfo) {
      return this.memoizedSubjectInfo
    }

    const resp = await this.axiosClient.get("https://clarity.dexcom.com/subject_info")
    this.memoizedSubjectInfo = resp.data
    return resp.data
  }

  getSubjectId(): string {
    return JSON.parse(atob(this.accessToken.split(".")[1])).subjectId
  }

  async beginAnalysisSession(): Promise<AnalysisSessionInfo> {
    const subjectId = this.getSubjectId()
    const resp = await this.axiosClient.post(`https://clarity.dexcom.com/api/subject/${subjectId}/analysis_session`)
    return resp.data
  }

  async exportCsv(dateInterval: string, units: GlucoseUnits | undefined): Promise<string> {
    const subjectId = this.getSubjectId()
    const subjectInfo = await this.getSubjectInfo()

    if (!units) {
      units = subjectInfo.glucose_unit
    }

    const params = {
      dateInterval,
      accessToken: this.accessToken,
      firstName: subjectInfo.first_name,
      lastName: subjectInfo.last_name,
      locale: subjectInfo.locale,
      units
    }
  
    const form = new URLSearchParams(params).toString()
    const resp = await axios.post(`https://clarity.dexcom.com/api/subject/${subjectId}/export`, form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    
    return resp.data
  }

  async generateReport(reportTypes: ReportType[], dates: string, timeZone: string, color: boolean = true, units: GlucoseUnits | undefined): Promise<ReportProgressInfo> {
    const analysisSession = await this.beginAnalysisSession()
    const subjectInfo = await this.getSubjectInfo()

    if (!units) {
      units = subjectInfo.glucose_unit
    }

    const reportParameters = {
      reports: JSON.stringify(reportTypes),
      analysisSessionId: analysisSession.analysisSessionId,
      dates,
      useGrayscale: JSON.stringify(!color)
    }

    const callbackPathParams = new URLSearchParams(reportParameters).toString()
    const callbackPath = `/reports/combined?${callbackPathParams}`

    const params = {
      callback_path: callbackPath,
      time_zone: timeZone
    }

    const resp = await this.axiosClient.post(`https://clarity.dexcom.com/reports/generate?locale=${subjectInfo.locale}&country=${subjectInfo.country}&units=${units}`, params)
    return resp.data
  }

  async pollForReportCompletion(url: string, pollCallback?: (progress: ReportProgressInfo) => void): Promise<ReportProgressInfo> {
    let lastStatus = ""
    let progress: ReportProgressInfo | undefined

    while (lastStatus !== "complete") {
      const resp = await axios.get(url)
      progress = resp.data
      lastStatus = resp.data.status

      if (pollCallback) pollCallback(resp.data)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return progress!
  }
}

export const reportTypes = ["overview", "patterns", "daily", "compare", "overlay", "hourlyStatistics", "dailyStatistics", "agp"]