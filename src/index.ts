var cron = require('node-cron')
import dotenv from 'dotenv'
import {
	GetWebURL_ENV,
	GetHistoryFilePath_ENV,
	GetWebHookWhole_ENV,
	GetWebHookOneDecimal_ENV,
	GetWebHookTwoDecimal_ENV,
	GetWebHookThreeDecimal_ENV,
	GetWebHookSystemException_ENV,
	GetCronSchedule_ENV
} from './lib/env'
import {
	GetWebpageSource,
	ConvertTOJSON,
	GetPreviousExchangeRate,
	GetUpToNthDecimal,
	CheckAndReport,
	SaveCurrentExchangeRate,
	ReportSystemException
} from './lib/functions'
import { RateHistoryStructure, RateWebhookStructure } from "./lib/types"

// environment variables
dotenv.config()
const WebURL = GetWebURL_ENV()
const HistroyFilePath = GetHistoryFilePath_ENV()
const ExceptionWebhook = GetWebHookSystemException_ENV()
const RateWebhooks: RateWebhookStructure = {
	whole_url: GetWebHookWhole_ENV(),
	one_decimal_url: GetWebHookOneDecimal_ENV(),
	two_decimal_url: GetWebHookTwoDecimal_ENV(),
	three_decimal_url: GetWebHookThreeDecimal_ENV()
}
const Schedule = GetCronSchedule_ENV()

// main process
function Main() {

	// scraping the data provider web page
	GetWebpageSource(WebURL).then(Source => {

		// open and close tags
		const RateTableOpenTag = '<table class="rate_table">'
		const RateTableCloseTag = '</table>'

		// extract the exchange rate table
		const RateTableSource = Source.substring(
			Source.lastIndexOf(RateTableOpenTag),
			Source.lastIndexOf(RateTableCloseTag) + RateTableCloseTag.length
		)

		// convert html table to json object
		const RateTableObject = ConvertTOJSON(RateTableSource)

		let OneJPY = ""

		// find JPY to MMK row
		for (let i = 0; i < RateTableObject.table.tr.length; i++) {
			const Record = RateTableObject.table.tr[i]
			if (Record.td) {
				const InnerText = Record.td[1]._text
				if (InnerText && InnerText.indexOf("MMK") >= 0) {
					OneJPY = InnerText
				}
			}
		}

		// in case of JPY to MMK no longer support
		if (OneJPY == "") {
			throw new Error("MMK rate not found.")
		}

		// get the last saved exchange rate
		const PreviousRate: RateHistoryStructure = GetPreviousExchangeRate(HistroyFilePath)

		// current exchange rate
		const CurrentRate: RateHistoryStructure = {
			whole: GetUpToNthDecimal(OneJPY, 0),
			one_decimal: GetUpToNthDecimal(OneJPY, 1),
			two_decimal: GetUpToNthDecimal(OneJPY, 2),
			three_decimal: GetUpToNthDecimal(OneJPY, 3),
			four_decimal: GetUpToNthDecimal(OneJPY, 4),
			five_decimal: GetUpToNthDecimal(OneJPY, 5),
			six_decimal: GetUpToNthDecimal(OneJPY, 6)
		}

		// reprot the rate change of whole number
		CheckAndReport(PreviousRate.six_decimal, CurrentRate.six_decimal, PreviousRate.whole, CurrentRate.whole, RateWebhooks.whole_url)

		// report the rate change up to one decimal place
		CheckAndReport(PreviousRate.six_decimal, CurrentRate.six_decimal, PreviousRate.one_decimal, CurrentRate.one_decimal, RateWebhooks.one_decimal_url)

		// report the rate change up to two decimal places
		CheckAndReport(PreviousRate.six_decimal, CurrentRate.six_decimal, PreviousRate.two_decimal, CurrentRate.two_decimal, RateWebhooks.two_decimal_url)

		// report the rate change up to three decimal places
		CheckAndReport(PreviousRate.six_decimal, CurrentRate.six_decimal, PreviousRate.three_decimal, CurrentRate.three_decimal, RateWebhooks.three_decimal_url)

		// save the current exchange rate to history file
		SaveCurrentExchangeRate(HistroyFilePath, JSON.stringify(CurrentRate))

	}).catch(Exception => {
		// report error to admins
		ReportSystemException(Exception, ExceptionWebhook)
	})
}

cron.schedule(Schedule, () => {
	Main()
	const Now = new Date()
	console.log(`Exchange rate reporter executed in ${Now.toLocaleDateString()} ${Now.toLocaleTimeString()}`)
});