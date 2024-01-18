import { IFeatureInplaceEncryptSettings } from "../features/feature-inplace-encrypt/IFeatureInplaceEncryptSettings";
import { IFeatureWholeNoteEncryptSettings } from "../features/feature-whole-note-encrypt/IFeatureWholeNoteEncryptSettings";

export interface IMeldEncryptPluginSettings {
	confirmPassword: boolean;
	rememberPassword: boolean;
	singlePassword: boolean;
	defaultHint: string;
	encryptedString: string;
	rememberPasswordTimeout: number;
	rememberPasswordLevel: string;
	featureWholeNoteEncrypt : IFeatureWholeNoteEncryptSettings;
	featureInplaceEncrypt : IFeatureInplaceEncryptSettings;
}

