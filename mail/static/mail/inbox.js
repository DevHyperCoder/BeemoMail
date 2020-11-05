// Runs when the DOM (when html is loaded)
document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

// Compose email function
function compose_email() {

  // Show compose view and hide other views

  // Get the div where the id is emails-view, set the display (think of CSS display property) to none
  document.querySelector('#emails-view').style.display = 'none';

  // Get the div where the id is compose-view, set the display (think of CSS display property) to block
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out input fields wt default values
  document.querySelector('#recepients').textContent = 'Recipients';
  document.querySelector('#subject').value = 'Subject:';
  document.querySelector('#email-text').textContent = 'Type your message here!';
}

//  Create a email function
async function createEmail() {
  const recipients = (document.getElementById("recepients").textContent)
  const subject = (document.getElementById("compose-subject").textContent)
  const body = (document.getElementsByClassName("compose-textarea")[0].value)

  // Make a POST request to server with email contents
  const response = await fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })

  // Get the response BACK from the server as JSON format
  const json = await response.json()

  // FIXME add correct error handling

  load_mailbox('sent')


  // TODO make it better
  //Right now you would see [Object]
  document.getElementById("email-success").textContent = json
}

// Load Mailbox function
async function load_mailbox(mailbox) {

  // Put the mailbox name in localstorage
  localStorage.setItem("mailbox_name", mailbox);

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#heading').textContent = mailbox

  // Make a GET request to server to get ALL the emails from the mailbox
  const response = await fetch(`/emails/${mailbox}`)
  const json = await response.json()

  //Get the first email in the list
  const firstEmail = json[0]

  // If first ERmail actually exists then run the code below
  if (firstEmail) {

    //TODO fix

    // Make the email read
    await fetch(`/emails/${firstEmail.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })


    // Set the subject, sender and the email-text
    document.getElementById("subject").textContent = firstEmail.subject
    document.getElementById("sender").textContent = firstEmail.sender
    document.getElementById("email-text").value = firstEmail.body

    document.getElementsByClassName("timestamp")[0].textContent = json.timestamp
    // Set the email ID to localstorage
    localStorage.setItem("emailID", firstEmail.id)

    // Set archive status on the button
    const archiveButton = document.getElementById("archive-btn")
    archiveButton.style.display = "block"
    if (firstEmail.archived) {
      // Email IS archived
      archiveButton.textContent = "Un Archive"
    }
    else {
      // Email IS NOT archived
      archiveButton.textContent = "Archive"
    }

    // Set the status to localStorage
    localStorage.setItem("isArchived", firstEmail.archived)
  }

  else {
    // Set the subject, sender and the email-text

    document.getElementById("subject").textContent = ""
    document.getElementById("sender").textContent = ""
    document.getElementById("email-text").value = ""
    document.getElementsByClassName("timestamp")[0].textContent = ""
    // Set archive status on the button
    const archiveButton = document.getElementById("archive-btn")
    archiveButton.style.display = "none"
  }

  // Get the first div whose class is 'cards'
  const cards = document.getElementsByClassName("cards")[0]

  // Get all elements inside cards div
  // * in querySelector means all elements (applies to CSS as well)
  const allElementsInsideCardsDIV = cards.querySelectorAll('*')

  // For each element, remove it
  allElementsInsideCardsDIV.forEach(element => element.remove())

  // For each email in the email list
  json.forEach(jsonEmail => {
    // Get email id
    const emailID = jsonEmail.id

    // Create a div and add a class 'email-card'
    const emailCard = document.createElement("div")
    emailCard.classList = ["email-card"]

    // Create a div and h1, set the text of h1 to sender of email
    const div1 = document.createElement("div") // div => <div></div>

    const senderH1 = document.createElement("h1")
    if (jsonEmail.read) {
      senderH1.style.color = "#adade0"
    }
    senderH1.innerText = jsonEmail.sender

    // Create a p, set the text to body of email
    const p = document.createElement("p")
    p.textContent = jsonEmail.body

    // Put the h1 and p inside the div
    div1.append(senderH1) // <div><h1>asdf</h1></div>
    div1.append(p) // <div><h1>asdf</h1><p>asdf</p></div>

    // Put the div inside the email card
    emailCard.append(div1)

    // Add a click event listener.. 
    // Basically will run this code when the email card is clicked
    emailCard.addEventListener('click', async () => {
      // Make a GET request to server to get the specific email the user clicked on
      const response = await fetch(`/emails/${emailID}`)
      // Convert the json 
      const json = await response.json()

      // Make the email read
      await fetch(`/emails/${json.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })

      // Set the subject, sender and the email-text
      document.getElementById("subject").textContent = json.subject
      document.getElementById("sender").textContent = json.sender
      document.getElementById("email-text").value = json.body

      document.getElementsByClassName("timestamp")[0].textContent = json.timestamp

      // Set the email ID to localstorage
      localStorage.setItem("emailID", json.id)

      // Set archive status on the button
      const archiveButton = document.getElementById("archive-btn")

      archiveButton.style.display = "block"
      if (json.archived) {
        // Email IS archived
        archiveButton.textContent = "Un Archive"
      }
      else {
        // Email IS NOT archived
        archiveButton.textContent = "Archive"
      }

      // Set the status to localStorage
      localStorage.setItem("isArchived", json.archived)
    })

    cards.append(emailCard)

  });
  console.log(cards)
}

//  String = wrapped in "" or '' or ``
// Boolean = NOT WRAPPED in anything


// Runs when the un read btn is pressed
async function onReadPress() {
  // Get the EMAIL ID from localStorage
  const emailIDToUnRead = localStorage.getItem("emailID")

  await fetch(`/emails/${emailIDToUnRead}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: false
    })
  })
  load_mailbox(localStorage.getItem('mailbox_name'))
}

// Runs when the archive button is pressed
async function onArchivePress() {
  // Get the EMAIL ID from localStorage
  const emailIDToArchive = localStorage.getItem("emailID")

  // get the archived status from localstorage 
  // convert string to boolean
  const isArchived = (localStorage.getItem("isArchived") === 'true')

  // Archive or UnArchive the email
  await fetch(`/emails/${emailIDToArchive}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !isArchived
    })
  })
  load_mailbox(localStorage.getItem('mailbox_name'))
}

async function onReply() {
  // make the compose box appear
  compose_email();

  const emailID = localStorage.getItem("emailID")

  const response = await fetch(`/emails/${emailID}`)
  const json = await response.json()

console.log(json);

  //Fill in the fields with email contents
  document.getElementById('recepients').textContent = json.sender;
  document.getElementById('compose-subject').textContent = "Re: " + json.subject;
document.getElementsByClassName("compose-textarea")[0].value=
  `On ${json.timestamp} ${json.sender} wrote, ${json.body}`;
 
}

// Store email id in localstorage
// when archive btn is pressed, get the email id (from localstorage)
// and make it archived
