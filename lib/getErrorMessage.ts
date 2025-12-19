import type { AxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<any>;
    const data = err?.response?.data as any;

    const message = data?.Message ?? data?.message ??
        data?.error ?? data?.Error ?? err?.message;

    const details = data?.Details ?? data?.details;

    if (typeof message === "string" && message.trim().length > 0) {
        if (typeof details === "string" && details.trim().length > 0) {
            return `${message}. ${details}`;
        }

        return message;
    }

    return fallback;
}