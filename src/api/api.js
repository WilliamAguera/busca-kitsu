import {buildCharacterMedia, clearContent, setCharacterMedia, setEmptyList, setLoadingContent} from "../main";
import {store, setPageSelected} from '../main.js';

const url = 'https://kitsu.io/api/edge';

export const fetchAll = (term) => {
    const request = new XMLHttpRequest();
    request.onload = handleLoad;

    !term ? request.open('GET', `${url}/characters?page[limit]=10&page[offset]=0`) :
        request.open('GET', `${url}/characters?filter[name]=${term}`);

    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.send();
};

export const getMediaCharacter = (url) => {
    const request = new XMLHttpRequest();
    request.onload = handleMediaCharacter;
    request.open('GET', url);
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.send();
};

export const handleMediaCharacter = (request) => {
    if (request.target.status >= 200 && request.target.status < 300) {
        const result = JSON.parse(request.target.response);
        getMediaRelated(result.data);
    }
};

export const handleMediaRelated = (request, resolve) => {
    if (request.target.status >= 200 && request.target.status < 300) {
        const result = JSON.parse(request.target.response);
        setCharacterMedia(result.data);
        resolve(result.data);
    }
};

export const getMediaRelated = (data) => {
        let requests = [];
        for ( let i = 0; i < data.length; i++ ) {
            requests.push(new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.onload = ($event) => handleMediaRelated($event, resolve);
                request.open('GET', data[i].relationships.media.links.related);
                request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                request.send();
            }));
        }
        Promise.all(requests).then(( data ) => {
            buildCharacterMedia();
        })
};

export const fetchByPage = (take) => {
    clearContent();
    setLoadingContent(true);
    const request = new XMLHttpRequest();
    request.onload = handleLoad;
    request.open('GET', `${url}/characters?page[limit]=10&page[offset]=${take}`);
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.send();
};

export const handleLoad = (request) => {
    if (request.target.status >= 200 && request.target.status < 300) {
        const result = JSON.parse(request.target.response);
        if ( result.data.length > 0 ) {
            store.setCollection(result.data);
            setPageSelected();
            return;
        }
        setLoadingContent( false );
        setEmptyList( true );
    }
};
