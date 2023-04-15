const { updatePersonalList } = require('./functions/anilist.js')
const config = require('./config.json')
const fs = require('fs');
const { trainModell, prepareDataForRecomandations } = require('./functions/data.js');
const { runPythonScript } = require('./python/python.js');

async function getRecomandation(username){
    await trainModell(username)
    const animes = await prepareDataForRecomandations();
 
    await runPythonScript('getRecomandation.py', [username]);
    let recommandation = JSON.parse(fs.readFileSync(`./python/data/${username}/recommandations.json`, 'utf-8'));
    recommandation = recommandation.replaceAll('[', '');
    recommandation = recommandation.replaceAll(']', '');
    recommandation = recommandation.split(',').map(number => parseInt(number));
    
    for (let index = 0; index < animes.length; index++) {
        animes[index].recomandation = recommandation[index];
    }

    animes.sort((a, b) => b.recomandation - a.recomandation);
    fs.writeFileSync('./test.json', JSON.stringify(animes))
}

getRecomandation(config.initialUser);

async function writeObjectToIndex(){
    const genres = [];
    const tags = [];

    updatePersonalList(config.initialUser).then(data => {
        fs.writeFileSync('./python/data/anime.json', JSON.stringify({'Mujaca': data}))
        for (const anime of Object.values(data)) {
            for(let genre of anime.genres) {
                if(!genres.includes(genre)) genres.push(genre);
            }

            for(let tag of anime.tags) {
                if(!tags.includes(tag.name)) tags.push(tag.name);
            }
        }
        genres.sort();
        tags.sort();

        fs.writeFileSync('./python/data/genres.json', JSON.stringify(Object.assign({}, genres)))
        fs.writeFileSync('./python/data/tags.json', JSON.stringify(Object.assign({}, tags)))
        if(fs.existsSync('./python/data/keywords_nodisplay.json')) fs.writeFileSync('./python/data/keywords.json', JSON.stringify(Object.assign({}, Object.keys(JSON.parse(fs.readFileSync('./python/data/keywords_nodisplay.json'))).sort())))

    })
}