let nominatedMovies = []


//fetch data from OMDB
const fetchMovies = async (searchInput) => {
    const response = await axios.get('https://www.omdbapi.com/', {
        params: {
            apikey: '934e47ff',
            s: searchInput,
            type: 'movie',
        }
    })
    // Упрощаем жизнь тернарником
    // if (response.data.Error) return []
    // return response.data.Search;

    return response.data.Error ? [] : response.data.Search;
}


//search after user stops typing
// не понял вот эту штуку timeoutId. Это локальная переменная и Вы ее ниоткуда не вызовите
// const search = (callback) => {
//     let timeoutId;
//     return (...args) => {
//         if (timeoutId) clearTimeout(timeoutId);
//         timeoutId = setTimeout(() => callback.apply(null, args), 500);
//     };
// };

// const search = (callback) => (...args) => setTimeout(() => callback.apply(null, args), 500);
// или если он Вам рально нужен
let timeoutId;
const search = (callback) => (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(null, args), 500);
};

const createLink = (context, ...args) => {
    let id;
    let link = document.createElement('li');
    if (args.length !== 0) {
        id = args[0]
        link.setAttribute('id', id);
    }
    link.classList.add('list-group-item');
    link.innerHTML = context;
    return link

}

//display movie list
const changeInput = async event => {

    if (event.target.value.length === 0) document.querySelector('#movieList').innerHTML = '';
    let movies = await fetchMovies(event.target.value);

    // старайтесь всегда объявлять переменную. const или let
    const result = document.querySelector('.resultTitle');

    // лишний текст. сократите
    /*if (movies.length === 0) {
        result.innerHTML = `<p><b>Movie not found!</b></p>`
        return;
    }*/
    if (movies.length === 0) return result.innerHTML = `<p><b>Movie not found!</b></p>`;


    result.innerHTML = `<h5 class="text-monospace font-weight-bold">Results for "${event.target.value}":</h5>`;

    const movieList = document.querySelector('#movieList')
    if (movieList.hasChildNodes()) movieList.innerHTML = ''

    // Если это не ассинхронный for , я рекомендую использовать map
    // for (let movie of movies) {
    movies.map(movie => {

        // Используйте упрощенный синтаксис. Если после стрелки не открывтать скобку, то это априори returb
        // const findMovie = nominatedMovies.find(el => {
        //     return el === movie.imdbID
        // })

        // Вы можете поступить красиво и сделать десериализацию
        const {Title, Year, imdbID} = movie;

        const findMovie = nominatedMovies.find(el => el === imdbID)
        const inStorage = movie.imdbID in localStorage




        // зачем 2 раза писать код? У вас разница только в disabled
        /*const context = `
            ${movie.Title} (${movie.Year})
             <a target="_blank" href="https://www.imdb.com/title/${movie.imdbID}">Imdb</a>
            ${findMovie || inStorage ? `
            <button type="button" class=list-group-item-action" id="${movie.imdbID}" disabled onclick="nominate('${movie.imdbID}')">Nominate</button>` :
            `<button type="button" class=list-group-item-action" id="${movie.imdbID}"  onclick="nominate('${movie.imdbID}')">Nominate</button> `}
       `*/
        const context = `
            ${Title} (${Year})
             <a target="_blank" href="https://www.imdb.com/title/${imdbID}">Imdb</a>
             <button type="button" class=list-group-item-action" id="${imdbID}" ${(findMovie || inStorage) && 'disabled'} onclick="nominate('${imdbID}')">Nominate</button>`;


        const li = createLink(context)
        movieList.appendChild(li)
    })
}


// в этом случае ок, но я рекомендую делать по id, вдруг у Вас будет несколько инпутов.
const input = document.querySelector('input');

//search for movie
input.addEventListener('input', search(changeInput));

//clear input field on select
input.addEventListener('select', e => {
    e.target.value = ''
});


/////add movie to nomination list

nominate = async param => {

    /////search for a movie based on id
    const response = await (axios.get('https://www.omdbapi.com/', {
        params: {
            apikey: '934e47ff',
            i: param
        }
    }));


    const movie = response.data;
    const nominations = document.querySelector('#nominationTitle')
    nominations.innerHTML = `<h5 class="text-monospace font-weight-bold">Nominations:</h5>`;


    // опять десериализация
    const {Title, Year, imdbID } = movie;

    ////created unic id by adding u+imdbID so it's possible to use imdbID in two elements on the page
    let context = `
    ${Title} (${Year}) <a target="_blank" href="https://www.imdb.com/title/${imdbID}">Imdb</a> 
    <button  type="button" class=list-group-item-action" onclick="removeMovie('${imdbID}')">Remove</button>  
`
    // const li = createLink(context, `u${movie.imdbID}`) сократим
    document.querySelector('#nominationList').appendChild(createLink(context, `u${imdbID}`))
    document.querySelector(`#${param}`).disabled = true;
    nominatedMovies.push(imdbID);
    localStorage.setItem(imdbID.toString(), context);

}

////-remove movie from nomination list and enable 'nominate' button
removeMovie = param => {

    const nodes = document.querySelector('#nominationList');
    // пользуйтесь тильдой
    // const target = document.querySelector('#u' + param);
    const target = document.querySelector(`u${param}`);
    nodes.removeChild(target);
    localStorage.removeItem(param);

    if (!nodes.hasChildNodes()) document.querySelector('#nominationTitle').innerHTML = '';
    const nominatedMoviesUpdate = nominatedMovies.filter(curr => curr != param)
    //update array of nominated movies 
    nominatedMovies = [...nominatedMoviesUpdate];
    const btn = document.querySelector(`#${param}`)
    if (btn) btn.disabled = false;
}

///// After user leaves the page , nomination list is saved in localStorage
const checkStorage = () => {
/// -> for testing purpose to clear localstorage
    //localStorage.clear()
    if (localStorage.length !== 0) {
        const nominations = document.querySelector('#nominationTitle');
        nominations.innerHTML = `<h5 class="text-monospace font-weight-bold">Nominations:</h5>`;

        Object.entries(localStorage).map(([key, value]) => document.querySelector('#nominationList').appendChild(createLink(value, `u${key}`)));

        // for (const [key, value] of Object.entries(localStorage)) {
        //     //let link = createLink(value, `u${key}`) можно сократить
        //
        // }
    }
}


document.body.onload = checkStorage;

