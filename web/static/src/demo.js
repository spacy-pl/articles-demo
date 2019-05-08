// 75% of this code is unused, I just needed some functions from the original demo

const pageNames = ['home', 'components', 'models', 'lemmatizer', 'vectors']
let pages = []

function setActivePage (loadedPages, activePageName) {
  loadedPages.forEach(pageData => {
    if (pageData.page === activePageName) {
      pageData.menuItem.classList.add('uk-active')
      pageData.contentContainer.classList.remove('uk-hidden')
    } else {
      pageData.menuItem.classList.remove('uk-active')
      pageData.contentContainer.classList.add('uk-hidden')
    }
  })
}

function smoothProgressbarIncrement (progressBar) {
  setTimeout(() => {
    progressBar.value += (90 - progressBar.value) / 30
  }, 200)
}

function smoothProgressbarComplete (progressBar) {
  setTimeout(() => {
    progressBar.value = 100
  }, 200)
  setTimeout(() => {
    progressBar.value = 0
  }, 3200)
}

function searchHandler (inputElement, outputElement) {
  // set up progressbar animation
  const progressBar = document.getElementById('lemmatizer-search-progressbar')
  progressBar.value = 0
  let timer = setInterval(() => {
    smoothProgressbarIncrement(progressBar)
  }, 50)
  // query search endpoint
  axios.post('/search-demo', {
    query: inputElement.value
  }).then(response => {
    console.log(response)
    outputElement.innerHTML = Array.from(response.data).map(searchResult => {
      let parsedText = searchResult['token_text'].replace(/(?:\r\n|\r|\n)/g, '<br>')
      if (searchResult['direct_match']) {
        return `<span class="uk-label uk-label-success">${parsedText}</span>`
      } else if (searchResult['lemma_match']) {
        return `<span class="uk-label uk-label-warning">${parsedText}</span>`
      } else {
        return parsedText
      }
    }).join('') // tokens already contain whitespace
    // stop progressbar animation
    clearInterval(timer)
    smoothProgressbarComplete(progressBar)
  }).catch(error => {
    console.log(error)
    clearInterval(timer)
    progressBar.value = 0
  })
}

function parseTableRow (rowItemsAsList, itemElement = 'td', itemsClasses = '', firstItemClasses = '') {
  const parsedItems = rowItemsAsList.map((item, idx) => {
    const classList = idx === 0 ? [itemsClasses, firstItemClasses].join(' ') : itemsClasses
    return `<${itemElement} class="${classList}">${item}</${itemElement}>`
  }).join(' ')
  return `<tr> ${parsedItems} </tr>`
}

function similarityHandler (inputElement, outputElement) {
  // set up progressbar animation
  const progressBar = document.getElementById('vectors-similarity-progressbar')
  progressBar.value = 0
  let timer = setInterval(() => {
    smoothProgressbarIncrement(progressBar)
  }, 50)
  // query similarity endpoint
  axios.post('/similarity-demo', {
    'words': inputElement.value
  }).then(response => {
    console.log(response)
    const headers = parseTableRow(Array.from(response.data['th']), 'td', 'uk-text-bold', '')
    const tableData = Array.from(response.data['td'])
      .map(rowOfItems => parseTableRow(Array.from(rowOfItems), 'td', '', 'uk-text-bold'))
      .join('\n')
    outputElement.innerHTML = `
    ${headers}
    ${tableData}
    `
    // stop progressbar animation
    clearInterval(timer)
    smoothProgressbarComplete(progressBar)
  }).catch(error => {
    console.log(error)
    clearInterval(timer)
  })
}

function addDemoEventListener (triggers, handlerFunction, inputElementId, outputElementId) {
  const inputEl = document.getElementById(inputElementId)
  const outputEl = document.getElementById(outputElementId)
  const boundHandler = handlerFunction.bind(null, inputEl, outputEl)
  triggers.forEach(triggerData => {
    document.getElementById(triggerData.elementId).addEventListener(triggerData.eventName, e => {
      e.preventDefault()
      boundHandler()
      return false
    })
  })
  boundHandler() // execute handler for the 1st time on registration
}

function addDemoEventListenerWithDefaulNaming (demoEventName, handler) {
  return addDemoEventListener(
    [{
      elementId: `${demoEventName}-submit`,
      eventName: 'click'
    },
    {
      elementId: `${demoEventName}`,
      eventName: 'submit'
    }],
    handler,
    `${demoEventName}-input`,
    `${demoEventName}-output`
  )
}
