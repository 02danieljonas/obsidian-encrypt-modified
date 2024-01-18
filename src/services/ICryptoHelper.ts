export interface ICryptoHelper{
	encryptToBase64(text: string, password: string): Promise<string>;
	useSinglePassword(password: string): Promise<void>;
	decryptFromBase64(base64Encoded: string, password: string): Promise<string|null>;
}