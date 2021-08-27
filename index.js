import {PaginationButton} from './js/pagination.js';

const imgUrl = 'https://image.tmdb.org/t/p/w1280';
const apiKey = '04c35731a5ee918f014970082a0088b1';
const apiUrl = 'https://api.themoviedb.org/3/discover/movie?';
const searchUrl = 'https://api.themoviedb.org/3/search/movie?api_key=04c35731a5ee918f014970082a0088b1&query=';
const sortByPopularityDesc = 'popularity.desc';
const genresUrl = 'https://api.themoviedb.org/3/genre/movie/list?api_key=04c35731a5ee918f014970082a0088b1';

const moviesElWrapper = document.querySelector('.movies__wrapper');
const formEl = document.querySelector('.header__form');
const formInputEl = document.querySelector('.form__input');
const popupContainer = document.querySelector('.popup__container');
const popup = document.querySelector('.popup');
const specificationsForm = document.querySelector('.specifications__form');

const votesEls = document.querySelectorAll('.vote__container input');
const yearEl = document.querySelector('#year');
const genresContainer = document.querySelector('.specifications__form-genres');


getMovies(sortByPopularityDesc);
getGenres();


specificationsForm.addEventListener('submit', (e) => {
   e.preventDefault();
   const genresEls = document.querySelectorAll('.genres__container input');
   const genres = [];
   let votes = [];
   const year = yearEl.value;

   genresEls.forEach(item => item.checked ? genres.push(item.value) : false);
   votesEls.forEach(item => item.checked ? votes = item.value : false);

   getMovieWithFilter(year, genres, votes);
})

const paginationButtons = new PaginationButton(500, 5);
paginationButtons.render();
paginationButtons.onChange(e => {
   getMovies(sortByPopularityDesc, e.target.value)
});

async function getMovieWithFilter(year, genres = [], vote) {
   let withGenres = '';
   let voteAverageGte = '&vote_average.gte=';
   let voteAverageLte = '&vote_average.lte=';
   if (genres.length > 0) {
      withGenres = '&with_genres='
      withGenres += genres.join('%2C');
   }

   if (+vote <= 5) {
      voteAverageGte += 5;
      voteAverageLte += 0;
   } else if (+vote > 5 && +vote <= 7.5) {
      voteAverageGte += 5.1;
      voteAverageLte += 7.5;
   } else {
      voteAverageGte += 7.6;
      voteAverageLte += 10;
   }

   const resp = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&page=1${`&year=${year}` || ''}${voteAverageGte}${voteAverageLte}${withGenres}`);
   const data = await resp.json();
   renderMovies(data.results)
}

async function getGenres() {
   const resp = await fetch(genresUrl);
   const data = await resp.json();
   genresRender(data.genres)
}

async function getMovies(sort, page = 1) {
   const resp = await fetch(`${apiUrl}api_key=${apiKey}&sort_by=${sort}&page=${page}`);
   const data = await resp.json();
   console.log(data)
   renderMovies(data.results);
}

async function getSearchMovies(search) {
   const resp = await fetch(searchUrl + search);
   const data = await resp.json();
   renderMovies(data.results);
}


async function getDetailsMovie(id) {
   const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=04c35731a5ee918f014970082a0088b1&append_to_response=videos,images`);
   const data = await resp.json();
   popupRender(data)
}

function genresRender(data) {
   data.forEach(genres => {
      genresContainer.innerHTML += `
        <label class="genres__container">${genres.name}
          <input type="checkbox" value="${genres.id}">
          <span class="genres__checkmark"></span>
        </label>`;
   });
}

function popupRender(data) {
   console.log(data)
   popupContainer.classList.remove('hidden');

   // video ulr or placeholder video
   const videoUlr = data?.videos?.results[0]?.key || 'ScMzIvxBSi4';

   popup.innerHTML = `
    <button type="button" class="popup__close"><i class="fas fa-times"></i></button>
     <div class="popup__header">
      <h2>${data.title}</h2>
      <span class="movie__rating popup__rating ${voteFormat(data['vote_average'])}">${data.vote_average}</span>
    </div>
    <iframe src="https://www.youtube.com/embed/${videoUlr}" title="YouTube video player"  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    <div class="popup__body">
      <div class="popup__body-overview">
        <h2>Overview:</h2>
        <p>${data.overview}</p>
      </div>
      <div class="popup__body-production-countries">
       ${data.production_countries.map(item => `<span>${item.name}</span>`).join(' ')}
        <p><span class="runtime">${data.runtime}</span>min</p>
      </div>
      <ul class="popup__info">
        <li>
          <h2>Date:</h2>
          <p><span>${new Date(data.release_date).getFullYear()}</span></p>
        </li>
        <li class="popup__info-genres">
          <h2>Genres:</h2>
          <p>
            ${data.genres.map(item => `<a href="#" data-idgenres="${item.id}">${item.name}</a>`).join(' ')}
          </p>
        </li>
        <li>
          <h2>Budget:</h2>
          <p><span>${data.budget}</span>$</p>
        </li>
        <li>
          <h2>Revenue:</h2>
          <p><span>${data.revenue}</span>$</p>
        </li>
      </ul>
      <div class="production-company">
        <h2>Production companies:</h2>
        <ul class="production-company__item">
          ${data.production_companies.map(item => {
      let src = `https://via.placeholder.com/100`
      if (item.logo_path) {
         src = `https://image.tmdb.org/t/p/w200${item.logo_path}`
      }
      return `
            <li>
              <img src="${src}" alt="${item.name}" data-companiesid="item.id">
              <a href="#">${item.name}</a>
            </li>`;
   }).join(' ')}
        </ul>
      </div>
    </div>`;


}


function renderMovies(movies) {
   if (movies.length === 0) {
      console.log(movies.length)
      return document.querySelector('.movies').innerHTML = `<h2> no results were found for <mark>${formInputEl.value}</mark></h2>`;
   }

   moviesElWrapper.innerHTML = '';
   movies.forEach(movies => {
      moviesElWrapper.innerHTML += `
        <div class="movies__item movie" data-id="${movies.id}">
          <img class="movie__img" src="${imgUrl}${movies['poster_path']}" alt="">
          <div class="movie__info">
            <p>${movies['title']}</p>
            <span class="movie__rating ${voteFormat(movies['vote_average'])}">${movies['vote_average']}</span>
          </div>
        </div>`;
   });
}

moviesElWrapper.addEventListener('click', (e) => {
   if (e.target.closest('.movies__item')) {
      const id = e.target.closest('.movies__item').dataset.id;
      getDetailsMovie(id);
   }
})

function voteFormat(num) {
   if (+num < 5) {
      return 'bad-rating'
   } else if (+num >= 5 && +num <= 7.5) {
      return 'normal-rating'
   } else {
      return 'cool-rating'
   }
}


formEl.addEventListener('submit', (e) => {
   e.preventDefault();
   getSearchMovies(formInputEl.value)
})

document.body.addEventListener('click', (e) => {
   if (e.target.closest('.popup__close') || e.target.classList.contains('popup__container')) {
      popupContainer.classList.add('hidden');
   }
})




