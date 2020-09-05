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
  

const input= document.querySelector('input')
let nominatedMovies=[]

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
        const li=document.createElement('li') 
        li.classList.add('list-group-item')
        li.innerHTML=`
         ${movie.Title} (${movie.Year}) 
         ${findMovie?`
           <button type="button" class=list-group-item-action" id="${movie.imdbID}" disabled onclick="func('${movie.imdbID}')">Nominate</button>  `:`  <button type="button" class=list-group-item-action" id="${movie.imdbID}"  onclick="func('${movie.imdbID}')">Nominate</button> `}
       `
      movieList.appendChild(li) 
    }    
}
//search for movie
input.addEventListener('input', search(changeInput))

//clear input field on select
input.addEventListener('select',(e)=>{
   e.target.value=''

})

//add movie to nomination list
func=async param=>{
    //search for a movie based on id
    const response=await(axios.get('http://www.omdbapi.com/',{
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
    const li=document.createElement('li')
    //created unic id by adding u+imdbID so it's possible to use imdbID in two elements on the page
    li.setAttribute('id',`u${movie.imdbID}`)
    li.classList.add('list-group-item')
    li.innerHTML=`
        ${movie.Title} (${movie.Year}) <b>Imdb</b>: ${movie.imdbRating}
        <button  type="button" class=list-group-item-action" onclick="removeMovie('${movie.imdbID}')">Remove</button>  
     ` 

    document.querySelector('#nominationList').appendChild(li)   
    document.querySelector('#'+param).disabled=true
    nominatedMovies.push(movie.imdbID)
 }

 //remove movie from nomination list and enable 'nominate' button
removeMovie=param=>{  
  
    const nodes= document.querySelector('#nominationList')
    const target=document.querySelector('#u'+param)
    nodes.removeChild(target)
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



