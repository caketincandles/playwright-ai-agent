import { TAiConfig } from '@src/config/types';

export interface IProjectPageConfig {
    readonly directory: string;
    readonly classSuffixes?: readonly string[];
}

export interface IProjectLocatorConfig extends IProjectPageConfig {
    readonly paramSuffixes?: readonly string[];
}

export interface ISettingsSetupConfig {
    readonly locators: IProjectLocatorConfig;
    readonly pages: IProjectPageConfig;
}

export interface ISetupConfig {
    readonly settings: ISettingsSetupConfig;
    readonly ai: TAiConfig;
}
