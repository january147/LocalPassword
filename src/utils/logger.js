// Simple logger without Tauri plugin dependency
export const log = (message, data = null) => {
    console.log(`[PasswordManager] ${message}`, data || '')
}

export const error = (message, err = null) => {
    console.error(`[PasswordManager] ${message}`, err || '')
}

export const warn = (message, data = null) => {
    console.warn(`[PasswordManager] ${message}`, data || '')
}

export const info = (message, data = null) => {
    console.info(`[PasswordManager] ${message}`, data || '')
}
