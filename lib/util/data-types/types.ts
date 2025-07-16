export type TKeysOfType<T, V> = {
    [K in keyof T]: Exclude<T[K], undefined> extends V ? K : never;
}[keyof T];
