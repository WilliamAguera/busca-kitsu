import {fetchAll, fetchByPage, getMediaCharacter} from './api/api';
import {Store} from './state/store';

export const store = new Store();

let take = 10;

let page = 0;

let itemsByPage = 10;

let mediaCharacter = [];

let isMobile = false;

let lastTerm = '';

let filtering = false;

let paginatorMobile = 3;

let paginatorDesktop = 6;

fetchAll();

export const buildCharacters = (collection) => {
    setLoadingContent(false);
    setEmptyList(false);
    collection.forEach((item) => {
        const element = `
       <div class="char-item" id="character" onclick="handleModal('open', ${item.id})">
          <div class="char-info">
            <img class="char-img" src="${item.attributes.image ? item.attributes.image.original : 'assets/img/avatar.png'}">
            <span class="char-name-item">${item.attributes.name}</span>
          </div>
          <div class="char-description ellipsis">
                ${item.attributes.description || 'No biography written.'}
          </div>
       </div>`;
        document.getElementById('chars-content').appendChild(transformHTML(element));
    });
    document.querySelector('#filter_chars').oninput = (element) => setTimeout(() => {
        filter(element.target.value);
    }, 1000)
};

export const buildButtonsPaginator = (fromPage) => {
    clearContentPaginator();

    let length = isMobile ? paginatorMobile : paginatorDesktop;
    length = filtering ? 1 : length;

    Array.from({length}).forEach((_, index) => {
        const paginator = `<div class="page-button-item chars-flex-center" id="page-button-${fromPage + index}"
                            onclick="navigatePage(${fromPage + index})">${(fromPage + index) + 1}</div>`;
        document.getElementById('page-items').appendChild(transformHTML(paginator));
    })
};

export const setPageSelected = () => {
    removeAllSelected();
    const pageBtn = document.getElementById(`page-button-${page}`);
    pageBtn.classList.add('selected');
    setLoadingContent(false);
};

export const setEmptyList = (empty) => {
    empty ? addEmptyListOverlay('chars-content') : removeEmptyListOverlay('chars-content');
};

export const removeAllSelected = () => {
    const elements = document.querySelectorAll('.page-button-item');
    for (let item of elements) {
        item.classList.remove('selected');
    }
};

export const setLoadingContent = (loading) => {
    loading ? addLoadingElement('chars-content') : removeLoadingElement('chars-content');
};

export const setLoadingMedia = (loading) => {
    loading ? addLoadingElement('media-content') : removeLoadingElement('media-content');
};

export const filter = (term) => {
    filtering = term.length > 0;
    if (String(term).trim() !== String(lastTerm).trim()) {
        clearContent();
        addLoadingElement('chars-content');
        fetchAll(term);
        lastTerm = term;
    }
    handlePaginatorWhileFiltering();
};

export const handlePaginatorWhileFiltering = () => {
    if (filtering) {
        buildButtonsPaginator(0);
        return;
    }
    page = 0;
    buildButtonsPaginator(0);
};

export const setFiltering = (term) => {
    filtering = term.length > 0;
    buildButtonsPaginator(0);
};

export const debounceTime = (time, fn) => {
    let timer = 0;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(fn, time);
    };
};

export const setCharacterSelected = () => {
    mediaCharacter = [];
    getMediaCharacter(store.selected.relationships.mediaCharacters.links.related);
    setLoadingMedia(true);
};

export const setCharacterMedia = (media) => {
    mediaCharacter.push(media);
};

export const buildCharacterMedia = () => {
    clearContentMedias();
    clearContentMediaHeader();
    mediaCharacter.forEach((item) => {
        const mediaItem = `
           <div class="media-item">
                    <div class="chars-flex-start chars-flex-column">
                        <img class="cover-image" src="${item.attributes.posterImage.small}">
                        <div class="media-rating-wrapper">
                           <label>Classificação Média: </label><div class="media-rating chars-flex-center">${Math.round(Number(item.attributes.averageRating))}</div>
                        </div>
                    </div>
                    <div class="media-info">
                        <h3 class="media-title">${item.attributes.canonicalTitle}</h3>
                        <label>Categoria: <strong style="text-transform: capitalize">${item.type}</strong></label>
                        <p>${item.attributes.synopsis}</p>
                    </div>
                </div>`;
        document.getElementById('media-content').appendChild(transformHTML(mediaItem));
    });
    buildHeaderMedia();
    setLoadingMedia(false);
};

export const buildHeaderMedia = () => {
    const headerElements = `
                <div class="char-header">
                    <img class="char-image" src="${store.selected.attributes.image.original}">
                    <span class="char-name">${store.selected.attributes.name}</span>
                </div>`;
    document.getElementById('media-char-header').appendChild(transformHTML(headerElements));
};

export const addEmptyListOverlay = (parentId) => {
    const element = `
            <div id="empty-overlay" class="overlay chars-flex-center chars-flex-column">
                <span class="empty-label">Não há registros</span>
            </div>`;
    document.getElementById(parentId).insertAdjacentElement('afterbegin', transformHTML(element));
};

export const removeEmptyListOverlay = (parentId) => {
    const element = document.getElementById('empty-overlay');
    if (element) {
        document.getElementById(parentId).removeChild(element);
    }
};

export const addLoadingElement = (parentId) => {
    const element = `
            <div id="loading-backdrop" class="overlay chars-flex-center chars-flex-column">
                <img class="loader" src="assets/svg/loading.svg" width="100px">
            </div>`;
    document.getElementById(parentId).insertAdjacentElement('afterbegin', transformHTML(element));
};

export const removeLoadingElement = (parentId) => {
    const element = document.getElementById('loading-backdrop');
    if (element) {
        document.getElementById(parentId).removeChild(element);
    }
};

export const clearContent = () => {
    document.getElementById('chars-content').innerHTML = '';
};

export const clearContentMedias = () => {
    document.getElementById('media-content').innerHTML = '';
};

export const clearContentMediaHeader = () => {
    document.getElementById('media-char-header').innerHTML = '';
};

export const clearContentPaginator = () => {
    document.getElementById('page-items').innerHTML = '';
};

export const transformHTML = (element) => {
    return new DOMParser().parseFromString(element, 'text/html').body.firstChild;
};

export const navigatePage = (pageNumber) => {
    if (!filtering) {
        page = pageNumber;
        take = page * itemsByPage;
        fetchByPage(take);
    }
};

export const previousPage = () => {
    if (page > 0 && !filtering) {
        const collection = getPageButtons();
        if (collection[0].classList.contains('selected')) {
            buildButtonsPaginator( handleRemainingPages() );
        }
        navigatePage(page - 1);
    }
};

export const nextPage = () => {
    if (!filtering) {
        const collection = getPageButtons();
        if (collection[collection.length - 1].classList.contains('selected')) {
            buildButtonsPaginator(page + 1);
        }
        navigatePage(page + 1);
    }
};

export const handleRemainingPages = () => {
    let fromPage = isMobile ? (page - paginatorMobile) : (page - paginatorDesktop);
    if ((fromPage - paginatorMobile) < 0) {
        fromPage = 0;
    }
    return fromPage;
};

export const getPageButtons = () => {
    return document.querySelectorAll('.page-button-item');
};

export const listenWindowResize = () => {
    // Tratando mudança de layout da paginação.
    window.addEventListener('resize', (event) => {
        if (window.innerWidth < 780 && !isMobile) {
            isMobile = true;
            buildButtonsPaginator(page);
            navigatePage(page);
        }
        if (window.innerWidth > 780 && isMobile) {
            isMobile = false;
            buildButtonsPaginator(page < paginatorDesktop ? 0 : page);
            navigatePage(page);
        }
    });
};

export const handleModal = (action, character = null) => {
    const modal = document.getElementsByClassName('modal-wrapper')[0];
    if (modal) {
        if (action === 'open') {
            modal.classList.add('isOpened');
            if (character) {
                store.selected = character;
                setCharacterSelected();
            }
            return;
        }
        modal.classList.remove('isOpened');
    }
};

// Definindo aqui funções em scopo global ( em carater de exemplo ) porque o webpack não necessariamente faz isso.
window.onload = () => {
    isMobile = window.innerWidth < 780;
    buildButtonsPaginator(0);
    listenWindowResize();
};
window.nextPage = (size) => nextPage(size);
window.handleModal = handleModal;
window.navigatePage = navigatePage;
window.previousPage = previousPage;
