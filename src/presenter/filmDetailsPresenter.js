import { render, RenderPosition, remove, replace } from '../framework/render.js';
import FilmCardView from '../view/filmCardView';
import FilmDetailsView from '../view/filmDetailsView';
import CommentsListView from '../view/commentsListView';

const body = document.querySelector('body');
const Mode = {
  DEFAULT: 'DEFAULT',
  DETAILS: 'DETAILS',
};

export default class FilmDetailsPresenter {
  #filmContainer = null;

  #filmDetailsComponent = null;
  #filmCard = null;

  #changeData = null;
  #changeMode = null;

  #film = null;
  #allComments = [];
  #mode = Mode.DEFAULT;

  constructor(filmContainer, changeData, changeMode) {
    this.#filmContainer = filmContainer;
    this.#changeData = changeData;
    this.#changeMode = changeMode;
  }

  init = (film, allComments) => {
    this.#film = film;
    this.#allComments = allComments;

    const prevFilmCard = this.#filmCard;
    const prevFilmDetailsComponent = this.#filmDetailsComponent;

    this.#filmCard = new FilmCardView(film);
    this.#filmDetailsComponent = new FilmDetailsView(film);
    this.commentsList = new CommentsListView(film, allComments);

    this.#filmCard.setFilmDetailsHandler(this.#openDetailsClickHandler);
    this.#filmCard.setFavoriteClickHandler(this.#favoriteClickHandler);
    this.#filmCard.setAlreadyWatchedClickHandler(this.#alreadyWatchedClickHandler);
    this.#filmCard.setAddToWatchListClickHandler(this.#addToWatchListClickHandler);

    this.#filmDetailsComponent.setPopupCloseHandler(this.#closePopupHandler);

    if (prevFilmDetailsComponent === null || prevFilmCard === null) {
      render(this.#filmCard, this.#filmContainer);
      return;
    }

    /*  if (this.#mode === Mode.DEFAULT) {
      replace(this.#filmCard, prevFilmCard);
    } */

    /*   if (this.#mode === Mode.DETAILS) {
      replace(this.#filmDetailsComponent, prevFilmDetailsComponent);
    } */

    remove(prevFilmCard);
    remove(prevFilmDetailsComponent);
  };

  resetView = () => {
    if (this.#mode !== Mode.DEFAULT) {
      this.#closeFilmDetails();
    }
  };

  destroy = () => {
    remove(this.#filmCard);
    remove(this.#filmDetailsComponent);
  };

  #favoriteClickHandler = () => {
    this.#changeData({ ...this.#film, favorite: !this.#film.favorite });
  };

  #alreadyWatchedClickHandler = () => {
    //const property = film.userDetails.alreadyWatched;
    this.#changeData({ ...this.#film.userDetails, property: !this.#film.userDetails.alreadyWatched });
    console.log(this.#film.userDetails);
  };

  #addToWatchListClickHandler = () => {
    this.#changeData({ ...this.#film, watchlist: !this.#film.watchlist });
  };

  #openFilmDetails = () => {
    const footer = document.querySelector('.footer');
    render(this.#filmDetailsComponent, footer, RenderPosition.BEFOREBEGIN);
    render(this.commentsList, document.querySelector('.film-details__inner'));
    body.classList.add('hide-overflow');
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#changeMode();
    this.#mode = Mode.DETAILS;
  };

  #closeFilmDetails = () => {
    //this.#changeData(this.#film);
    remove(this.#filmDetailsComponent);
    body.classList.remove('hide-overflow');
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  };

  #openDetailsClickHandler = () => {
    this.#openFilmDetails();
  };

  #closePopupHandler = (film) => {
    //this.#changeData(film);
    this.#closeFilmDetails();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#closeFilmDetails();
    }
  };
}
