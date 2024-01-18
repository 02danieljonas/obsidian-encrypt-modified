import { App, Modal, Notice, Setting, TextComponent } from "obsidian";
import { UiHelper } from "src/services/UiHelper";
import { IPasswordAndHint } from "./services/SessionPasswordService";
import { CryptoHelperFactory } from "./services/CryptoHelperFactory";

export default class PluginPasswordModal extends Modal {
    // input
    private title: string;
    private defaultPassword: IPasswordAndHint | null;
    //private defaultHint?: string | null = null;
    private confirmPassword: boolean;
    private isEncrypting: boolean;
    private singlePassword: boolean;
    private encryptedString: string;

    // output
    public resultConfirmed = false;
    public resultPassword: IPasswordAndHint;

    constructor(
        app: App,
        title: string,
        isEncrypting: boolean,
        confirmPassword: boolean,
        defaultPassword: IPasswordAndHint | null,
        singlePassword: boolean,
        encryptedString: string
    ) {
        super(app);
        this.title = title;
        this.defaultPassword = defaultPassword;
        this.confirmPassword = confirmPassword;
        this.isEncrypting = isEncrypting;
        this.singlePassword = singlePassword;
        this.encryptedString = encryptedString;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.empty();

        this.invalidate();

        let password = this.defaultPassword?.password ?? "";
        let confirmPass = "";
        let hint = this.defaultPassword?.hint ?? "";

        new Setting(contentEl).setHeading().setName(this.title);

        /* Main password input*/

        UiHelper.buildPasswordSetting({
            container: contentEl,
            name: "Password:",
            placeholder: this.isEncrypting ? "" : `Hint: ${hint}`,
            initialValue: password,
            autoFocus: password == "",
            onChangeCallback: (value) => {
                password = value;
                this.invalidate();
            },
            onEnterCallback: async (value) => {
                password = value;
                this.invalidate();

                if (password.length > 0) {
                    if (sConfirmPassword.settingEl.isShown()) {
                        //tcConfirmPassword.inputEl.focus();
                        const elInp = sConfirmPassword.components.find(
                            (bc) => bc instanceof TextComponent
                        );
                        if (elInp instanceof TextComponent) {
                            elInp.inputEl.focus();
                        }
                    } else if (sHint.settingEl.isShown()) {
                        //tcHint.inputEl.focus();
                        const elInp = sHint.components.find(
                            (bc) => bc instanceof TextComponent
                        );
                        if (elInp instanceof TextComponent) {
                            elInp.inputEl.focus();
                        }
                    } else if (await validate()) {
                        this.close();
                    }
                }
            },
        });

        /* End Main password input row */

        /* Confirm password input row */
        const sConfirmPassword = UiHelper.buildPasswordSetting({
            container: contentEl,
            name: "Confirm Password:",
            autoFocus: password != "",
            onChangeCallback: (value) => {
                confirmPass = value;
                this.invalidate();
            },
            onEnterCallback: async (value) => {
                confirmPass = value;
                this.invalidate();
                if (confirmPass.length > 0) {
                    if (await validate()) {
                        if (sHint.settingEl.isShown()) {
                            //tcHint.inputEl.focus();
                            const elInp = sHint.components.find(
                                (bc) => bc instanceof TextComponent
                            );
                            if (elInp instanceof TextComponent) {
                                elInp.inputEl.focus();
                            }
                        }
                    }
                }
            },
        });

        if (!this.confirmPassword) {
            sConfirmPassword.settingEl.hide();
        }

        /* End Confirm password input row */

        /* Hint input row */
        const sHint = new Setting(contentEl)
            .setName("Optional Password Hint")
            .addText((tc) => {
                //tcHint = tc;
                tc.inputEl.placeholder = `Password Hint`;
                tc.setValue(hint);
                tc.onChange((v) => (hint = v));
                tc.inputEl.on("keypress", "*", async (ev, target) => {
                    if (
                        ev.key == "Enter" &&
                        target instanceof HTMLInputElement &&
                        target.value.length > 0
                    ) {
                        ev.preventDefault();
                        if (await validate()) {
                            this.close();
                        }
                    }
                });
            });
        if (!this.isEncrypting) {
            sHint.settingEl.hide();
        }

        /* END Hint text row */

        new Setting(contentEl).addButton((cb) => {
            cb.setButtonText("Confirm").onClick(async (evt) => {
                if (await validate()) {
                    this.close();
                }
            });
        });

        const validate = async (): Promise<boolean> => {
            this.invalidate();

            sConfirmPassword.setDesc("");

            if (this.confirmPassword) {
                if (password != confirmPass) {
                    // passwords don't match
                    sConfirmPassword.setDesc("Passwords don't match");
                    return false;
                }
            }

            // todo check if password can decrypt that one file
            const cryptoHelper = CryptoHelperFactory.BuildDefault();

            const decryptedText = await cryptoHelper.decryptFromBase64(
                this.encryptedString,
                password
            );

            console.log({decryptedText});
            console.log({eS: this.encryptedString});
            console.log({password});
            

            if (
                this.isEncrypting &&
                this.singlePassword &&
                decryptedText == null
            ) {
                console.debug(
                    "3. This password does not match the default password."
                );
                new Notice(
                    "This password does not match the default password."
                );

                return false;
            }

            this.resultConfirmed = true;
            this.resultPassword = { password, hint };

            return true;
        };
    }

    openAsync(): Promise<IPasswordAndHint> {
        return new Promise<IPasswordAndHint>((resolve, reject) => {
            this.onClose = () => {
                if (this.resultConfirmed == true) {
                    resolve(this.resultPassword);
                } else {
                    reject();
                }
            };

            this.open();
        });
    }

    private invalidate() {
        this.resultConfirmed = false;
        this.resultPassword = { password: "", hint: "" };
    }
}
