var socket = io();
var messages = document.getElementById("messages");
function getName() {
  nameValue = $('#sender').val();
  const name = prompt('Enter you name');
  if(name != null && name!=""){
    $('#sender').val(name)
  }else{
    alert("Please enter your name to proceed");
    getName();
  }
}

(function() {
  if ($('#sender').val()) {
    console.log('Exisits')
  } else {
    console.log('not Exisits')
    getName()
  }

  // send data to receiver on submit
  socket.emit("new-user", ({name: $("#sender").val()}));

  // console.log($('#sender').val());
  $("#send").click(function(e) {
    disableSubmit();
    let unsigned = false;
    let alter = false;
    let li = document.createElement("li");
    if ($("#signed-message:checkbox:checked").length > 0) {
      unsigned = true;
    }
    
    if ($("#alter-message:checkbox:checked").length > 0) {
      alter = true;
    };

    // send data to receiver on submit
    socket.emit("chat message", ({message: $("#message").val(),unsigned, alter, name: $("#sender").val()}));

    e.preventDefault(); // prevents page reloading
    $("#message").val("");

    return false;
  });

  const disableSubmit = () => {
    $('#send').attr('disabled',true);
    $('#message').keyup(function() {
      const message = $(this).val().trim();
      if(message.length != 0)
        $('#send').attr('disabled', false);            
      else
        $('#send').attr('disabled',true);
    })
  }
  disableSubmit();
})();

// Data is displayed on receiver end when sender sends data on click
socket.on("message", data => {
  appendMessages(data.decyptedMessage, data.unsigned, data.alter, data.sender, data.createdAt)
  console.log("New Message");
});

// User connected
// socket.on("user-connected", name => {
//   appendConnectedMessage(name)
// });

socket.on("output-messages", data => {
  $('#messages li').remove();
  if (data.length) {
    data.forEach(user => {
      appendMessages(user.decyptedMessage, user.unsigned, user.alter, user.sender, user.createdAt)
    });
  }
  console.log("All Exsiting Data From Db");
});

const appendMessages = (decyptedMessage, unsigned, alter, name, createdAt = 'just now') => {
  $("#messages").append(`<li>
    <h3 class="${alter?'compromised':''}">
      <span class="user-name">${name?name:'Anonymous'}:</span> ${decyptedMessage}
    </h3>
    <span class="${unsigned}">${unsigned}</span>
    <span class="user-info">${formatTimeAgo(createdAt) === undefined?'just now':formatTimeAgo(createdAt)}</span>
  </li>`).scrollTop($("#messages")[0].scrollHeight);
}

const appendConnectedMessage = (name) => {
  $("#messages").prepend(`<h3>You joined</h3>`);
}