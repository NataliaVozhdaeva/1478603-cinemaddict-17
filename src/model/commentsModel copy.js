import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

export default class CommentsModel extends Observable {
  #filmsApiService = null;
  #comments = [];

  constructor(filmsApiService) {
    super();
    this.#filmsApiService = filmsApiService;
  }

  get comments() {
    return this.#comments;
  }

  init = async (film) => {
    try {
      const comments = await this.#filmsApiService.getComments(film);
      this.#comments = comments;
      console.log('model ', this.#comments);
    } catch (err) {
      this.#comments = [];
    }

    this._notify(UpdateType.INIT);
  };

  addComment = (updateType, update) => {
    this.#comments = [update, ...this.#comments];
    this._notify(updateType, update);
  };

  deleteComment = (updateType, update) => {
    const index = this.#comments.findIndex((comment) => comment.id === update.id);

    if (index === -1) {
      throw new Error("Can't delete unexisting comment");
    }

    this.#comments = [...this.#comments.slice(0, index), ...this.#comments.slice(index + 1)];

    this._notify(updateType, update);
  };
}
