import { load } from "@tauri-apps/plugin-store";

export interface SettingsData {
    teamNumber: number;
    eventCode: string;
    year: number;

    frcEventsUsername: string;
    frcEventsAuthKey: string;

    useNexus: boolean;
    nexusAPIKey: string;

    tbaAuthKey: string;

    ytVideoId: string;
    robotImgSrc: string;
}

const defaults: SettingsData = {
    teamNumber: 340,
    eventCode: `NYRO`,
    year: new Date().getFullYear(),
    frcEventsUsername: ``,
    frcEventsAuthKey: ``,
    useNexus: true,
    nexusAPIKey: ``,
    tbaAuthKey: ``,
    ytVideoId: `wzGRs-C8kqs`,
    robotImgSrc: ``,
};

const store = await load("store.json", { autoSave: true, defaults: defaults as any });

export class Settings {
    private constructor() {}

    public static async set<T extends keyof SettingsData>(key: T, value: SettingsData[T]): Promise<void> {
        await store.set(key, value);
    }

    public static async get<T extends keyof SettingsData>(key: T): Promise<SettingsData[T]> {
        return (await store.get(key)) ?? defaults[key];
    }

    public static async getAll(): Promise<SettingsData> {
        const loaded = Object.fromEntries(await store.entries());
        const base = Object.assign({}, defaults);
        for (const [k, v] of Object.entries(base)) {
            if (typeof loaded[k] === typeof v) {
                (base as any)[k] = loaded[k];
            }
        }

        return base;
    }
}
