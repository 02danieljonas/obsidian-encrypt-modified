import { App, PluginSettingTab, Setting } from "obsidian";
import { IMeldEncryptPluginFeature } from "src/features/IMeldEncryptPluginFeature";
import { SessionPasswordService } from "src/services/SessionPasswordService";
import MeldEncrypt from "../main";
import { IMeldEncryptPluginSettings } from "./MeldEncryptPluginSettings";
import { UiHelper } from "src/services/UiHelper";
import { CryptoHelperFactory } from "src/services/CryptoHelperFactory";

export default class MeldEncryptSettingsTab extends PluginSettingTab {
    plugin: MeldEncrypt;
    settings: IMeldEncryptPluginSettings;

    features: IMeldEncryptPluginFeature[];

    constructor(
        app: App,
        plugin: MeldEncrypt,
        settings: IMeldEncryptPluginSettings,
        features: IMeldEncryptPluginFeature[]
    ) {
        super(app, plugin);
        this.plugin = plugin;
        this.settings = settings;
        this.features = features;
    }

    display(): void {
        const { containerEl } = this;

        const cryptoHelper = CryptoHelperFactory.BuildDefault();

        containerEl.empty();

        const updateSinglePasswordSettingsUi = () => {
            if (!this.settings.singlePassword) {
                singlePassword.settingEl.hide();
                return;
            }
            singlePassword.settingEl.show();
        };


        new Setting(containerEl)
            .setName("Use Single Password for encryption")
            .setDesc(
                "Only allow the use of one password for future password encryptions"
            )
            .addToggle((toggle) => {
                toggle
                    .setValue(this.settings.singlePassword)
                    .onChange(async (value) => {
                        this.settings.singlePassword = value;
                        console.log(this.settings.encryptedString);
                        await this.plugin.saveSettings();
                        updateSinglePasswordSettingsUi();
                    });
            });

        const singlePassword = UiHelper.buildPasswordSetting({
            container: containerEl,
            name: "Password for encryption:",
            desc: "This is the only valid password for future encryption, any other password will not work",
            onChangeCallback: async (value) => {
                const arr = new Uint32Array(1);
                crypto.getRandomValues(arr);

                this.settings.encryptedString =
                    await cryptoHelper.encryptToBase64(
                        arr[0].toString(),
                        value
                    );
            },
        });

        new Setting(containerEl)
            .setName("Default Hint")
            .setDesc("Default hint to use on every new password")
            .addText((tc) => {
                tc.inputEl.placeholder = `Default Hint`;
                tc.setValue(this.settings.defaultHint);
                tc.onChange(async (v) => {
                    this.settings.defaultHint = v;
                    await this.plugin.saveSettings();
                    return v;
                });
                tc.inputEl.on("keypress", "*", (ev, target) => {
                    if (
                        ev.key == "Enter" &&
                        target instanceof HTMLInputElement &&
                        target.value.length > 0
                    ) {
                        ev.preventDefault();
                    }
                });
            });

        new Setting(containerEl)
            .setName("Confirm password?")
            .setDesc("Confirm password when encrypting. (Recommended)")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.settings.confirmPassword)
                    .onChange(async (value) => {
                        this.settings.confirmPassword = value;
                        await this.plugin.saveSettings();
                    });
            });

        updateSinglePasswordSettingsUi();

        const updateRememberPasswordSettingsUi = () => {
            if (!this.settings.rememberPassword) {
                pwTimeoutSetting.settingEl.hide();
                rememberPasswordLevelSetting.settingEl.hide();
                return;
            }

            pwTimeoutSetting.settingEl.show();
            rememberPasswordLevelSetting.settingEl.show();

            const rememberPasswordTimeout =
                this.settings.rememberPasswordTimeout;

            let timeoutString = `For ${rememberPasswordTimeout} minutes`;
            if (rememberPasswordTimeout == 0) {
                timeoutString = "Until Obsidian is closed";
            }

            pwTimeoutSetting.setName(`Remember Password (${timeoutString})`);
        };

        new Setting(containerEl)
            .setName("Remember password?")
            .setDesc(
                "Remember the last used passwords when encrypting or decrypting.  Passwords are remembered until they timeout or Obsidian is closed"
            )
            .addToggle((toggle) => {
                toggle
                    .setValue(this.settings.rememberPassword)
                    .onChange(async (value) => {
                        this.settings.rememberPassword = value;
                        await this.plugin.saveSettings();
                        SessionPasswordService.setActive(
                            this.settings.rememberPassword
                        );
                        updateRememberPasswordSettingsUi();
                    });
            });

        const pwTimeoutSetting = new Setting(containerEl)
            .setDesc("The number of minutes to remember passwords.")
            .addSlider((slider) => {
                slider
                    .setLimits(0, 120, 5)
                    .setValue(this.settings.rememberPasswordTimeout)
                    .onChange(async (value) => {
                        this.settings.rememberPasswordTimeout = value;
                        await this.plugin.saveSettings();
                        SessionPasswordService.setAutoExpire(
                            this.settings.rememberPasswordTimeout
                        );
                        updateRememberPasswordSettingsUi();
                    });
            });
        const rememberPasswordLevelSetting = new Setting(containerEl)
            .setDesc(
                "Remember passwords by using a notes file name or parent folder"
            )
            .addDropdown((cb) => {
                cb.addOption(SessionPasswordService.LevelFilename, "File Name")
                    .addOption(
                        SessionPasswordService.LevelParentPath,
                        "Parent Folder"
                    )
                    .setValue(this.settings.rememberPasswordLevel)
                    .onChange(async (value) => {
                        this.settings.rememberPasswordLevel = value;
                        await this.plugin.saveSettings();
                        SessionPasswordService.setLevel(
                            this.settings.rememberPasswordLevel
                        );
                        updateRememberPasswordSettingsUi();
                    });
            });
        updateRememberPasswordSettingsUi();

        // build feature settings
        this.features.forEach((f) => {
            f.buildSettingsUi(
                containerEl,
                async () => await this.plugin.saveSettings()
            );
        });
    }
}
