// computed later
let wordCloudSize = [640, 480];  // width, height
let ners = [];

// updated dynamically when viewport changes:
let maxAdjFontSize = 128;
let minAdjFontSize = 16;

function parseAndScale(responseData) {
    let adjectives = Object.keys(responseData);
    const maxAll = adjectives => {
        return adjectives.map(adj =>{
            return {
                text: adj,
                size: maxAdjFontSize
            };
        });
    }
    if (adjectives.length <= 1) return maxAll(adjectives);

    let counts = adjectives.map(adj => parseInt(responseData[adj]));
    let minCount = Math.min(...counts);
    let maxCount = Math.max(...counts);
    if (minCount == maxCount) return maxAll(adjectives);

    maxAdjFontSize = Math.min(maxAdjFontSize, Math.max(...wordCloudSize) / 8);
    minAdjFontSize = Math.max(minAdjFontSize, Math.min(...wordCloudSize) / 8);
    let scale = (maxAdjFontSize-minAdjFontSize) / (maxCount-minCount);
    const scaleCount = realCount => scale*realCount + minAdjFontSize - scale*minCount;
    return adjectives.map(adj =>{
        return {
            text: adj,
            size: scaleCount(responseData[adj])
        };
    });
}

function wordcloudHandler(inputElement, _) {
    // set up progressbar animation
    const progressBar = document.getElementById('ner-wordcloud-progressbar')
    progressBar.value = 0;
    let timer = setInterval(() => {
        smoothProgressbarIncrement(progressBar);
    }, 50);
    // query search endpoint
    axios.get(`/api/NERs/${inputElement.value}`).then(response => {
        console.log(response);
        clearInterval(timer);
        smoothProgressbarComplete(progressBar);
    }).catch(error => {
        console.log(error);
        clearInterval(timer);
    });
}

function selectFromList(formElement, inputElement, listElement) {
    // first child of the listElement is the anchor containing named entity
    inputElement.value = listElement.firstChild.innerText;
    listElement.classList.add('uk-active');
    let submitEvent = new Event('submit');
    formElement.dispatchEvent(submitEvent);
}

function filterListByInput(formElement, inputElement,
            listElement, possibleItems, minListItems=3) {
    if (inputElement.value.length < minListItems) return;
    // clear the list
    while (listElement.firstChild) {
        listElement.removeChild(listElement.firstChild);
    }
    // append all items matching input value to the list
    possibleItems.filter(item => {
        return item.toLowerCase().includes(inputElement.value.toLowerCase())
    }).forEach(matchingItem => {
        let newItem = document.createElement("li");
        let newAnchor = document.createElement("a");
        newAnchor.innerText = matchingItem;
        newAnchor.href = "#!"
        let boundSelectItemHandler = selectFromList.bind(
            null,
            formElement,
            inputElement,
            newItem);
        newAnchor.addEventListener("click", event => {
            event.preventDefault();
            boundSelectItemHandler();
            return false;
        });
        newItem.appendChild(newAnchor);
        listElement.appendChild(newItem);
    });
}

function setNerAutocomplete(elementId) {
    const nerInputElement = document.getElementById(`${elementId}-input`);
    const nerFormElement = document.getElementById(elementId);
    const nerListElement = document.getElementById(`${elementId}-list`);
    axios.get('/api/NERs').then(response => {
        ners = Array.from(response.data);
        const boundFilterHandler = filterListByInput.bind(
            null,
            nerFormElement,
            nerInputElement,
            nerListElement,
            ners);
        nerInputElement.addEventListener('keydown', event => {
            boundFilterHandler();
        });
        filterListByInput(nerFormElement, nerInputElement, nerListElement, ners, 0);
    }).catch(error => {
        console.log(error);
    });
}

function setWordCloudSize(elementId) {
    let element = document.getElementById(elementId);
    wordCloudSize = [
        document.getElementById('wordcloud-grid-panel').offsetWidth,
        document.getElementById('wordcloud-grid-panel').offsetHeight
    ];
    return wordCloudSize;
}

UIkit.util.ready(() => {
    setWordCloudSize('wordcloud');
    setNerAutocomplete('ner-wordcloud');
    addDemoEventListenerWithDefaulNaming('ner-wordcloud', wordcloudHandler);
});
