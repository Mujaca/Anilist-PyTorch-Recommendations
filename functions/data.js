const { getKeyWords } = require('./keyword.js');
const fs = require('fs');
const { updatePersonalList, getAllSeasonAnimes } = require('./anilist.js')
const { runPythonScript } = require('../python/python.js');

const keyWordToNumber = require('../python/data/keywords.json');
const genresToNumber = require('../python/data/genres.json');
const tagsToNumber = require('../python/data/tags.json');

async function prepareDataForTraining(username){
    const animes = await updatePersonalList(username);

    for (let index = 0; index < 100; index++) {
        const {dataToWrite, scoresToWrite} = await prepareData(animes);

        fs.writeFileSync(`./python/data/${username}/score_${index}.json`, `[${scoresToWrite.join(',')}]`)
        fs.writeFileSync(`./python/data/${username}/data_${index}.json`, dataToWrite);   
    }
    return animes;
}

async function prepareDataForRecomandations() {
    const animes = await getAllSeasonAnimes(2023, 'spring', 1);
    const {dataToWrite} = await prepareData(animes);

    fs.writeFileSync('./python/data/season.json', JSON.stringify(animes));
    fs.writeFileSync(`./python/data/toCheck.json`, dataToWrite);
    return animes;
}

async function prepareData(data) {
    let dataToWrite = `[`;
    const scoresToWrite = [];
    let negative = -1;

    for(let anime of Object.values(data).sort((a,b) => 0.5 - Math.random())) {
        const object = {}
        const keywords = getKeyWords(anime.description);
        object.genres = anime.genres.map(genre => Object.keys(genresToNumber).find(key => genresToNumber[key] === genre));
        object.keywords = keywords.map(keyword => Object.keys(keyWordToNumber).find(key => keyWordToNumber[key] === keyword.keyword));
        object.tags = anime.tags.map(tag => Object.keys(tagsToNumber).find(key => tagsToNumber[key] === tag.name));

        object.genres.length = 7;
        for (let index = 0; index < object.genres.length; index++) {
            const element = object.genres[index];
            if(element == undefined) object.genres[index] = negative--;
        }

        object.tags.length = 5;
        for (let index = 0; index < object.tags.length; index++) {
            const element = object.tags[index];
            if(element == undefined) object.tags[index] = negative--;
        }

        object.keywords.length = 5;
        for (let index = 0; index < object.keywords.length; index++) {
            const element = object.keywords[index];
            if(element == undefined) object.keywords[index] = negative--;
        }

        scoresToWrite.push(anime.score);
        dataToWrite += `{
            "genres": [${object.genres.join(',')}],
            "keywords": [${object.keywords.join(',')}],
            "tags": [${object.tags.join(',')}]
        },`;
    }
    dataToWrite = dataToWrite.substring(0, dataToWrite.length - 1);
    dataToWrite += `]`;

    return {dataToWrite, scoresToWrite};
}

async function trainModell(username){
    const data = await prepareDataForTraining(username);
    if(!fs.existsSync(`./python/data/${username}/model.pth`)) await runPythonScript('train.py', [username]);
    return true;
}

exports.trainModell = trainModell;
exports.prepareDataForTraining = prepareDataForTraining;
exports.prepareDataForRecomandations = prepareDataForRecomandations;