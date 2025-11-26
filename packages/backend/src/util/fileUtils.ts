/**
 * Checks if a string is a valid filename for both Windows and Linux.
 * @param fileName The filename to validate.
 * @returns True if the filename is valid on both systems, false otherwise.
 */
export function isValidFilename(fileName: string): boolean {
    // Check if empty or only whitespace
    if (!fileName || fileName.trim().length === 0)
        return false;

    // Check length (Windows has 255 char limit for filename)
    if (fileName.length > 255)
        return false;

    // Windows reserved characters: < > : " / \ | ? *
    const windowsReservedChars = /[<>:"/\\|?*]/;
    if (windowsReservedChars.test(fileName))
        return false;

    // Windows reserved names (case-insensitive)
    const windowsReservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    if (windowsReservedNames.test(fileName))
        return false;

    // Control characters (0x00-0x1F)
    if (/[\x00-\x1F]/.test(fileName))
        return false;

    // Windows doesn't allow filenames ending with space or period
    if (/[ .]$/.test(fileName))
        return false;

    return true;
}