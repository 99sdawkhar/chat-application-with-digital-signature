var socket = io();
var messages = document.getElementById("messages");

(function() {
  $("#send").click(function(e) {
    let unsigned = false;
    let alter = false;
    let li = document.createElement("li");
    if ($("#signed-message:checkbox:checked").length > 0) {
      unsigned = true;
    }
    
    if ($("#alter-message:checkbox:checked").length > 0) {
      alter = true;
    }

    // send data to receiver on submit
    socket.emit("chat message", ({message: $("#message").val(),unsigned, alter}));
    // $("#messages").scrollTop($(document).height());
    // $("#messages").scrollTop = $("#messages").scrollHeight;

    e.preventDefault(); // prevents page reloading
    $("#message").val("");

    return false;
  });



  // Data is displayed on receiver end when sender sends data on click
  // socket.on("output-messages", data => {
  //   // console.log('Added Data: ',data[0].decyptedMessage);
  //   // $('#messages li').remove();
  //   if (data.length) {
  //     data.forEach(user => {
  //       appendMessages(user.decyptedMessage, user.unsigned, user.alter)
  //     });
  //   }
  //   console.log("Hello bingo!");
  // });

  // Data is displayed on receiver end when sender sends data on click
  // socket.on("received", data => {
  //   console.log('Added Data: ',data.message);
  //   $("#messages").append(`<li>
  //     <h3>${data.message}</h3>
  //     <span class="unsigned">${data.unsigned}</span>
  //     <span class="altered">${data.alter}</span>
  //     <span class="user-info">by Anonymous : ssjust now</span>
  //   </li>`);
  //   console.log("Hello bingo!");
  // });
  // function sendMessage(message){
  //   $.post('http://localhost:5000/messages', message)
  // }
})();

// // Data is displayed on receiver end when sender sends data on click
socket.on("message", data => {
  appendMessages(data.decyptedMessage, data.unsigned, data.alter)
  console.log("New Message");
});



socket.on("output-messages", data => {
  // console.log('Added Data: ',data[0].decyptedMessage);
  $('#messages li').remove();
  if (data.length) {
    data.forEach(user => {
      appendMessages(user.decyptedMessage, user.unsigned, user.alter, user.createdAt)
    });
  }
  console.log("All Exsiting Data From Db");
});

const appendMessages = (decyptedMessage, unsigned, alter, createdAt = 'just now') => {
  $("#messages").append(`<li>
      <h3>${decyptedMessage}</h3>
      <span class="unsigned">${unsigned}</span>
      <span class="altered">${alter}</span>
      <span class="user-info">by Anonymous : ${formatTimeAgo(createdAt) === undefined?'just now':formatTimeAgo(createdAt)}</span>
    </li>`).scrollTop($("#messages")[0].scrollHeight);

    // Below doesnot work for arrow function
    // $("#messages").scrollTop(function() { return this.scrollHeight; });
  
}
// fetching initial chat messages from the database onload for receiver
// (function() {
//   fetch("/chats")
//     .then(data => {
//       return data.json();
//     })
//     .then(json => {
//       json.map(data => {
//         let unsignedValue;
//         let altered = '';
//         if (data.unsigned === true || data.alter === true) {
//           if (data.alter === true) {
//             altered = 'Compromised ';
//           }
//           unsignedValue = 'Not Secure ';
//         } else {
//           unsignedValue = 'Secure ';
//           // console.log('Secure', data.decyptedMessage);
//         }
//         $("#messages").append(`<li>
//           <h3>${data.decyptedMessage}</h3>
//           <span class="unsigned">${unsignedValue}</span>
//           <span class="altered">${altered}</span>
//           <span class="user-info">by ${data.sender} : ${formatTimeAgo(data.createdAt)}</span>
//         </li>`);
//       });
//     });
// })();


//is typing...

// let messageInput = document.getElementById("message");
// let typing = document.getElementById("typing");

// //isTyping event
// messageInput.addEventListener("keypress", () => {
//   socket.emit("typing", { user: "Someone", message: "is typing..." });
// });

// socket.on("notifyTyping", data => {
//   typing.innerText = data.user + " " + data.message;
//   console.log(data.user + data.message);
// });

// //stop typing
// messageInput.addEventListener("keyup", () => {
//   socket.emit("stopTyping", "");
// });

// socket.on("notifyStopTyping", () => {
//   typing.innerText = "";
// });
