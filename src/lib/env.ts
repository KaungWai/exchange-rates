export function GetWebURL_ENV(): string {
    return <string>process.env.WEB_URL
}

export function GetHistoryFilePath_ENV(): string {
    return <string>process.env.HISTORY_FILE_PATH
}

export function GetWebHookWhole_ENV(): string {
    return <string>process.env.WEBHOOK_WHOLE_URL
}

export function GetWebHookOneDecimal_ENV(): string {
    return <string>process.env.WEBHOOK_ONE_DECIMAL_URL
}

export function GetWebHookTwoDecimal_ENV(): string {
    return <string>process.env.WEBHOOK_TWO_DECIMAL_URL
}

export function GetWebHookThreeDecimal_ENV(): string {
    return <string>process.env.WEBHOOK_THREE_DECIMAL_URL
}

export function GetWebHookSystemException_ENV(): string {
    return <string>process.env.WEBHOOK_SYSTEM_EXCEPTION_URL
}

export function GetCronSchedule_ENV(): string {
    return <string>process.env.NODE_CRON_SCHEDULE
}