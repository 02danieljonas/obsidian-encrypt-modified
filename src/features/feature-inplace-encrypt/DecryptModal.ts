import { App, Modal, Notice, Setting, TextAreaComponent } from 'obsidian';

export default class DecryptModal extends Modal {
	text: string;
	decryptInPlace: boolean = false;
	showCopyButton: boolean

	constructor(
		app: App,
		title: string,
		text: string = '',
		showCopyButton:boolean
	) {
		super(app);
		this.titleEl.setText(title);
		this.text = text;
		this.showCopyButton = showCopyButton;
	}

	onOpen() {
		let { contentEl } = this;

		let cTextArea : TextAreaComponent;
		const sText = new Setting(contentEl)
			.addTextArea( cb=>{
				cTextArea = cb;
				cb.setValue(this.text);
				cb.inputEl.readOnly = true;
				cb.inputEl.rows = 10;
				cb.inputEl.style.width = '100%';
				cb.inputEl.style.resize = 'vertical';
			})
		;
		sText.settingEl.querySelector('.setting-item-info').remove();

		const sActions =	new Setting(contentEl);

		if (this.showCopyButton){

			sActions
				.addButton( cb =>{
					cb
						.setButtonText('Copy')
						.onClick( evt =>{
							navigator.clipboard.writeText( cTextArea.getValue() );
							new Notice('Copied!');
						})
					;
					if (!this.showCopyButton){

					}
				})
			;
		}

		sActions
			.addButton( cb =>{
				cb
					.setWarning()
					.setButtonText('Decrypt in-place')
					.onClick( evt =>{
						this.decryptInPlace = true;
						this.close();
					})
				;
			})
		;

	}

}