import { account } from "./auth";

export interface UserPreferences {
    // Theme & Appearance
    theme: "light" | "dark" | "system";
    accentColor: string;
    fontSize: "small" | "medium" | "large";
    fontFamily: string;

    // Profile
    avatar: string;
    bio: string;

    // Room Preferences
    defaultView: "ide" | "whiteboard";
    showDockOnStart: boolean;
    enableSoundNotifications: boolean;

    // Editor Preferences
    editorTheme: string;
    tabSize: number;
    wordWrap: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
    theme: "dark",
    accentColor: "142.1 70.6% 45.3%", // Green
    fontSize: "medium",
    fontFamily: "Inter",
    avatar: "",
    bio: "",
    defaultView: "ide",
    showDockOnStart: false,
    enableSoundNotifications: true,
    editorTheme: "vs-dark",
    tabSize: 2,
    wordWrap: true,
};

/**
 * Get user preferences from Appwrite
 */
export async function getUserPreferences(): Promise<UserPreferences> {
    try {
        const prefs = await account.getPrefs();
        return {
            ...DEFAULT_PREFERENCES,
            ...prefs,
        };
    } catch (error) {
        console.error("Failed to get user preferences:", error);
        return DEFAULT_PREFERENCES;
    }
}

/**
 * Update user preferences in Appwrite
 */
export async function updateUserPreferences(
    preferences: Partial<UserPreferences>
): Promise<UserPreferences> {
    try {
        const currentPrefs = await getUserPreferences();
        const updatedPrefs = {
            ...currentPrefs,
            ...preferences,
        };
        await account.updatePrefs(updatedPrefs);
        return updatedPrefs;
    } catch (error) {
        console.error("Failed to update user preferences:", error);
        throw error;
    }
}

/**
 * Reset preferences to defaults
 */
export async function resetPreferences(): Promise<UserPreferences> {
    try {
        await account.updatePrefs(DEFAULT_PREFERENCES);
        return DEFAULT_PREFERENCES;
    } catch (error) {
        console.error("Failed to reset preferences:", error);
        throw error;
    }
}

/**
 * Update user password
 */
export async function updatePassword(
    currentPassword: string,
    newPassword: string
): Promise<void> {
    try {
        await account.updatePassword(newPassword, currentPassword);
    } catch (error) {
        console.error("Failed to update password:", error);
        throw error;
    }
}

/**
 * Update user name
 */
export async function updateName(name: string): Promise<void> {
    try {
        await account.updateName(name);
    } catch (error) {
        console.error("Failed to update name:", error);
        throw error;
    }
}

/**
 * Update user email (requires password verification)
 */
export async function updateEmail(
    email: string,
    password: string
): Promise<void> {
    try {
        await account.updateEmail(email, password);
    } catch (error) {
        console.error("Failed to update email:", error);
        throw error;
    }
}
