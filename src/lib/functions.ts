import got from "got"
import { xml2json } from "xml-js";
import { TableStructure, RateHistoryStructure } from "./types"
import { readFileSync, writeFileSync } from "fs"

export async function GetWebpageSource(URL: string): Promise<string> {
	const Reponse = (await got.get(URL)).body
	return Reponse
}

export function GetPreviousExchangeRate(Path: string): RateHistoryStructure {
	const History = readFileSync(Path, {
		encoding: "utf-8"
	})
	return <RateHistoryStructure>JSON.parse(History)
}

export function SaveCurrentExchangeRate(Path: string, Data: string): void {
	writeFileSync(Path, Data)
}

export function CheckAndReport(CurrentExactValue: number, PreviousValue: number, CurrentValue: number, URL: string): void {
	if (PreviousValue != CurrentValue) {
		const Report = `${CurrentExactValue}
(${CurrentValue > PreviousValue ? "+" : ""}${GetUpToNthDecimal(String(CurrentValue - PreviousValue), 6)})`
		got.post(URL, {
			json: {
				content: Report
			}
		})
	}
}

export function GetUpToNthDecimal(InputText: string, N: number): number {
	if (N <= 0) {
		return Number.parseInt(InputText.split(".")[0])
	} else {
		const WholeNumber = InputText.split(".")[0]
		const Decimal = InputText.split(".").length > 1 ? InputText.split(".")[1] : ""
		return Decimal == "" ? Number.parseInt(WholeNumber) : Number(WholeNumber + "." + Decimal.substring(0, N))
	}
}

export function ConvertTOJSON(XML: string): TableStructure {
	const ResultString = xml2json(XML, {
		compact: true,
		ignoreComment: true,
		ignoreDoctype: true,
		ignoreAttributes: true,
		ignoreDeclaration: true
	})
	return <TableStructure>JSON.parse(ResultString)
}

export function ReportSystemException(Exception: Error, URL: string): void {
	const Report = `${Exception.name}: ${Exception.message}

${Exception.stack}`

	got.post(URL, {
		json: {
			content: Report
		}
	})
}