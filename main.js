const URL = 'https://api.github.com/search/repositories'

const debounce = (fn, debounceTime) => {
  let id
  return function (...args) {
    clearTimeout(id)
    id = setTimeout(() => {
      fn.apply(this, args)
    }, debounceTime)
  }
}

const searchRepo = (repoName = '', page = 1) => {
  repoName = repoName.trim()
  if (repoName) {
    return fetch(`${URL}?q=${repoName}&per_page=5&page=${page}`, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
      },
    })
  }
}
const getData = async (request) => {
  try {
    const response = await request
    const data = await response.json()
    return data
  } catch (err) {
    console.error(err.message)
  }
}

const fetchItems = async (name = '') => {
  if (name.trim()) return (await getData(searchRepo(name))).items
}
const createOption = (name, id) =>
  `<li class="options__item" id="${id}"><button>${name}</button></li>`
const createSelected = (item) => {
  const { id, name, owner, stargazers_count: stars } = item
  return `<li class="selected__list" id="id${id}">
            <div class="selected__list-info">
              <h3>Name: ${name}</h3>
              <h4>Owner: ${owner.login}</h4>
              <h5>${stars} 🌟</h5>
            </div>
            <button class="selected__button" onclick="this.parentElement.remove()">❌</button>
          </li>`
}

const insertItem = (dest, item) => {
  dest.insertAdjacentHTML('beforeend', item)
}

const render = async () => {
  const optionsArray = []
  const optionsElem = document.querySelector('.options')
  const selectedElem = document.querySelector('.selected')
  const searchElem = document.querySelector('.search')

  optionsElem.addEventListener('click', (e) => {
    const target = e.target.parentElement
    const selectedItem = optionsArray.find(
      (item) => item.key === target.id
    ).repo
    if (target.classList.contains('options__item')) {
      selectedElem !== false &&
        selectedElem.querySelector(`#id${selectedItem.id}`) === null &&
        insertItem(selectedElem, createSelected(selectedItem))
      searchElem.value = ''
      while (optionsElem.firstChild) {
        optionsElem.removeChild(optionsElem.firstChild)
      }
    }
  })

  searchElem.addEventListener(
    'input',
    debounce(async (e) => {
      let items = await fetchItems(e.target.value)

      if (optionsArray.length !== 0) {
        optionsArray.forEach((item) => {
          document.getElementById(item.key).remove()
        })
        optionsArray.length = 0
      }

      items &&
        items.forEach((item, i) => {
          const id = `opt${i}`
          optionsArray.push({ repo: item, key: id })
          insertItem(optionsElem, createOption(item.name, id))
          //
        })
    }, 600)
  )
}

render()
