//require('dotenv').config()

boardID = process.env.BOARD_ID
apiKey = process.env.API_KEY
token = process.env.TOKEN

//const addListForm = document.querySelector(".add-list-form")
const addListInput = document.querySelector(".add-list-input")
//const revealInput = document.querySelector(".reveal-input")
const customLists = document.querySelector(".custom-lists")
//const cards = Array.from(document.querySelectorAll(".cards"))

sync()

async function sync() {
  await fetch(
    `https://api.trello.com/1/boards/${boardID}?lists=open&list_fields=name,closed,pos&cards=visible&card_fields=name,idList,pos&fields=lists,cards,name,id&key=${apiKey}&token=${token}`
  )
    .then(response => {
      console.log(
        `sync GET lists and cards Response: ${response.status} ${response.statusText}`
      )
      return response.json()
    })
    .then(boardDetails => {
      console.log(boardDetails)
      renderLists(boardDetails)
    })
    .catch(err => console.log(err))
}

function renderLists(boardDetails) {
  customLists.innerHTML = ""
  boardDetails.lists.forEach(listItem => {
    const list = document.createElement("div")
    list.setAttribute("class", "list")
    list.setAttribute("data-key", listItem.id)
    list.innerHTML = `
  <div class="header-container">
    <div class="header">${listItem.name}</div>
    <button class="delete-btn">X</button>
  </div>
  <ul class="cards"></ul>
  <button class="reveal-card-input" type="button">+ Add a card</button>
  <form class="add-card-form">
    <textarea class="add-card" name="add-card" cols="33" rows="3" placeholder="Enter a title for this card..."></textarea>
    <div class="buttons">
      <button type="submit" class="input-btn">Add Card</button>
      <button class="delete-card-btn">X</button>
    </div>
  </form>`
    boardDetails.cards.forEach(cardItem => {
      if (list.getAttribute("data-key") === cardItem.idList) {
        let ul = list.firstElementChild.nextElementSibling
        let li = document.createElement("li")
        li.setAttribute("data-key", cardItem.id)
        li.setAttribute("position", cardItem.pos)
        li.classList.add("draggable")
        li.setAttribute("draggable", "true")
        let cardBtn = document.createElement("input")
        cardBtn.classList.add("card-btn")
        cardBtn.type = "text"
        cardBtn.value = cardItem.name
        cardBtn.setAttribute("readonly", "readonly")
        let editCardBtn = document.createElement("button")
        let editImage = document.createElement("img")
        editImage.classList.add("edit-card-btn")
        editImage.src = "./images/edit.svg"
        editImage.height = "15"
        let deleteCardBtn = document.createElement("button")
        deleteCardBtn.classList.add("del-card-btn")
        deleteCardBtn.innerText = "X"
        li.appendChild(cardBtn)
        li.appendChild(editCardBtn)
        editCardBtn.appendChild(editImage)
        li.appendChild(deleteCardBtn)
        ul.appendChild(li)
      }
    })
    customLists.appendChild(list)
  })
}

function addGlobalEventListener(type, selector, callback) {
  document.addEventListener(type, e => {
    if (e.target.matches(selector)) callback(e)
  })
}

addGlobalEventListener("click", ".reveal-input", e => reveal(e))
addGlobalEventListener("click", ".reveal-card-input", e => reveal(e))

function reveal(e) {
  e.target.style.display = "none"
  e.target.nextElementSibling.style.display = "flex"
  e.target.nextElementSibling.firstElementChild.value = ""
  e.target.nextElementSibling.firstElementChild.focus()
}

addGlobalEventListener("click", ".delete-list-btn", e => hide(e))
addGlobalEventListener("click", ".delete-card-btn", e => hide(e))

function hide(e) {
  e.preventDefault()
  e.target.parentElement.parentElement.style.display = "none"
  e.target.parentElement.parentElement.previousElementSibling.style.display =
    "block"
}

document.body.addEventListener("submit", e => {
  e.preventDefault()
  if (e.target.matches(".add-list-form")) addList(addListInput.value)
  if (e.target.matches(".add-card-form")) addCard(e.target)
})

async function addList(item) {
  if (item !== "") {
    await fetch(
      `https://api.trello.com/1/lists?name=${item}&idBoard=${boardID}&key=${apiKey}&token=${token}&pos=bottom`,
      {
        method: "POST",
      }
    )
      .then(response => {
        console.log(
          `addList POST Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(listData => console.log(listData))
      .catch(err => console.log(err))

    sync()
    addListInput.value = ""
  }
}

async function addCard(item) {
  let name = item.firstElementChild.value
  let idList = item.parentElement.getAttribute("data-key")
  if (name !== "") {
    await fetch(
      `https://api.trello.com/1/cards?idList=${idList}&name=${name}&key=${apiKey}&token=${token}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `addCard POST Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.error(err))

    sync()
    name = ""
  }
}

addGlobalEventListener("click", ".delete-btn", e => deleteList(e))

async function deleteList(e) {
  let listId = e.target.parentElement.parentElement.getAttribute("data-key")
  await fetch(
    `https://api.trello.com/1/lists/${listId}/closed?value=true&key=${apiKey}&token=${token}`,
    {
      method: "PUT",
    }
  )
    .then(response => {
      console.log(
        `deleteList PUT Response: ${response.status} ${response.statusText}`
      )
      return response.json()
    })
    .then(responseJson => console.log(responseJson))
    .catch(err => console.log(err))

  sync()
}

addGlobalEventListener("click", ".del-card-btn", e => deleteCard(e))

async function deleteCard(e) {
  let id = e.target.parentElement.getAttribute("data-key")
  await fetch(
    `https://api.trello.com/1/cards/${id}?key=${apiKey}&token=${token}`,
    {
      method: "DELETE",
    }
  )
    .then(response => {
      console.log(
        `deleteCard DEL Response: ${response.status} ${response.statusText}`
      )
    })
    .catch(err => console.log(err))

  sync()
}

addGlobalEventListener("click", ".edit-card-btn", e => editCard(e))

async function editCard(e) {
  let input = e.target.parentElement.previousElementSibling
  let id = e.target.parentElement.parentElement.getAttribute("data-key")
  if (input.getAttribute("readonly")) {
    input.removeAttribute("readonly")
    input.focus()
    input.style.cursor = "text"
    input.style.border = "1px solid #0079bf"
  } else {
    input.setAttribute("readonly", "readonly")
    input.style.cursor = "pointer"
    input.style.border = "none"
    userEnteredValue = input.value
    await fetch(
      `https://api.trello.com/1/cards/${id}?name=${userEnteredValue}&key=${apiKey}&token=${token}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `editCard PUT Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.log(err))

    sync()
  }
}

addGlobalEventListener("click", ".card-btn", e => cardDetails(e.target))

async function cardDetails(event) {
  let cardId = event.parentElement.getAttribute("data-key")
  await fetch(
    `https://api.trello.com/1/cards/${cardId}?fields=name,desc,comments,description,idList,pos&actions=commentCard&key=${apiKey}&token=${token}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  )
    .then(response => {
      console.log(
        `cardDetails GET Response: ${response.status} ${response.statusText}`
      )
      return response.json()
    })
    .then(json => {
      console.log(json)
      renderModal(event, json)
    })
    .catch(err => console.log(err))
}

function renderModal(event, cardData) {
  let li = event.parentElement
  const div = document.createElement("div")
  div.classList.add("modal")
  div.innerHTML = `
        <div class="modal-content">
          <div class="heading-container">
            <div class="model-heading">${cardData.name}</div>
            <div class="close">X</div>
          </div>
          <div class="description-container">
            <div class="heading-wrapper">
              <div class="description-heading">Description</div>
              <button class="desc-edit">Edit</button>
            </div>
            <form class="add-desc-form">
            <textarea class="desc-input" placeholder="Add a detailed description..." cols="20" rows="3"></textarea>
            <div class="btn-wrapper">
              <button class="desc-save-btn" type="submit">Save</button>
              <button class="desc-close-btn">X</button>
            </div>
            </form>
          </div>
          <div class="activity-container">
            <div class="activity-heading">Activity</div>
            <form class="add-activity-form">
              <input type="text" class="activity-input" placeholder="Write a comment..."/>
              <button class="activity-save-btn" type="submit">Save</button>
            </form>
            <ul class="activity-list"></ul>
            </div>
        </div>`
  li.appendChild(div)
  let modal = event.parentElement.lastChild
  modal.style.display = "block"
  if (cardData.desc !== "") {
    let description =
      modal.firstElementChild.firstElementChild.nextElementSibling
        .firstElementChild.nextElementSibling.firstElementChild
    description.setAttribute("readonly", "readonly")
    description.style.border = "none"
    description.value = cardData.desc
    let editBtn =
      description.parentElement.previousElementSibling.lastElementChild
    editBtn.style.display = "block"
  }
  let activityList = modal.lastElementChild.lastElementChild.lastElementChild
  cardData.actions.forEach(action => {
    if (action.type === "commentCard") {
      let div = document.createElement("div")
      div.classList.add("commentor-name")
      div.innerText = action.memberCreator.fullName
      activityList.appendChild(div)
      let li = document.createElement("input")
      li.classList.add("activity-input")
      li.value = action.data.text
      li.setAttribute("data-key", action.id)
      li.setAttribute("readonly", "readonly")
      activityList.appendChild(li)
      let divBtns = document.createElement("div")
      divBtns.classList.add("comment-btns")
      let editBtn = document.createElement("button")
      editBtn.classList.add("edit-comment-btn")
      editBtn.innerText = "Edit"
      let deleteBtn = document.createElement("button")
      deleteBtn.classList.add("delete-comment-btn")
      deleteBtn.innerText = "Delete"
      divBtns.appendChild(editBtn)
      divBtns.appendChild(deleteBtn)
      activityList.appendChild(divBtns)
    }
  })
}

addGlobalEventListener("click", ".desc-edit", e => editDesc(e))

function editDesc(event) {
  let desc = event.target.parentElement.nextElementSibling.firstElementChild
  desc.removeAttribute("readonly")
  desc.style.border = "1px solid #0079bf"
  desc.focus()
  event.target.style.display = "none"
  let descButtons =
    event.target.parentElement.parentElement.lastElementChild.lastElementChild
  descButtons.style.display = "block"
}

addGlobalEventListener("click", ".desc-save-btn", e => saveDesc(e))

async function saveDesc(event) {
  event.preventDefault()
  let desc = event.target.parentElement.previousElementSibling
  let card =
    desc.parentElement.parentElement.parentElement.parentElement.parentElement
  let cardId = card.getAttribute("data-key")
  let descValue = desc.value
  await fetch(
    `https://api.trello.com/1/cards/${cardId}?desc=${descValue}&key=${apiKey}&token=${token}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
    }
  )
    .then(response => {
      console.log(
        `saveDesc PUT Response: ${response.status} ${response.statusText}`
      )
      return response.json()
    })
    .then(text => console.log(text))
    .catch(err => console.error(err))

  let modal = card.lastElementChild
  modal.remove()
  cardDetails(card.firstElementChild)
}

addGlobalEventListener("click", ".desc-close-btn", e => closeDesc(e))

function closeDesc(event) {
  let desc = event.target.parentElement.previousElementSibling
  let descButtons = event.target.parentElement
  descButtons.style.display = "none"
  if (desc.value !== "") {
    desc.setAttribute("readonly", "readonly")
    desc.style.border = "none"

    let editBtn =
      event.target.parentElement.parentElement.previousElementSibling
        .lastElementChild
    editBtn.style.display = "block"
  }
}

addGlobalEventListener("click", ".close", e => closeModel(e.target))
addGlobalEventListener("click", ".modal", e => closeModel(e.target))

function closeModel(event) {
  if (event.style.display === "block") {
    event.style.display = "none"
  } else {
    let modal = event.parentElement.parentElement.parentElement
    modal.style.display = "none"
  }
}

addGlobalEventListener("click", ".desc-input", e => revealButtons(e))

function revealButtons(event) {
  if (event.target.getAttribute("readonly") === null) {
    let descButtons = event.target.nextElementSibling
    descButtons.style.display = "flex"
  }
}

addGlobalEventListener("click", ".activity-save-btn", e => saveComment(e))

async function saveComment(event) {
  let model =
    event.target.parentElement.parentElement.parentElement.parentElement
  event.preventDefault()
  let comment = event.target.previousElementSibling.value
  let id = model.parentElement.getAttribute("data-key")
  if (comment !== "") {
    await fetch(
      `https://api.trello.com/1/cards/${id}/actions/comments?text=${comment}&key=${apiKey}&token=${token}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `saveComment POST Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.error(err))

    closeModel(model)
    cardDetails(model.parentElement.firstElementChild)
  }
}

addGlobalEventListener("click", ".edit-comment-btn", e => editComment(e))

function editComment(event) {
  event.preventDefault()
  let input = event.target.parentElement.previousElementSibling
  let comment = input.value
  let id =
    event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
      "data-key"
    )
  let actionId = input.getAttribute("data-key")

  if (input.getAttribute("readonly")) {
    event.target.innerText = "Save"
    input.removeAttribute("readonly")
    input.focus()
    input.style.cursor = "text"
    input.style.border = "1px solid #0079bf"
  } else {
    event.target.innerText = "Edit"
    input.setAttribute("readonly", "readonly")
    input.style.cursor = "pointer"
    input.style.border = "none"
    userEnteredValue = input.value
    if (comment !== "") {
      fetch(
        `https://api.trello.com/1/cards/${id}/actions/${actionId}/comments?text=${comment}&key=${apiKey}&token=${token}`,
        {
          method: "PUT",
        }
      )
        .then(response => {
          console.log(
            `editComment PUT Response: ${response.status} ${response.statusText}`
          )
          return response.json()
        })
        .then(text => console.log(text))
        .catch(err => console.error(err))
    }
  }
}

addGlobalEventListener("click", ".delete-comment-btn", e => deleteComment(e))

async function deleteComment(event) {
  event.preventDefault()
  let id =
    event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
      "data-key"
    )
  let actionId =
    event.target.parentElement.previousElementSibling.getAttribute("data-key")
  await fetch(
    `https://api.trello.com/1/cards/${id}/actions/${actionId}/comments?key=${apiKey}&token=${token}`,
    {
      method: "DELETE",
    }
  )
    .then(response => {
      console.log(
        `deleteComment DEL Response: ${response.status} ${response.statusText}`
      )
      return response.json()
    })
    .then(text => console.log(text))
    .catch(err => console.error(err))

  let model =
    event.target.parentElement.parentElement.parentElement.parentElement
      .parentElement
  closeModel(model)
  cardDetails(model.parentElement.firstElementChild)
}

addGlobalEventListener("dragstart", ".draggable", e => drag(e))

function drag(event) {
  event.target.classList.add("dragging")
}

addGlobalEventListener("dragend", ".draggable", e => dragEnd(e))

async function dragEnd(event) {
  event.target.classList.remove("dragging")
  const previousElement = event.target.previousElementSibling
  const currentElement = event.target
  const nextElement = event.target.nextElementSibling
  const currentElementId = event.target.getAttribute("data-key")
  const listId =
    currentElement.parentElement.parentElement.getAttribute("data-key")
  if (previousElement === null) {
    await fetch(
      `https://api.trello.com/1/cards/${currentElementId}?pos=top&idList=${listId}&key=${apiKey}&token=${token}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `dragEnd PUT top Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.error(err))

    return sync()
  }
  if (nextElement === null) {
    await fetch(
      `https://api.trello.com/1/cards/${currentElementId}?pos=bottom&idList=${listId}&key=${apiKey}&token=${token}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `dragEnd PUT bottom Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.error(err))

    sync()
  }
  if (previousElement !== null && nextElement !== null) {
    const previousPosition = parseInt(previousElement.getAttribute("position"))
    const nextPosition = parseInt(nextElement.getAttribute("position"))
    const currentPosition = (previousPosition + nextPosition) / 2
    await fetch(
      `https://api.trello.com/1/cards/${currentElementId}?pos=${currentPosition}&idList=${listId}&key=${apiKey}&token=${token}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      }
    )
      .then(response => {
        console.log(
          `dragEnd PUT middle Response: ${response.status} ${response.statusText}`
        )
        return response.json()
      })
      .then(text => console.log(text))
      .catch(err => console.error(err))

    sync()
  }
}

addGlobalEventListener("dragover", ".cards", e => dragOver(e))

function dragOver(event) {
  event.preventDefault()
  let container = event.target
  let afterElement = getDragAfterElement(container, event.clientY)
  const draggable = document.querySelector(".dragging")
  if (afterElement == null) {
    container.appendChild(draggable)
  } else {
    container.insertBefore(draggable, afterElement)
  }
}

function getDragAfterElement(container, y) {
  let draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ]
  return draggableElements.reduce(
    (closest, child) => {
      let box = child.getBoundingClientRect()
      let offset = y - box.top - box.height / 2
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element
}
