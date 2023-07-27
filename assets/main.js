
ipAddress = "http://localhost:8865";

signalRConnection: String = "";

var chatId = 0;




/*
    Doc El
*/
zenFabButton: HTMLElement;
zenChatContent: HTMLElement;

zenChatBasePer: HTMLElement;

zenChatBasePer0: HTMLElement;
zenChatBasePer1: HTMLElement;

zenChatBasePer1Content: HTMLElement;


/*
    Doc El
*/
function getRequestHeader() {
    return {
        "apiKey": "3bfd5eda",
        "apiSecretKey": "8fa4a8d0956cdfcf",
        "referanceId": "1",
        "X-Device-Referer": localStorage.getItem("X-Device-Referance"),
        "X-WebChat-Connection": this.signalRConnection,
    };
}

function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function stylesheetMain() {
    var link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css";
    document.getElementsByTagName('HEAD')[0].appendChild(link);
}

function stylesheetFontawasome() {
    var link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css";
    document.getElementsByTagName('HEAD')[0].appendChild(link);
}


function stylesheetBootstrap() {
    var link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css";
    document.getElementsByTagName('HEAD')[0].appendChild(link);
}


function scriptJQuery() {
    var script = document.createElement('script');
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js";
    document.getElementsByTagName('HEAD')[0].appendChild(script);
}

scriptJQuery();
stylesheetFontawasome();
stylesheetBootstrap();

document.addEventListener('DOMContentLoaded', function () {


    this.zenFabButton = document.getElementById("zenFabButton");
    this.zenChatContent = document.getElementById("zenChatContent");

    this.zenChatBasePer = document.getElementById("zenChatBasePer");

    this.zenChatBasePer0 = document.getElementById("zenChatBasePer0");
    this.zenChatBasePer1 = document.getElementById("zenChatBasePer1");

    this.zenChatBasePer1Content = document.getElementById("zenChatBasePer1Content");

    if (localStorage.getItem("X-Device-Referance") == (null || undefined))
        localStorage.setItem("X-Device-Referance", newGuid());

    this.zenChatBasePer1.hidden = true;
    this.zenChatContent.hidden = true;
});

function openOrClose() {
    this.zenChatContent.hidden = !this.zenChatContent.hidden;
    this.zenFabButton.hidden = !this.zenFabButton.hidden;

    getMessages();
}

async function signalRStart() {
    var connection = new signalR.HubConnectionBuilder()
        .withUrl(this.ipAddress + "/WebChatHub?referanceId=1&apiKey=3bfd5eda&apiSecretKey=8fa4a8d0956cdfcf&type=regional")
        .build();

    await connection.start();

    signalRConnection = connection.connectionId;

    console.log(this.signalRConnection);
    connection.on("refresh", message => {
        getMessages();
    });

}

async function sendMessage() {
    var messageRe = $("#messageRe").val().trim();
    if (messageRe == "") {
        alert("Lütfen eksik alanları doldurunuz.");
        return;
    }
    $.ajax({
        url: this.ipAddress + "/api/APIWebChat/SendMessage",
        headers: this.getRequestHeader(),
        type: "POST",
        data: {
            "chatId": chatId,
            "message": messageRe,
        },
        success: function (data) {
            if (data == null) return;
            if (data.resultCode == 0) {
                $("#messageRe").val("");
                renderMessages(data.resultObject);
            }
        }
    });
}

async function renderMessages(data) {
    this.zenChatBasePer0.hidden = true;
    this.zenChatBasePer1.hidden = false;

    var messages = "";



    data.zenWebChatHareket.forEach(el => {
        if (el.taraf == 2) {
            messages += "<div class=\"message-right\">";
            messages += "<div style=\"text-align: end;\">" + el.aciklama + "</div>";
            messages += "<div style=\"font-weight: 600; text-align: end; font-size:13px;\">Siz</div>";
            messages += "</div>";
        }
        else if (el.taraf == 1) {
            messages += "<div class=\"message-left\">";
            messages += "<div style=\"font-weight: 600; font-size:13px;\">Temsilci</div>";
            messages += "<div style=\"text-align: start;\">" + el.aciklama + "</div>";
            messages += "</div>";
        }
    });

    this.zenChatBasePer1Content.innerHTML = messages;

    this.zenChatBasePer.scrollTop += 9999999999;
}

async function getMessages() {
    if (this.signalRConnection == null || this.signalRConnection == "")
        signalRStart();

    $.ajax({
        url: this.ipAddress + "/api/APIWebChat/GetWebChat",
        headers: this.getRequestHeader(),
        type: "GET",
        success: function (data) {
            if (data == null) return;
            if (data.resultCode == 0) {
                if (data.resultObject == null) return;
                chatId = data.resultObject.id;
                renderMessages(data.resultObject);
            }
        }
    });
}

async function startChat() {
    await signalRStart();

    var name = $("#name").val().trim(), tel = $("#tel").val().trim(), mail = $("#mail").val().trim(), message = $("#message").val().trim();

    if (name == "" || tel == "" || mail == "" || message == "") {
        alert("Lütfen eksik alanları doldurunuz.");
        return;
    }
    if (signalRConnection == null) {
        alert("Bağlantı sağlanamadı. R.");
        return;
    }

    $.ajax({
        url: this.ipAddress + "/api/APIWebChat/BeginWebChat",
        headers: this.getRequestHeader(),
        data: {
            "message": JSON.stringify({
                "name": name,
                "TelNumber": tel,
                "mail": mail,
                "message": message
            })
        },
        type: "POST",
        success: function (data) {
            if (data == null) return;
            if (data.resultCode == 0) {
                chatId = data.resultObject.id;
                renderMessages(data.resultObject);
            }
        }
    });
}