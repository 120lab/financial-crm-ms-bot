var builder = require('botbuilder');
var restify = require('restify');
// Create console connector for testing
// var connector = new builder.ConsoleConnector().listen();
// Create channel connector for IM 

///*
/// ==============================================
/// Debug mode
/// ==============================================
var connector = new builder.ChatConnector();
//*/
/*
/// ==============================================
/// Azure mode
/// ==============================================
var connector = new builder.ChatConnector({
    appId: '89241c97-db33-4526-8a8f-872b5c632f85',
    appPassword: 'BqCgd3YUbSvQU0v9Vh4oPWt'
});
/// ==============================================
*/
var bot = new builder.UniversalBot(connector);
// App id : 89241c97-db33-4526-8a8f-872b5c632f85
// App id password :  BqCgd3YUbSvQU0v9Vh4oPWt
// Demo 1
// Create a simple dialog message to root dialog
// bot.dialog('/',function(session){
//     var userMessage = session.message.text;
//     session.send('Hello, bot!');
//     session.send('You said :' + userMessage );
// });

// Demo 2
// Waterfall dialog

/// Start conversation
bot.dialog('/', new builder.IntentDialog()
    .matches(/^הי/i, '/startConv')
    .matches(/^שלום/i, '/startConv')
    .matches(/^עזרה/i, '/startConv')
    .onDefault(builder.DialogAction.send("?"))
);

bot.dialog('/startConv', [
    function (session) {
        session.send("הי, שרות לקוחות על ידי בוט כאן עבורך 24/7");
        builder.Prompts.choice(session, "להלן השרותים האפשריים, הקש בחירתך בבקשה", "סיום|מסירת אישור על קבלת מסמך|דוח שנתי רבעוני במייל");
    },
    function (session, result) {
        if (result.response.entity === "מסירת אישור על קבלת מסמך" || result.response.entity === "דוח שנתי רבעוני במייל") {
            session.beginDialog('/auth', result.response.entity);
        }
        else {
            session.beginDialog('/endConv');
        }
    },
    function (session, result) {

        if (result.response === "auth=true;action=מסירת אישור על קבלת מסמך") {
            session.beginDialog('/actionIsGetDoc');
            session.beginDialog('/endConv');
        }
        else if (result.response === "auth=true;action=דוח שנתי רבעוני במייל") {
            session.beginDialog('/actionYearlyReport');
            session.beginDialog('/endConv');
        }
    }
]);

bot.dialog('/auth', [
    function (session, args) {

        session.dialogData.args = args;
        builder.Prompts.text(session, "באחריותנו לשמור על פרטיותך, הזדהה על ידי הקשת מספר מזהה בן 9 ספרות");
    },
    function (session, result) {

        if (result.response === "031684475") {
            result.response = "auth=true;action=" + session.dialogData.args;
            session.endDialogWithResult(result);
        }
        else {
            result.response = "auth=false;action=" + session.dialogData.args;
            builder.Prompts.text(session, "ההזדהות נכשלה, תרצה לנסות שוב?");
        }
    },
    function (session, result) {

        if (result.response == "כן") {
            session.beginDialog('/auth');
        }
        else {
            result.response = "auth=false";
            session.endDialogWithResult(result.response);
        }

    }
]);

bot.dialog('/actionIsGetDoc', [
    function (session) {
        session.send("שלום עידן");
        session.send("");
        session.send("ברשותנו מידע מהשבוע האחרון, בתאריך 10.10.2016 התקבל מסמך 'עדכון פרטים'");
        session.endDialog();
    }
]);

bot.dialog('/actionYearlyReport', [
    function (session) {
        session.send("שלום עידן");
        session.send("דוח רבעון אחרון נשלח אל כתובת המייל שלך");
        session.endDialog();
    }
]);

bot.dialog('/endConv', [
    function (session) {
        session.send("תודה שהשתמשת בשרות הבוט");
        session.endDialog();
    }
]);

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/messages', connector.listen());