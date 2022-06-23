import got from "got"
import { xml2json } from "xml-js";
import { TableStructure, HistoryStructure } from "../types"
import { readFileSync, writeFileSync } from "fs"

export async function GetWebpageSource(URL: string): Promise<string> {
	const Reponse = (await got.get(URL)).body
	return Reponse
}

export function GetPreviousExchangeRate(Path: string): HistoryStructure {
	const History = readFileSync(Path, {
		encoding: "utf-8"
	})
	return <HistoryStructure>JSON.parse(History)
}

export function SaveCurrentExchangeRate(Path: string, Data: string): void {
	writeFileSync(Path, Data)
}

export function CheckAndReport(PreviousValue: number, CurrentValue: number, URL: string, N: number): void {
	if (PreviousValue != CurrentValue) {
		const Report = `${CurrentValue}
(${CurrentValue > PreviousValue ? "+" : ""}${GetUpToNthDecimal(String(CurrentValue - PreviousValue), N)})`
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