document.addEventListener('DOMContentLoaded', function() {
    fetchMoviesByCategory('love-stories-results', 10749); // 10749 is the genre ID for Romance
    fetchMoviesByCategory('action-movies-results', 28); // 28 is the genre ID for Action
    fetchPopularTVShows();
});

document.getElementById('search').addEventListener('click', function() {
    const query = document.getElementById('query').value;
    if (query) {
        searchMoviesAndTVShows(query);
    }
});

function fetchMoviesByCategory(containerId, genreId) {
    const apiKey = '5c536cfff785de66004ac0050d6ca003';
    const url = `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&api_key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayResults(data.results, containerId);
        })
        .catch(error => {
            console.error('Error fetching movies by category:', error);
        });
}

function fetchPopularTVShows() {
    const apiKey = '5c536cfff785de66004ac0050d6ca003';
    const url = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayResults(data.results, 'tv-results', true);
        })
        .catch(error => {
            console.error('Error fetching popular TV shows:', error);
        });
}

function searchMoviesAndTVShows(query) {
    const apiKey = '5c536cfff785de66004ac0050d6ca003';
    const movieUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey}`;
    const tvUrl = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&api_key=${apiKey}`;

    fetch(movieUrl)
        .then(response => response.json())
        .then(data => {
            displayResults(data.results, 'search-results');
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
        });

    fetch(tvUrl)
        .then(response => response.json())
        .then(data => {
            displayResults(data.results, 'search-results', true);
        })
        .catch(error => {
            console.error('Error fetching TV shows:', error);
        });
}

function fetchCredits(id, isTV) {
    const apiKey = '5c536cfff785de66004ac0050d6ca003';
    const url = `https://api.themoviedb.org/3/${isTV ? 'tv' : 'movie'}/${id}/credits?api_key=${apiKey}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const producers = data.crew.filter(person => person.job === 'Producer');
            return producers.map(producer => producer.name).join(', ');
        })
        .catch(error => {
            console.error('Error fetching credits:', error);
            return 'Unknown';
        });
}

function displayResults(results, containerId, isTV = false) {
    const resultsDiv = document.getElementById(containerId);
    resultsDiv.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
        return;
    }

    results.forEach(async (item) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');

        const title = document.createElement('h3');
        title.textContent = isTV ? item.name : item.title;

        const year = document.createElement('p');
        year.textContent = `Year: ${item.release_date ? item.release_date.split('-')[0] : (item.first_air_date ? item.first_air_date.split('-')[0] : 'Unknown')}`;

        const rating = document.createElement('p');
        rating.textContent = `Rating: ${item.vote_average}`;

        const img = document.createElement('img');
        img.src = item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : 'https://via.placeholder.com/150';
        img.alt = isTV ? item.name : item.title;

        const description = document.createElement('p');
        description.classList.add('description');
        description.textContent = item.overview;

        const producer = document.createElement('p');
        producer.classList.add('producer');
        producer.textContent = 'Producers: Loading...';
        const producerNames = await fetchCredits(item.id, isTV);
        producer.textContent = `Producers: ${producerNames}`;

        img.addEventListener('click', function() {
            showDetailedView(title.textContent, item.overview, producer.textContent);
        });

        itemDiv.appendChild(img);
        itemDiv.appendChild(title);
        itemDiv.appendChild(year);
        itemDiv.appendChild(rating);

        resultsDiv.appendChild(itemDiv);
    });
}

function showDetailedView(title, description, producer) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);

    const detailedView = document.createElement('div');
    detailedView.classList.add('detailed-view');

    const detailedTitle = document.createElement('h2');
    detailedTitle.textContent = title;

    const detailedDescription = document.createElement('p');
    detailedDescription.textContent = description;

    const detailedProducer = document.createElement('p');
    detailedProducer.textContent = producer;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', function() {
        document.body.removeChild(detailedView);
        document.body.removeChild(overlay);
    });

    detailedView.appendChild(detailedTitle);
    detailedView.appendChild(detailedDescription);
    detailedView.appendChild(detailedProducer);
    detailedView.appendChild(closeButton);

    document.body.appendChild(detailedView);

    overlay.style.display = 'block';
    detailedView.style.display = 'block';
}
