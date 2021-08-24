const imgUrl = 'https://image.tmdb.org/t/p/w1280';
const apiKey = '04c35731a5ee918f014970082a0088b1';
const apiUrl = 'https://api.themoviedb.org/3/discover/movie?';
const searchUrl = 'https://api.themoviedb.org/3/search/movie?api_key=04c35731a5ee918f014970082a0088b1&query=';
const sortByPopularityDesc = 'popularity.desc';
const page = 1;

const moviesElWrapper = document.querySelector('.movies__wrapper');
const paginationEl = document.querySelector('.pagination');
const paginationItemEls = document.querySelectorAll('.pagination__item');
const movieRatingEls = document.querySelectorAll('.movie__rating');
const formEl = document.querySelector('.header__form');
const formInputEl = document.querySelector('.form__input');



getMovies(sortByPopularityDesc, page)
async function getMovies(sort, page) {
   const resp = await fetch(`${apiUrl}api_key=${apiKey}&sort_by=${sort}&page=${page}`);
   const data =  await resp.json();
   renderMovies(data.results);
}

async function getSearchMovies(search) {
   const resp = await fetch(searchUrl+search);
   const data = await resp.json();
   renderMovies(data.results);
}

function renderMovies(movies) {
   console.log(movies)
   if (movies.length === 0) {
      console.log(movies.length)
      return document.querySelector('.movies').innerHTML = `<h2> no results were found for <mark>${formInputEl.value}</mark></h2>`;
   }

   moviesElWrapper.innerHTML = '';
   movies.forEach(movies => {
      moviesElWrapper.innerHTML += `
        <div class="movies__item movie">
          <img class="movie__img" src="${imgUrl}${movies['poster_path']}" alt="">
          <div class="movie__info">
            <p>${movies['title']}</p>
            <span class="movie__rating ${voteFormat(movies['vote_average'])}">${movies['vote_average']}</span>
          </div>
        </div>`;
   });
}

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



// paginationEl.addEventListener('click', (e) => {
//    const target = e.target;
//
//    if (target.classList.contains('pagination__item')) {
//       paginationItemEls.forEach(item => item.classList.remove('active'));
//       target.classList.add('active');
//    } else if (target.classList.contains('pagination__prev')) {
//       console.log('prev')
//    } else if (target.classList.contains('pagination__next')) {
//       const active = paginationEl.querySelector('.active');
//
//       // const nextActive =
//       console.log(active)
//       console.log('next')
//    }
//
// })


