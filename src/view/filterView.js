import AbstractView from '../framework/view/abstract-view.js';

const createFilterItemTemplate = (filter, currentFilterType) => {
  const { type, name, count } = filter;
  let countTemplate;
  name !== 'All movies'
    ? (countTemplate = '<span class="main-navigation__item-count">' + count + '</span>')
    : (countTemplate = '');

  return `<a href="#${name}" class="main-navigation__item ${
    type === currentFilterType ? 'main-navigation__item--active' : ''
  }" data-filter-type="${type}">
  ${name} ${countTemplate}</a>
  `;
};

const createFilterTemplate = (filterItems, currentFilterType) => {
  const filterItemsTemplate = filterItems.map((filter) => createFilterItemTemplate(filter, currentFilterType)).join('');

  return `<nav class="main-navigation">
    ${filterItemsTemplate}
   </nav> `;
};

export default class FilterView extends AbstractView {
  #filters = null;
  #currentFilter = null;

  constructor(filters, currentFilterType) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilterType;
  }

  get template() {
    return createFilterTemplate(this.#filters, this.#currentFilter);
  }

  setFilterTypeChangeHandler = (callback) => {
    this._callback.filterTypeChange = callback;
    this.element.addEventListener('click', this.#filterTypeChangeHandler);
  };

  #filterTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'A') {
      return;
    }
    evt.preventDefault();
    this._callback.filterTypeChange(evt.target.dataset.filterType);
  };
}
