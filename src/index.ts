import dotenv from 'dotenv'
import { GetWebURL_ENV, GetHistoryFilePath_ENV, GetWebHookWhole_ENV, GetWebHookOneDecimal_ENV, GetWebHookTwo_ENV } from './lib/env'
import { GetWebpageSource, ConvertTOJSON, GetPreviousExchangeRate, GetUpToNthDecimal, CheckAndReport, SaveCurrentExchangeRate } from './lib/functions'
import { HistoryStructure, WebhookStructure } from "./types"

dotenv.config()

const WebURL = GetWebURL_ENV()
const HistroyFilePath = GetHistoryFilePath_ENV()
const Webhooks: WebhookStructure = {
	whole_url: GetWebHookWhole_ENV(),
	one_decimal_url: GetWebHookOneDecimal_ENV(),
	two_decimal_url: GetWebHookTwo_ENV()
}

function Main() {
	GetWebpageSource(WebURL).then(Source => {
		const RateTableOpenTag = '<table class="rate_table">'
		const RateTableCloseTag = '</table>'
		const RateTableSource = Source.substring(
			Source.lastIndexOf(RateTableOpenTag),
			Source.lastIndexOf(RateTableCloseTag) + RateTableCloseTag.length
		)
		const RateTableObject = ConvertTOJSON(RateTableSource)

		let OneJPY = ""

		for (let i = 0; i < RateTableObject.table.tr.length; i++) {
			const Record = RateTableObject.table.tr[i]
			if (Record.td) {
				const InnerText = Record.td[1]._text
				if (InnerText && InnerText.indexOf("MMK") >= 0) {
					OneJPY = InnerText
				}
			}
		}

		if (OneJPY == "") {
			throw new Error("MMK rate not found.")
		}

		const PreviousRate: HistoryStructure = GetPreviousExchangeRate(HistroyFilePath)

		const CurrentRate: HistoryStructure = {
			whole: GetUpToNthDecimal(OneJPY, 0),
			one_decimal: GetUpToNthDecimal(OneJPY, 1),
			two_decimal: GetUpToNthDecimal(OneJPY, 2),
			three_decimal: GetUpToNthDecimal(OneJPY, 3),
			four_decimal: GetUpToNthDecimal(OneJPY, 4),
			five_decimal: GetUpToNthDecimal(OneJPY, 5),
			six_decimal: GetUpToNthDecimal(OneJPY, 6)
		}

		CheckAndReport(PreviousRate.whole, CurrentRate.whole, Webhooks.whole_url, 0)
		CheckAndReport(PreviousRate.one_decimal, CurrentRate.one_decimal, Webhooks.one_decimal_url, 1)
		CheckAndReport(PreviousRate.two_decimal, CurrentRate.two_decimal, Webhooks.two_decimal_url, 2)

		SaveCurrentExchangeRate(HistroyFilePath, JSON.stringify(CurrentRate))
	}).catch(e => {
		console.log(e)
	})
}

Main()