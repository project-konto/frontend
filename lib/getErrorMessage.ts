import type { AxiosError } from 'axios'

export function getErrorMessage(error: unknown, fallback: string) {
    const err = error as AxiosError<any>;
    const message =
        (err?.response?.data as any)?.message ??
        (err?.response?.data as any)?.error ??
        err?.message;

    return typeof message === 'string' && message.trim().length > 0 ? message : fallback;
}