const { getKeyWords } = require('./keyword.js');
const fs = require('fs');
const { updatePersonalList } = require('./anilist.js')

const keyWordToNumber = require('../python/data/keywords.json');
const genresToNumber = require('../python/data/genres.json');
const tagsToNumber = require('../python/data/tags.json');

async function prepareDataForTraining(username){
    const animes = await updatePersonalList(username);
    let dataToWrite = `[`;
    const scoresToWrite = [];
    let negative = -1;

    for(let anime of Object.values(animes)) {
        const object = {}
        const keywords = getKeyWords(anime.description);
        // arr.map(value => Object.keys(obj).find(key => obj[key] === value));
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

    fs.writeFileSync(`./python/data/${username}/score.json`, `[${scoresToWrite.join(',')}]`)
    fs.writeFileSync(`./python/data/${username}/data.json`, dataToWrite);
    return dataToWrite;
}

exports.prepareDataForTraining = prepareDataForTraining;