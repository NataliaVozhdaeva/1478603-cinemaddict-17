import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import { EMOGI } from '../const.js';

const BLANK_COMMENT = {
  id: null,
  author: null,
  comment: '',
  date: '2022-05-11T16:12:32.554Z',
  emotion: null,
  isDisabled: true,
  isSaving: true,
};

function createNewCommentFormTemplate({ isDisabled, isSaving, ...newComment }) {
  const createEmogiList = () =>
    EMOGI.map(
      (emogi) => `
    <input 
      class="film-details__emoji-item visually-hidden" 
      name="comment-emoji" 
      type="radio" 
      id="emoji-${emogi}" 
      value="${emogi}"
      ${emogi === newComment.emotion ? 'checked' : ''}
     
      >
    <label  ${isDisabled ? 'disabled' : ''}class="film-details__emoji-label" for="emoji-${emogi}">
      <img src="./images/emoji/${emogi}.png" width="30" height="30" alt="${emogi}">
    </label>`
    ).join('');

  const emogiList = createEmogiList(EMOGI);
  const textComment = newComment.comment;

  const addNewEmogi =
    newComment.emotion !== null
      ? `<img src="./images/emoji/${newComment.emotion}.png" width="55" height="55" alt="${newComment.emotion}"> `
      : '';

  return `
    <div class="film-details__new-comment">
    <div class="film-details__add-emoji-label">${addNewEmogi}</div>
      <label class="film-details__comment-label">
        <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here" 
        name="comment" ${isDisabled ? 'disabled' : ''}>${isSaving ? 'loading...' : textComment}</textarea>
      </label>
      <div class="film-details__emoji-list">
        ${emogiList}
      </div>
    </div>`;
}

export default class NewCommentView extends AbstractStatefulView {
  emotions = [];
  #removeListener = null;

  constructor(newComment = BLANK_COMMENT) {
    super();
    this._state = NewCommentView.parseCommentToState(newComment);
    this.#setInnerHandlers();
  }

  #setInnerHandlers = () => {
    this.element
      .querySelectorAll('.film-details__emoji-item')
      .forEach((emogi) => emogi.addEventListener('click', this.#emogiToggleHandler));

    this.element.querySelector('.film-details__comment-input').addEventListener('input', this.#newCommentTextHandler);

    const pressKeyHandler = () => {
      const listener = (evt) => {
        if (evt.key === 'Enter' && (evt.metaKey || evt.ctrlKey)) {
          this.#saveData();
          document.removeEventListener('keydown', listener);
        }
      };

      document.addEventListener('keydown', listener);

      return () => document.removeEventListener('keydown', listener);
    };
    pressKeyHandler(this.newComment);
  };

  setAddNewCommentHandler = (callback) => {
    this._callback.addNewComment = callback;
  };

  #saveData = () => {
    this._callback.addNewComment(NewCommentView.parseStateToComment(this._state));
  };

  #emogiToggleHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      emotion: evt.target.value,
    });
  };

  #newCommentTextHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      comment: evt.target.value,
    });
  };

  _restoreHandlers = () => {
    this.#setInnerHandlers();
  };

  removeListeners = () => {
    this.element
      .querySelectorAll('.film-details__emoji-item')
      .forEach((emogi) => emogi.removeEventListener('click', this.#emogiToggleHandler));
    this.element
      .querySelector('.film-details__comment-input')
      .removeEventListener('input', this.#newCommentTextHandler);
  };

  static parseCommentToState = (newComment) => ({
    ...newComment,
    isDisabled: false,
    isSaving: false,
  });

  static parseStateToComment = (state) => {
    const newComment = { ...state };
    delete newComment.isDisabled;
    delete newComment.isSaving;
    this._setState = {};
    return newComment;
  };

  get template() {
    return createNewCommentFormTemplate(this._state);
  }

  remove() {
    this.#removeListener();
    this.#removeListener = null;
  }
}
