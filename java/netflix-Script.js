const apikey = "e950e51d5d49e85f7c2f17f01eb23ba3";
const apiEndpoint = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/original";

const apiPaths = {
  fetchAllCategories: `${apiEndpoint}/genre/movie/list?api_key=${apikey}`,
  fetchMoviesList: (id) =>
    `${apiEndpoint}/discover/movie?api_key=${apikey}&with_genres=${id}`,
  fetchTrending: `${apiEndpoint}/trending/all/day?api_key=${apikey}&language=en-US`,
  searchOnYoutube: (query) =>
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyA_eZ5WJhmYhRQOM8-jAyVIzzdfWUlp_P0`,
};

const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  body.classList.add("light-mode");
  themeToggleBtn.textContent = "🌙 Dark Mode";
} else {
  body.classList.add("dark-mode");
  themeToggleBtn.textContent = "☀️ Light Mode";
}

themeToggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  body.classList.toggle("light-mode");
  if (body.classList.contains("dark-mode")) {
    themeToggleBtn.textContent = "☀️ Light Mode";
    localStorage.setItem("theme", "dark");
  } else {
    themeToggleBtn.textContent = "🌙 Dark Mode";
    localStorage.setItem("theme", "light");
  }
});

document.getElementById("get-started").addEventListener("click", function () {
  const emailInput = document.getElementById("email-input");
  const errorMsg = document.getElementById("email-error");
  if (!emailInput.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
    errorMsg.textContent = "Please enter a valid email address.";
  } else {
    errorMsg.textContent = "";
    alert("Welcome to Netflix Clone!");
  }
});

const faqButtons = document.querySelectorAll(".faq-question");
faqButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const answer = btn.nextElementSibling;
    answer.style.display = answer.style.display === "block" ? "none" : "block";
  });
});

function init() {
  fetchTrendingMovies();
  fetchAndBuildAllSections();
}

function fetchTrendingMovies() {
  fetchAndbuildMovieSection(apiPaths.fetchTrending, "Trending Now")
    .then((list) => {
      const randomIndex = parseInt(Math.random() * list.length);
      buildBannerSection(list[randomIndex]);
    })
    .catch((err) => console.error(err));
}

function buildBannerSection(movie) {
  const bannerCont = document.getElementById("banner-section");
  bannerCont.style.backgroundImage = `url('${imgPath}${movie.backdrop_path}')`;
  const div = document.createElement("div");
  div.innerHTML = `
      <h2 class="banner__title">${movie.title || movie.name}</h2>
      <p class="banner__info">Trending | Released - ${
        movie.release_date || "N/A"
      }</p>
      <p class="banner__overview">
        ${
          movie.overview && movie.overview.length > 200
            ? movie.overview.slice(0, 200).trim() + "..."
            : movie.overview
        }
      </p>
      <div class="action-buttons-cont">
        <button class="action-button">▶ Play</button>
        <button class="action-button">ℹ More Info</button>
      </div>
  `;
  div.className = "banner-content container";
  bannerCont.innerHTML = "";
  bannerCont.append(div);
}

function fetchAndBuildAllSections() {
  fetch(apiPaths.fetchAllCategories)
    .then((res) => res.json())
    .then((res) => {
      const categories = res.genres;
      if (Array.isArray(categories) && categories.length) {
        categories.forEach((category) => {
          fetchAndbuildMovieSection(
            apiPaths.fetchMoviesList(category.id),
            category.name
          );
        });
      }
    })
    .catch((err) => console.error(err));
}

function fetchAndbuildMovieSection(fetchUrl, categoryName) {
  return fetch(fetchUrl)
    .then((res) => res.json())
    .then((res) => {
      const movies = res.results;
      if (Array.isArray(movies) && movies.length) {
        buildMoviesSection(movies.slice(0, 6), categoryName);
      }
      return movies;
    })
    .catch((err) => console.error(err));
}

function buildMoviesSection(list, categoryName) {
  const moviesCont = document.getElementById("movies-cont");
  const moviesListHTML = list
    .map((item) => {
      return `
      <div class="movie-item" 
           onmouseenter="searchMovieTrailer('${
             item.title || item.name
           }', 'yt${item.id}')">
        <img class="move-item-img" src="${imgPath}${item.backdrop_path}" alt="${
        item.title || item.name
      }" />
        <div class="iframe-wrap" id="yt${item.id}"></div>
      </div>`;
    })
    .join("");
  const moviesSectionHTML = `
      <h2 class="movie-section-heading">${categoryName} 
        <span class="explore-nudge">Explore All</span>
      </h2>
      <div class="movies-row">
        ${moviesListHTML}
      </div>
  `;
  const div = document.createElement("div");
  div.className = "movies-section";
  div.innerHTML = moviesSectionHTML;
  moviesCont.append(div);
}

function searchMovieTrailer(movieName, iframId) {
  if (!movieName) return;
  fetch(apiPaths.searchOnYoutube(movieName))
    .then((res) => res.json())
    .then((res) => {
      const bestResult = res.items[0];
      const elements = document.getElementById(iframId);
      if (elements && !elements.hasChildNodes()) {
        const div = document.createElement("div");
        div.innerHTML = `<iframe width="245px" height="150px" 
          src="https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1&controls=0">
        </iframe>`;
        elements.append(div);
      }
    })
    .catch((err) => console.log(err));
}

window.addEventListener("load", function () {
  init();
  window.addEventListener("scroll", function () {
    const header = document.getElementById("header");
    const nav = document.querySelector(".top-navigation");
    if (window.scrollY > 5) header.classList.add("black-bg");
    else header.classList.remove("black-bg");
    if (window.scrollY > 50) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  });
});
