//require('dotenv').config()

boardID = "5b43ce6a4b30a543dc4460e8"
apiKey = "c72758c21ba487670d2dec9b116967a1"
token = "67d71ca2e6eb6ffbf3f0f32c1d5afc5a3df2525f0f136e1ada7ca0849ce0fec8"

const addListInput = document.querySelector(".add-list-input")
const customLists = document.querySelector(".custom-lists")

sync() //sync the board

async function sync() {
  try {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardID}?lists=open&list_fields=name,closed,pos&cards=visible&card_fields=name,idList,pos&fields=lists,cards,name,id&key=${apiKey}&token=${token}`
    ) //get the board details
    const boardDetails = await response.json() //parse the response to JSON

    console.log(
      `sync GET lists and cards Response: ${response.status} ${response.statusText}`
    )
    console.log(boardDetails)
    renderLists(boardDetails) //render the lists and cards
  } catch (error) {
    console.log(error) //catch any errors
  }
}

function renderLists(boardDetails) {
  customLists.innerHTML = "" //clear the lists
  boardDetails.lists.forEach(listItem => {
    //loop through the lists
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
      //loop through the cards
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
        li.appendChild(cardBtn) //append the card
        li.appendChild(editCardBtn) //append the edit button
        editCardBtn.appendChild(editImage)
        li.appendChild(deleteCardBtn) //append the delete button
        ul.appendChild(li) //append the card to the list
      }
    })
    customLists.appendChild(list) //append the list to the board
  })
}

function addGlobalEventListener(type, selector, callback) {
  //add an event listener to the board
  document.addEventListener(type, e => {
    if (e.target.matches(selector)) callback(e) //if the target matches the selector, run the callback
  })
}

addGlobalEventListener("click", ".reveal-input", e => reveal(e))
addGlobalEventListener("click", ".reveal-card-input", e => reveal(e))

function reveal(e) {
  e.target.style.display = "none" //hide the button
  e.target.nextElementSibling.style.display = "flex" //show the form
  e.target.nextElementSibling.firstElementChild.value = "" //clear the input
  e.target.nextElementSibling.firstElementChild.focus() //focus the input
}

addGlobalEventListener("click", ".delete-list-btn", e => hide(e))
addGlobalEventListener("click", ".delete-card-btn", e => hide(e))

function hide(e) {
  e.preventDefault() //prevent the default action
  e.target.parentElement.parentElement.style.display = "none" //hide the form
  e.target.parentElement.parentElement.previousElementSibling.style.display =
    "block" //show the button
}

document.body.addEventListener("submit", e => {
  e.preventDefault() //prevent the default action
  if (e.target.matches(".add-list-form")) addList(addListInput.value)
  if (e.target.matches(".add-card-form")) addCard(e.target)
})

async function addList(item) {
  //add a list
  if (item !== "") {
    //if the input is not empty
    try {
      const response = await fetch(
        `https://api.trello.com/1/lists?name=${item}&idBoard=${boardID}&key=${apiKey}&token=${token}&pos=bottom`,
        {
          method: "POST",
        }
      )
      const listData = await response.json()
      console.log(
        `addList POST Response: ${response.status} ${response.statusText}`
      )
      console.log(listData)
    } catch (error) {
      console.log(error)
    }
    sync() //sync the board
    addListInput.value = "" //clear the input
  }
}

async function addCard(item) {
  //add a card
  let name = item.firstElementChild.value //get the card name
  let idList = item.parentElement.getAttribute("data-key") //get the list ID
  if (name !== "") {
    //if the input is not empty
    try {
      const response = await fetch(
        `https://api.trello.com/1/cards?idList=${idList}&name=${name}&key=${apiKey}&token=${token}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      )
      const cardData = await response.json()
      console.log(
        `addCard POST Response: ${response.status} ${response.statusText}`
      )
      console.log(cardData)
    } catch (error) {
      console.log(error)
    }

    sync() //sync the board
    name = "" //clear the input
  }
}

addGlobalEventListener("click", ".delete-btn", e => deleteList(e))

async function deleteList(e) {
  //delete a list
  let listId = e.target.parentElement.parentElement.getAttribute("data-key") //get the list ID
  try {
    //try to delete the list
    const response = await fetch(
      `https://api.trello.com/1/lists/${listId}/closed?value=true&key=${apiKey}&token=${token}`,
      {
        method: "PUT",
      }
    ) //send the request
    const responseJson = await response.json()
    console.log(
      `deleteList PUT Response: ${response.status} ${response.statusText}`
    )
    console.log(responseJson)
  } catch (error) {
    console.log(error)
  }

  sync() //sync the board
}

addGlobalEventListener("click", ".del-card-btn", e => deleteCard(e))

async function deleteCard(e) {
  //delete a card
  let id = e.target.parentElement.getAttribute("data-key") //get the card ID
  // await fetch(
  //   `https://api.trello.com/1/cards/${id}?key=${apiKey}&token=${token}`,
  //   {
  //     method: "DELETE",
  //   }
  // )
  //   .then(response => {
  //     console.log(
  //       `deleteCard DEL Response: ${response.status} ${response.statusText}`
  //     )
  //   })
  //   .catch(err => console.log(err))
  try {
    const response = await fetch(
      `https://api.trello.com/1/cards/${id}?key=${apiKey}&token=${token}`,
      {
        method: "DELETE",
      }
    ) //send the request
    console.log(
      `deleteCard DEL Response: ${response.status} ${response.statusText}`
    )
  } catch (error) {
    console.log(error)
  }

  sync() //sync the board
}

addGlobalEventListener("click", ".edit-card-btn", e => editCard(e))

async function editCard(e) {
  //edit a card
  let input = e.target.parentElement.previousElementSibling //get the input
  let id = e.target.parentElement.parentElement.getAttribute("data-key") //get the card ID
  if (input.getAttribute("readonly")) {
    //if the input is readonly
    input.removeAttribute("readonly") //remove the readonly attribute
    input.focus() //focus the input
    input.style.cursor = "text" //change the cursor
    input.style.border = "1px solid #0079bf" //change the border
  } else {
    //if the input is not readonly
    input.setAttribute("readonly", "readonly") //set the readonly attribute
    input.style.cursor = "pointer" //change the cursor
    input.style.border = "none" //change the border
    userEnteredValue = input.value //get the value

    try {
      //try to update the card
      const response = await fetch(
        `https://api.trello.com/1/cards/${id}?name=${userEnteredValue}&key=${apiKey}&token=${token}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
          },
        }
      )
      const json = await response.json()
      console.log(
        `editCard PUT Response: ${response.status} ${response.statusText}`
      )
      console.log(json)
    } catch (error) {
      console.log(error)
    }

    sync() //sync the board
  }
}

addGlobalEventListener("click", ".card-btn", e => cardDetails(e.target))

async function cardDetails(event) {
  //show the card details
  let cardId = event.parentElement.getAttribute("data-key") //get the card ID

  try {
    //try to get the card details
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}?fields=name,desc,comments,description,idList,pos&actions=commentCard&key=${apiKey}&token=${token}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    )
    const json = await response.json()
    console.log(
      `cardDetails GET Response: ${response.status} ${response.statusText}`
    )
    console.log(json)
    renderModal(event, json) //render the modal
  } catch (error) {
    console.log(error)
  }
}

function renderModal(event, cardData) {
  //render the modal
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
  //edit the description
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
  //save the description
  event.preventDefault() //prevent the form from submitting
  let desc = event.target.parentElement.previousElementSibling
  let card =
    desc.parentElement.parentElement.parentElement.parentElement.parentElement
  let cardId = card.getAttribute("data-key")
  let descValue = desc.value

  try {
    //try to save the description
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}?desc=${descValue}&key=${apiKey}&token=${token}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      }
    )
    const json = await response.json()
    console.log(
      `saveDesc PUT Response: ${response.status} ${response.statusText}`
    )
    console.log(json)
  } catch (error) {
    console.log(error)
  }

  let modal = card.lastElementChild
  modal.remove() //remove the modal
  cardDetails(card.firstElementChild) //render the modal
}

addGlobalEventListener("click", ".desc-close-btn", e => closeDesc(e))

function closeDesc(event) {
  //close the description
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
  //close the modal
  if (event.style.display === "block") {
    event.style.display = "none"
  } else {
    let modal = event.parentElement.parentElement.parentElement
    modal.style.display = "none"
  }
}

addGlobalEventListener("click", ".desc-input", e => revealButtons(e))

function revealButtons(event) {
  //reveal the edit and delete buttons
  if (event.target.getAttribute("readonly") === null) {
    let descButtons = event.target.nextElementSibling
    descButtons.style.display = "flex"
  }
}

addGlobalEventListener("click", ".activity-save-btn", e => saveComment(e))

async function saveComment(event) {
  //save the comment
  let model =
    event.target.parentElement.parentElement.parentElement.parentElement
  event.preventDefault()
  let comment = event.target.previousElementSibling.value
  let id = model.parentElement.getAttribute("data-key")
  if (comment !== "") {
    try {
      //try to save the comment
      const response = await fetch(
        `https://api.trello.com/1/cards/${id}/actions/comments?text=${comment}&key=${apiKey}&token=${token}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      )
      const json = await response.json()
      console.log(
        `saveComment POST Response: ${response.status} ${response.statusText}`
      )
      console.log(json)
    } catch (error) {
      console.log(error)
    }

    closeModel(model) //close the modal
    cardDetails(model.parentElement.firstElementChild) //render the modal
  }
}

addGlobalEventListener("click", ".edit-comment-btn", e => editComment(e))

async function editComment(event) {
  //edit the comment
  event.preventDefault() //prevent the form from submitting
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
      try {
        //try to edit the comment
        const response = await fetch(
          `https://api.trello.com/1/cards/${id}/actions/${actionId}/comments?text=${comment}&key=${apiKey}&token=${token}`,
          {
            method: "PUT",
          }
        )
        const json = await response.json()
        console.log(
          `editComment PUT Response: ${response.status} ${response.statusText}`
        )
        console.log(json)
      } catch (error) {
        console.log(error)
      }
    }
  }
}

addGlobalEventListener("click", ".delete-comment-btn", e => deleteComment(e))

async function deleteComment(event) {
  //delete the comment
  event.preventDefault()
  let id =
    event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getAttribute(
      "data-key"
    )
  let actionId =
    event.target.parentElement.previousElementSibling.getAttribute("data-key")

  try {
    //try to delete the comment
    const response = await fetch(
      `https://api.trello.com/1/cards/${id}/actions/${actionId}/comments?key=${apiKey}&token=${token}`,
      {
        method: "DELETE",
      }
    )
    const json = await response.json()
    console.log(
      `deleteComment DEL Response: ${response.status} ${response.statusText}`
    )
    console.log(json)
  } catch (error) {
    console.log(error)
  }
  let model =
    event.target.parentElement.parentElement.parentElement.parentElement
      .parentElement
  closeModel(model) //close the modal
  cardDetails(model.parentElement.firstElementChild) //render the modal
}

addGlobalEventListener("dragstart", ".draggable", e => drag(e))

function drag(event) {
  //drag the card
  event.target.classList.add("dragging")
}

addGlobalEventListener("dragend", ".draggable", e => dragEnd(e))

async function dragEnd(event) {
  //end the drag
  event.target.classList.remove("dragging")
  const previousElement = event.target.previousElementSibling
  const currentElement = event.target
  const nextElement = event.target.nextElementSibling
  const currentElementId = event.target.getAttribute("data-key")
  const listId =
    currentElement.parentElement.parentElement.getAttribute("data-key")
  if (previousElement === null) {
    //if the card is the first in the list
    try {
      //try to move the card
      const response = await fetch(
        `https://api.trello.com/1/cards/${currentElementId}?pos=top&idList=${listId}&key=${apiKey}&token=${token}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
          },
        }
      )
      const json = await response.json()
      console.log(
        `dragEnd PUT top Response: ${response.status} ${response.statusText}`
      )
      console.log(json)
    } catch (error) {
      console.log(error)
    }

    return sync() //sync the board
  }
  if (nextElement === null) {
    //if the card is at the bottom
    try {
      //try to move the card
      const response = await fetch(
        `https://api.trello.com/1/cards/${currentElementId}?pos=bottom&idList=${listId}&key=${apiKey}&token=${token}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
          },
        }
      )
      const json = await response.json()
      console.log(
        `dragEnd PUT bottom Response: ${response.status} ${response.statusText}`
      )
      console.log(json)
    } catch (error) {
      console.log(error)
    }

    sync() //sync the board
  }
  if (previousElement !== null && nextElement !== null) {
    //if the card is in the middle
    const previousPosition = parseInt(previousElement.getAttribute("position"))
    const nextPosition = parseInt(nextElement.getAttribute("position"))
    const currentPosition = (previousPosition + nextPosition) / 2 //calculate the position

    try {
      //try to move the card
      const response = await fetch(
        `https://api.trello.com/1/cards/${currentElementId}?pos=${currentPosition}&idList=${listId}&key=${apiKey}&token=${token}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
          },
        }
      )
      const json = await response.json()
      console.log(
        `dragEnd PUT middle Response: ${response.status} ${response.statusText}`
      )
      console.log(json)
    } catch (error) {
      console.log(error)
    }

    sync() //sync the board
  }
}

addGlobalEventListener("dragover", ".cards", e => dragOver(e))

function dragOver(event) {
  //allow the card to be dragged
  event.preventDefault()
  let container = event.target //get the container
  let afterElement = getDragAfterElement(container, event.clientY) //get the element after the mouse
  const draggable = document.querySelector(".dragging") //get the dragging element
  if (afterElement == null) {
    //if the mouse is at the bottom
    container.appendChild(draggable) //put the draggable element at the bottom
  } else {
    //if the mouse is in the middle
    container.insertBefore(draggable, afterElement) //put the draggable element in the middle
  }
}

function getDragAfterElement(container, y) {
  //get the element after the mouse
  let draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ] //get all the draggable elements except the dragging one
  return draggableElements.reduce(
    (closest, child) => {
      let box = child.getBoundingClientRect() //get the element's bounding box
      let offset = y - box.top - box.height / 2 //calculate the offset
      if (offset < 0 && offset > closest.offset) {
        //if the offset is smaller than 0 and bigger than the closest offset
        return { offset: offset, element: child } //return the element and the offset
      } else {
        //if the offset is smaller than 0 and bigger than the closest offset
        return closest //return the closest element
      }
    },
    { offset: Number.NEGATIVE_INFINITY } //initialize the closest element
  ).element //return the closest element
}
