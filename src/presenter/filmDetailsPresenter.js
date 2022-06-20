import FilmDetailsView from '../view/filmDetailsView';
import CommentsListView from '../view/commentsListView';
import FilmDetailsSectionView from '../view/filmDetailsSectionView';
import FilmDetailsFormView from '../view/filmDetailsFormView';
import NewCommentView from '../view/newCommentFormView';
import CommentsModel from '../model/commentsModel.js';
import { UserAction, UpdateType } from '../const.js';
import { render, RenderPosition, remove, replace } from '../framework/render.js';
import { nanoid } from 'nanoid';

const body = document.querySelector('body');

export default class FilmDetailsPresenter {
  #filmDetailsContainer = null;
  #filmDetailsSection = null;
  #filmDetailsForm = null;
  #filmDetailsComponent = null;
  #commentsList = null;
  #changeData = null;
  #film = null;
  #userDetails = null;
  #newComment = null;
  prevFilmDetailsComponent = null;
  prevFilmDetailsSection = null;
  prevFilmDetailsForm = null;
  prevCommentsList = null;
  #commentsModel = null;

  constructor(filmDetailsContainer, changeData) {
    this.#filmDetailsContainer = filmDetailsContainer;
    this.#changeData = changeData;
    this.#commentsModel = new CommentsModel();
    this.#newComment = new NewCommentView();
    this.#commentsModel.addObserver(this.#handleModelEvent);
  }

  get comments() {
    return this.#commentsModel.comments;
  }

  show = (film) => {
    this.#film = film;
    this.#userDetails = this.#film.userDetails;
    this.prevFilmDetailsComponent = this.#filmDetailsComponent;
    this.prevFilmDetailsSection = this.#filmDetailsSection;
    this.prevFilmDetailsForm = this.#filmDetailsForm;
    this.prevCommentsList = this.#commentsList;

    this.#filmDetailsSection = new FilmDetailsSectionView();
    this.#filmDetailsForm = new FilmDetailsFormView();
    this.#filmDetailsComponent = new FilmDetailsView(this.#film);
    this.#commentsList = new CommentsListView(this.#filterComments);

    this.#filmDetailsComponent.setPopupCloseHandler(this.#closePopupHandler);
    this.#commentsList.setDeleteClickHandler(this.#handleDeleteClick);
    this.#newComment.setFormSubmitHandler(this.#handleFormSubmit);

    this.#filmDetailsComponent.setFavoriteClickHandlerOnFilmDetails(this.#handleFavoriteClick);
    this.#filmDetailsComponent.setAlreadyWatchedClickHandlerOnFilmDetails(this.#handleAlreadyWatchedClick);
    this.#filmDetailsComponent.setAddToWatchListClickHandlerOnFilmDetails(this.#handleAddToWatchListClick);

    if (this.prevFilmDetailsComponent === null) {
      this.#renderPopup();
      return;
    }

    if (this.#filmDetailsComponent !== this.prevFilmDetailsComponentt) {
      this.#filmDetailsSection = this.prevFilmDetailsSection;
      this.#filmDetailsForm = this.prevFilmDetailsForm;
      replace(this.#filmDetailsComponent, this.prevFilmDetailsComponent);
    }

    if (this.#commentsList !== this.prevCommentsList) {
      replace(this.#commentsList, this.prevCommentsList);
      this.#renderNewCommentSection();
    }
  };

  #renderPopup = () => {
    body.classList.add('hide-overflow');
    render(this.#filmDetailsSection, this.#filmDetailsContainer, RenderPosition.BEFOREBEGIN);
    render(this.#filmDetailsForm, this.#filmDetailsSection.element);
    this.#renderFilmDitails();
    this.#renderComments();
    this.#renderNewCommentSection();

    /*  const handleNewTaskButtonClick = () => {
      boardPresenter.createTask(handleNewTaskSectionClose);
      newTaskButtonComponent.element.disabled = true;
    };
 */
    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  #renderFilmDitails = () => {
    render(this.#filmDetailsComponent, this.#filmDetailsForm.element);
  };

  #renderComments = () => {
    render(this.#commentsList, this.#filmDetailsForm.element);
  };

  #renderNewCommentSection = () => {
    render(this.#newComment, this.#commentsList.element);
  };

  #closeFilmDetails = () => {
    body.classList.remove('hide-overflow');
    remove(this.#filmDetailsSection);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.prevFilmDetailsComponent = null;
    this.#filmDetailsComponent = null;
    this.#film = null;
  };

  #closePopupHandler = () => {
    this.#closeFilmDetails();
  };

  #filterComments = () => {
    const allComments = this.comments;
    const commentForFilm = this.#film.comments;
    const actualComments = allComments.filter(({ id }) => commentForFilm.some((commentId) => commentId === id));
    return actualComments;
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#closeFilmDetails();
    }
  };

  #handleFavoriteClick = () => {
    this.#changeData(UserAction.UPDATE_COMPONENT, UpdateType.MINOR, {
      ...this.#film,
      userDetails: { ...this.#userDetails, favorite: !this.#userDetails.favorite },
    });
  };

  #handleAlreadyWatchedClick = () => {
    this.#changeData(UserAction.UPDATE_COMPONENT, UpdateType.MINOR, {
      ...this.#film,
      userDetails: { ...this.#userDetails, alreadyWatched: !this.#userDetails.alreadyWatched },
    });
  };

  #handleAddToWatchListClick = () => {
    this.#changeData(UserAction.UPDATE_COMPONENT, UpdateType.MINOR, {
      ...this.#film,
      userDetails: { ...this.#userDetails, watchlist: !this.#userDetails.watchlist },
    });
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.ADD_COMPONENT:
        this.#commentsModel.addComment(updateType, update);
        break;
      case UserAction.DELETE_COMPONENT:
        this.#commentsModel.deleteComment(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, update, filmsComments) => {
    filmsComments = this.#film.comments;

    switch (updateType) {
      case UpdateType.PATCH:
        this.show(this.#film);
        break;
      case UpdateType.MINOR:
        document.removeEventListener('keydown', this.#handleFormSubmit);
        console.log('handleModelEvent');
        filmsComments.push(update.id);
        this.show(this.#film);
        break;
      case UpdateType.MAJOR:
        break;
    }
  };

  #handleDeleteClick = (comment) => {
    this.#handleViewAction(UserAction.DELETE_COMPONENT, UpdateType.PATCH, comment);
  };

  #handleFormSubmit = (comment) => {
    console.log('handleFormSubmit');
    this.#handleViewAction(UserAction.ADD_COMPONENT, UpdateType.MINOR, { ...comment, id: nanoid() });
  };

  destroy = () => {
    if (this.#newComment === null) {
      return;
    }
    remove(this.#filmDetailsSection);
  };
}
