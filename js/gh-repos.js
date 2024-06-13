export const GH_REPOS = (fun)=>{
    fetch('https://api.github.com/users/TutozGhub/repos')
    .then((data)=>data.json())
    .then((res)=>{
        const repos = [];
        res.forEach(item => {
            if (item.visibility === "public"){
                repos.push({
                    'nombre': item.name,
                    'descripcion': item.description,
                    'lenguaje utilizado': item.language
                });
            }
        });
        return fun(repos);
    })
}