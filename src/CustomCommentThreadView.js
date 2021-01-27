import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import UIModel from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import BaseCommentThreadView from '@ckeditor/ckeditor5-comments/src/comments/ui/view/basecommentthreadview';

import './customcommentthreadview.css';

export default class CustomCommentThreadView extends BaseCommentThreadView {
	constructor(...args) {
		super(...args);

		// The template definition is partially based on the default comment thread view.
		const templateDefinition = {
			tag: 'div',

			attributes: {
				class: ['ck-thread', this.bindTemplate.if('isActive', 'ck-thread--active')],
				// Needed for managing focus after adding a new comment.
				tabindex: -1
			},

			children: [
				{
					tag: 'div',
					attributes: {
						class: 'ck-thread__container'
					},
					children: [this.commentsListView, this.commentThreadInputView]
				}
			]
		};

		const isNewThread = this.length == 0;
		const isAuthor = isNewThread || this._localUser == this._model.comments.get(0).author;

		// Add the actions dropdown only if the local user is the author of the comment thread.
		if (isAuthor) {
			templateDefinition.children.unshift({
				tag: 'div',
				attributes: {
					class: 'ck-thread-top-bar'
				},

				children: [this._createActionsDropdown()]
			});
		}

		this.setTemplate(templateDefinition);

		if (this.length > 0) {
			// If there is a comment when the thread is created, apply custom behavior to it.
			this._modifyFirstCommentView();
		} else {
			// If there are no comments (an empty thread was created by a user),
			// listen to `this.commentsListView` and wait for the first comment to be added.
			this.listenTo(this.commentsListView.commentViews, 'add', evt => {
				// And apply the custom behavior when it is added.
				this._modifyFirstCommentView();

				evt.off();
			});
		}
	}

	_createActionsDropdown() {
		const dropdownView = createDropdown(this.locale);

		dropdownView.buttonView.set({
			label: 'Actions',
			withText: true
		});

		const items = new Collection();

		const editButtonModel = new UIModel({
			withText: true,
			label: 'Edit',
			action: 'edit'
		});

		// The button should be enabled when the read-only mode is off.
		// So, `isEnabled` should be a negative of `isReadOnly`.
		editButtonModel.bind('isEnabled').to(this._model, 'isReadOnly', isReadOnly => !isReadOnly);

		// Hide the button if the thread has no comments yet.
		editButtonModel.bind('isVisible').to(this, 'length', length => length > 0);

		items.add({
			type: 'button',
			model: editButtonModel
		});

		const removeButtonModel = new UIModel({
			withText: true,
			label: 'Delete',
			action: 'delete'
		});

		removeButtonModel.bind('isEnabled').to(this._model, 'isReadOnly', isReadOnly => !isReadOnly);

		items.add({
			type: 'button',
			model: removeButtonModel
		});

		addListToDropdown(dropdownView, items);

		dropdownView.on('execute', evt => {
			const { action } = evt.source;

			if (action == 'edit') {
				this.commentsListView.commentViews.get(0).switchToEditMode();
			}

			if (action == 'delete') {
				this.fire('removeCommentThread');
			}
		});

		return dropdownView;
	}

	_modifyFirstCommentView() {
		// Get the first comment.
		const commentView = this.commentsListView.commentViews.get(0);

		// By default, the comment button is bound to the model state
		// and the buttons are visible only if the current local user is the author.
		// You need to remove this binding and make buttons for the first
		// comment always invisible.
		commentView.removeButton.unbind('isVisible');
		commentView.removeButton.isVisible = false;

		commentView.editButton.unbind('isVisible');
		commentView.editButton.isVisible = false;
	}
}
