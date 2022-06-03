import { render, remove } from '../framework/render.js';
//import { updateItem } from '../utils/common.js';
import SortListView from '../view/sortView.js';
import FilmCardsContainerView from '../view/filmCardsContainerView';
import FilmListView from '../view/filmListView';
import ShowmoreBtn from '../view/showmoreBtnView';
import NoFilmView from '../view/noFilmsView';
import FilmCardsPresenter from './filmcardsPresenter';

const FILMCARD_PER_STEP = 5;

export default class BoardFilmsPresenter {
  #filmSection = null;
  #filmsModel = null;

  #filmList = new FilmListView();
  #filmCardsContainer = new FilmCardsContainerView();
  #showMoreBtn = new ShowmoreBtn();
  #sortComponent = new SortListView();
  #noFilmsComponent = new NoFilmView();

  #films = [];
  #allComments = [];
  #renderedFilmCards = FILMCARD_PER_STEP;

  constructor(filmSection, filmsModel) {
    this.#filmSection = filmSection;
    this.#filmsModel = filmsModel;
  }

  init = () => {
    this.#films = [...this.#filmsModel.films];
    this.allComments = [...this.#filmsModel.comments];

    this.#renderFilmList();
  };

  #handleShowMoreBtnClick = () => {
    this.#renderManyCards(this.#renderedFilmCards, this.#renderedFilmCards + FILMCARD_PER_STEP);
    this.#renderedFilmCards += FILMCARD_PER_STEP;

    if (this.#renderedFilmCards >= this.#films.length) {
      remove(this.#showMoreBtn);
    }
  };

  #renderSort = () => {
    render(this.#sortComponent, this.#filmList.element);
  };

  #renderNoFilms = () => {
    render(this.#noFilmsComponent, this.#filmSection);
  };

  #renderShowMoreBtn = () => {
    render(this.#showMoreBtn, this.#filmList.element);

    this.#showMoreBtn.setClickHandler(this.#handleShowMoreBtnClick);
  };

  #renderManyCards = (from, to) => {
    this.#films.slice(from, to).forEach((film) => film.renderOneFilmCard(film));
  };

  renderOneFilmCard = (film) => {
    const filmCardsPresenter = new FilmCardsPresenter();
    filmCardsPresenter.init(film, actualComments);
    render(filmCardsPresenter.element, this.filmCardContainer.element);
  };

  #renderFilmCardContainer = () => {
    render(this.#filmCardsContainer, this.#filmList.element);
    this.#renderManyCards(0, Math.min(this.#films.length, FILMCARD_PER_STEP));

    if (this.#films.length > FILMCARD_PER_STEP) {
      this.#renderShowMoreBtn();
    }
  };

  #renderFilmList = () => {
    render(this.#filmList, this.#filmSection);

    if (this.#films.length === 0) {
      this.#renderNoFilms();
      return;
    }

    this.#renderSort();
    this.#renderFilmCardContainer();
    this.renderOneFilmCard(film);
  };
}

/*  #clearFilmsContainer = () => {
    this.#filmDetailsPresenter.forEach((presenter) => presenter.destroy());
    this.#filmDetailsPresenter.clear();
    this.#renderedFilmCards = FILMCARD_PER_STEP;
    remove(this.#showMoreBtn);
  }; */
