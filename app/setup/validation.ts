export const directory = (input: string): boolean | string => {
    const trimmed = input.trim();
    if (!trimmed) return 'Directory cannot be empty';
    if (/[<>:"|?*]/.test(trimmed)) return 'Invalid characters in path';
    return true;
};

export const url = (input: string): boolean | string => {
    try {
        new URL(input.trim());
        return true;
    } catch {
        return 'Please enter a valid URL';
    }
};

export const apiKey = (input: string): boolean | string => {
    const trimmed = input.trim();
    if (!trimmed) return 'API key cannot be empty';
    if (trimmed.length < 10) return 'API key seems too short';
    return true;
};
