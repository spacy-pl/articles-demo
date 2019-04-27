const fill = d3.scale.category20();

// computed later
let wordCloudSize = [640, 480];  // width, height
let ners = [];

// updated dynamically when viewport changes:
let maxAdjFontSize = 128;
let minAdjFontSize = 16;

function draw(words) {
    // Taken from https://github.com/jasondavies/d3-cloud/tree/v1.2.5
    setWordCloudSize('wordcloud');
    d3.select("svg").remove();  // replace previous wordcloud
    d3.select("#wordcloud").append("svg")
        .attr("width", wordCloudSize[0])
        .attr("height", wordCloudSize[1])
        .attr("class", "uk-align-center")
    .append("g")
        .attr("transform", "translate(" + wordCloudSize[0] / 2 + "," + wordCloudSize[1] / 2 + ")")
    .selectAll("text")
        .data(words)
    .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
}

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
        d3.layout.cloud()
            .size(wordCloudSize)
            .words(parseAndScale(response.data))
            .padding(5)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .font("Impact")
            .fontSize(d => d.size)
            .on("end", draw)
            .start();
        clearInterval(timer);
        smoothProgressbarComplete(progressBar);
    }).catch(error => {
        console.log(error);
        clearInterval(timer);
    });
}

function setNerAutocomplete(elementId) {
    const nerInputElement = document.getElementById(`${elementId}-input`);
    axios.get('/api/NERs').then(response => {
        ners = Array.from(response.data);
        ac = new Awesomplete(nerInputElement, {
            list: ners,
            minChars: 2,
            maxItems: 10,
            container: _ => document.getElementById(`${elementId}-container`)
        });
        document.getElementById('awesomplete_list_1').classList.add('uk-list', 'uk-list-divider');
        return ac;
    }).catch(error => {
        console.log(error);
    });
}

function setWordCloudSize(elementId) {
    let element = document.getElementById(elementId);
    wordCloudSize = [
        Math.min(1280, document.documentElement.clientWidth * 3 / 4),
        Math.max(480, document.documentElement.clientHeight / 4)
    ];
    return wordCloudSize;
}

UIkit.util.ready(() => {
    setWordCloudSize('wordcloud');
    setNerAutocomplete('ner-wordcloud');
    addDemoEventListenerWithDefaulNaming('ner-wordcloud', wordcloudHandler);
});
