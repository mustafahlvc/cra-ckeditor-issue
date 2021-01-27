import CommentView from '@ckeditor/ckeditor5-comments/src/comments/ui/view/commentview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class ImportantCommentView extends CommentView {
	constructor(...args) {
		super(...args);

		// Bind `isImportant` value to comment model custom attributes.
		this.bind('isImportant').to(this._model, 'attributes', attributes => !!attributes.isImportant);
	}

	_getTemplate() {
		// Use the original method to get the default template.
		// The default template definition structure is described in the comment view API.
		const templateDefinition = super._getTemplate();

		// If `isImportant` is `true`, add the `ck-comment--important` class to the template.
		templateDefinition.children[0].attributes.class.push(
			this.bindTemplate.if('isImportant', 'ck-comment--important')
		);

		// Add the new button next to other comment buttons (edit and remove).
		templateDefinition.children[0].children[1].children[1].children.unshift(this._createImportantButtonView());

		return templateDefinition;
	}

	_createImportantButtonView() {
		// Create a new button view.
		return;
		const button = new ButtonView(this.locale);

		// Create an icon for the button view.
		const starIcon =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M15.22 18.36c.18-.02.35-.1.46-.25a.6.6 0 00.11-.5l-1.12-5.32 4.12-3.66a.6.6 0 00.18-.65.63.63 0 00-.54-.42l-5.54-.6L10.58 2a.64.64 0 00-.58-.37.64.64 0 00-.58.37l-2.3 4.94-5.55.6a.63.63 0 00-.54.43.6.6 0 00.18.65l4.12 3.66-1.12 5.32c-.05.24.04.49.25.63.2.14.47.16.68.04L10 15.59l4.86 2.69c.1.06.23.09.36.08zm-.96-1.83l-3.95-2.19a.65.65 0 00-.62 0l-3.95 2.19.91-4.33a.6.6 0 00-.2-.58L3.1 8.64l4.51-.5a.64.64 0 00.51-.36L10 3.76l1.88 4.02c.09.2.28.34.5.36l4.52.5-3.35 2.98a.6.6 0 00-.2.58l.91 4.33z"/></svg>';

		// Use the localization service.
		// The feature will be translatable.
		const { t } = this.locale;

		// Set the label and the icon for the button.
		button.set({
			icon: starIcon,
			isToggleable: true,
			tooltip: t('Important'),
			withText: true
		});

		// Add a class to the button to style it.
		button.extendTemplate({
			attributes: {
				class: 'ck-button-important'
			}
		});

		// The button should be enabled if the comment model is not in read-only mode.
		// The same setting is used for other comment buttons.
		button.bind('isEnabled').to(this._model, 'isReadOnly', value => !value);

		// The button should be hidden if the comment is not editable
		// (this is true when the current user is not the comment author).
		// The same setting is used for other comment buttons.
		button.bind('isVisible').to(this._model, 'isEditable');

		// When the button is clicked, change the comment state in the comment model.
		// The `attributes.isImportant` value will be available together with the other comment data.
		button.on('execute', () => {
			this._model.setAttribute('isImportant', !this._model.attributes.isImportant);
		});

		return button;
	}
}

export default CommentView;
