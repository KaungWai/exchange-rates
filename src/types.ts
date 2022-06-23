export type TableStructure = {
    table: {
        tr: {
            th: {
                _text: string
            },
            td: {
                _text: string
            }[]
        }[]
    }
}

export type HistoryStructure = {
    whole: number,
    one_decimal: number,
    two_decimal: number,
    three_decimal: number,
    four_decimal: number,
    five_decimal: number,
    six_decimal: number
}

export type WebhookStructure = {
    whole_url: string,
    one_decimal_url: string,
    two_decimal_url: string
}