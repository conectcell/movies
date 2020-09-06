let nominatedMovies=[]


//fetch data from OMDB
const fetchMovies=async(searchInput)=>{
const response = await axios.get('https://www.omdbapi.com/',{
    params:{
    apikey:'934e47ff',
    s:searchInput,
    type:'movie',
      }
})
    if(response.data.Error){
    return []
    }
    console.log(response.data)
    return response.data.Search;
    }


//search after user stops typing
const search = (callback) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        callback.apply(null,args);
      }, 500);
    };
  };
  
   function createLink(context){
      let id;
    let link=document.createElement('li')
    if(arguments.length===2){
id=arguments[1]
        link.setAttribute('id', id)
    }
    link.classList.add('list-group-item')
    link.innerHTML=context
    return link

} 

//display movie list
    const changeInput= async  event=>{
      
    if(event.target.value.length===0){
        document.querySelector('#movieList').innerHTML=''
    }
        let movies= await fetchMovies(event.target.value) 
        result=document.querySelector('.resultTitle') 
        if(movies.length===0){      
            result.innerHTML=`<p><b>Movie not found!</b></p>`
            return;
        } 
        result.innerHTML=  `
        <h5 class="text-monospace font-weight-bold">Results for "${event.target.value}":</h5> 
     `
        const movieList=document.querySelector('#movieList')
            if(movieList.hasChildNodes()){
            movieList.innerHTML=''
        }
       
        for(let movie of movies){  
            
            const findMovie=nominatedMovies.find(el=>{
                return el===movie.imdbID
            })
            const inStorage=movie.imdbID in localStorage
            const context=`
            ${movie.Title} (${movie.Year}) <a target="_blank" href="https://www.imdb.com/title/${movie.imdbID}">Imdb</a>
            ${findMovie||inStorage?`
            <button type="button" class=list-group-item-action" id="${movie.imdbID}" disabled onclick="nominate('${movie.imdbID}')">Nominate</button>  `:`  <button type="button" class=list-group-item-action" id="${movie.imdbID}"  onclick="nominate('${movie.imdbID}')">Nominate</button> `}
       `
       const li=createLink(context)
            movieList.appendChild(li) 
    }  
 }

 const input= document.querySelector('input')

//search for movie
    input.addEventListener('input', search(changeInput))

//clear input field on select
    input.addEventListener('select',(e)=>{
        e.target.value=''
    })



/////add movie to nomination list

nominate=async param=>{

    /////search for a movie based on id
    const response=await(axios.get('https://www.omdbapi.com/',{
        params:{
            apikey:'934e47ff',
            i:param
        }
    }))
    
    
    const movie=response.data
    nominations=document.querySelector('#nominationTitle')    
    nominations.innerHTML=  `
    <h5 class="text-monospace font-weight-bold">Nominations:</h5>
    `
    ////created unic id by adding u+imdbID so it's possible to use imdbID in two elements on the page
    let context=`
    ${movie.Title} (${movie.Year}) <a target="_blank" href="https://www.imdb.com/title/${movie.imdbID}">Imdb</a> 
    <button  type="button" class=list-group-item-action" onclick="removeMovie('${movie.imdbID}')">Remove</button>  
`
    const li=createLink(context,`u${movie.imdbID}`)
    document.querySelector('#nominationList').appendChild(li)   
    document.querySelector('#'+param).disabled=true
    nominatedMovies.push(movie.imdbID)
    localStorage.setItem('nominated movies', JSON.stringify(nominatedMovies))
    localStorage.setItem(`${movie.imdbID}`, context)

 }

 ////-remove movie from nomination list and enable 'nominate' button
    removeMovie=param=>{  
  
        const nodes= document.querySelector('#nominationList')
        const target=document.querySelector('#u'+param)
        nodes.removeChild(target)
        localStorage.removeItem(param)
        if(!nodes.hasChildNodes()){
            document.querySelector('#nominationTitle').innerHTML=''
        }
        const nominatedMoviesUpdate=nominatedMovies.filter(curr=>{
            return curr!=param
        })
    //update array of nominated movies 
        nominatedMovies=[...nominatedMoviesUpdate]  
        const btn=document.querySelector('#'+param) 
        if(btn){
            btn.disabled=false
        }
}

    const checkStorage=()=>{
/// -> for testing purpose to clear localstorage
//localStorage.clear()
         if(localStorage.length!==0){
            nominations=document.querySelector('#nominationTitle')    
            nominations.innerHTML=  `
            <h5 class="text-monospace font-weight-bold">Nominations:</h5>
            `
            for (const [key, value] of Object.entries(localStorage)){
                let link= createLink( value,`u${key}`)
                document.querySelector('#nominationList').appendChild(link)
             }
      }
               }


            
    document.body.onload = checkStorage;

