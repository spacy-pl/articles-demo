const fill = d3.scale.category20();

const wordCloudSize = [640, 480];
let ners = [];
let nerSuggestions = [];
const maxNerSuggestions = 10;
const minQueryLength = 3;
const maxAdjFontSize = 128;
const minAdjFontSize = 16;

function draw(words) {
    // Taken from https://github.com/jasondavies/d3-cloud/tree/v1.2.5
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
    let counts = adjectives.map(adj => parseInt(responseData[adj]));
    let minCount = Math.min(...counts);
    let maxCount = Math.max(...counts);
    console.log(counts, minCount, maxCount);
    let scale = (maxAdjFontSize-minAdjFontSize) / (maxCount-minCount);
    const scaleCount = realCount => scale*realCount + minAdjFontSize - scale*minCount;
    return adjectives.map(adj =>{
        console.log(scaleCount(responseData[adj]));
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

function getNers() {
    axios.get('/api/NERs').then(response => {
        ners = Array.from(response.data).map(s => s.toLowerCase());
        nerSuggestions = [];
    }).catch(error => {
        console.log(error);
    });
}

function filterSuggestions(query) {  // TODO: Use these suggestions
    if (query.length >= minQueryLength) {
        nerSuggestions = ners.filter(ner => ner.includes(query.toLowerCase()));
        if (nerSuggestions.length > maxNerSuggestions) {
            nerSuggestions = [];
        }
    }
}

UIkit.util.ready(() => {
    getNers();
    addDemoEventListenerWithDefaulNaming('ner-wordcloud', wordcloudHandler);
});
