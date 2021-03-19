const TelegramBot = require('node-telegram-bot-api');
const configurazione = require('./config/config.json');
const mysql = require('mysql');
const axios = require('axios');

const token = configurazione.TokenTelegram;
const bot = new TelegramBot(token, { polling: true });

const ID = 24;

var categorie = [];
FillCategorie()

function ConnectDB() {
    const config = {
        host: configurazione.DB_HOST,
        database: configurazione.DB_DATABASE,
        user: configurazione.DB_USER,
        password: configurazione.DB_PASSWORD
    }
    var connection = mysql.createConnection(config);
    connection.connect(function(err) {
        if (err) {
            console.log("Non connesso => " + err);
            throw err;
        }
        console.log("Connesso");
    });

    return connection;
}

function DisconnectDB(con) {
    con.end(function(err) {
        if (err) {
            console.log("Non disconnesso => " + err);
            throw err;
        }
        console.log("Disconnesso");
    });
}

function FillCategorie() {
    var conn = ConnectDB()
    conn.query("SELECT CONCAT(\"cat_\",IDCategoria) AS callback_data, Alias AS text FROM Categorie", (err, res) => {
        if (err)
            throw err;
        categorie = res;
        DisconnectDB(conn)
    })

}

bot.onText(/\/start/, (msg) => {
    if (msg.chat.type == 'group') {
        var conn = ConnectDB()
        conn.query("INSERT INTO utenti(Ruolo,IDTelegram) VALUES (0,?)", parseInt(ID), (err, result) => {
            if (err) {
                if (err.code != 'ER_DUP_ENTRY') {
                    bot.sendMessage(msg.chat.id, "Errore: Bot Inattivo.\nRiprovare più tardi");
                    throw err
                }
            }
            DisconnectDB(conn)
            bot.sendMessage(msg.chat.id, "Grazie per avermi inserito in questo magnifico gruppo [" + msg.from.first_name + "](tg://user?id=" + msg.from.id + ")", { parse_mode: 'Markdown' });
        });
    } else {
        bot.sendMessage(msg.chat.id, "Io sono il bot per giocare a *Chi Sono* su Telegram.\nPer iniziare aggiungimi su un gruppo", { parse_mode: 'Markdown' });
    }
});

bot.onText(/\/newgame/, (msg) => {
    if (msg.chat.type == 'private') { //Converti ai gruppi
        var conn = ConnectDB()
        conn.query("SELECT IDPartita FROM Partite WHERE FKGruppo=? AND isEnded=0", parseInt(31), (err, res) => {
            if (res.length) {
                bot.sendMessage(msg.chat.id, "Una partita è già in corso");
            } else {
                bot.sendMessage(msg.chat.id, "Scegli la categoria", {
                    reply_markup: { inline_keyboard: [categorie] }
                });
            }
            DisconnectDB(conn)
        })
    } else {
        bot.sendMessage(msg.chat.id, "Comando disponibile per i gruppi");
    }
});

bot.onText(/\/partecipo/, (msg) => {
    if (msg.chat.type == 'group') { //Convertire su gruppi
        Promise((resolve, reject) => {
            var conn = ConnectDB()
            conn.query("INSERT INTO utenti(Ruolo,IDTelegram) VALUES (0,?)", parseInt(ID), (err, result) => {
                if (err) {
                    if (err.code != 'ER_DUP_ENTRY') {
                        reject(err);
                        return
                    } else {
                        conn.query("SELECT IDUtente FROM utenti WHERE IDTelegram=?", parseInt(ID), (errs, results) => {
                            if (errs) {
                                reject(err);
                                return
                            }
                            resolve(results[0].IDUtente);
                        })
                    }
                } else {
                    resolve(result.insertId);
                }
                DisconnectDB(conn)
            })
        }).then(value => {

        }).catch(err => {
            bot.sendMessage(msg.chat.id, "Errore: Bot Inattivo.\nRiprovare più tardi");
            console.error("Errore nel database: ")
            throw err;
        })
    } else {
        bot.sendMessage(msg.chat.id, "Comando disponibile per i gruppi");
    }
});


bot.on("polling_error", (msg) => console.log(msg));

bot.on("callback_query", function(callbackQuery) {
    let number = callbackQuery.data.split('_')[1].trim()
    let categoria = categorie.find(elem => elem.callback_data == callbackQuery.data).text;
    var conn = ConnectDB()
    conn.query("INSERT INTO Partite(FKCategoria,FKGruppo) VALUES (?,?)", [parseInt(number), parseInt( /*callbackQuery.message.chat.id*/ 31)], (err, results) => {
        if (err) {
            bot.editMessageText("Errore: Bot Inattivo.\nRiprovare più tardi", {
                chat_id: callbackQuery.message.chat.id,
                message_id: callbackQuery.message.message_id
            });
            console.error("Errore nel database: ")
            throw err;
        }
        bot.editMessageText("Partita avviata con successo.\nCategoria scelta: *" + categoria + "*.\nPer partecipare digitare [\/partecipo](tg://partecipo)", {
            parse_mode: 'Markdown',
            chat_id: callbackQuery.message.chat.id,
            message_id: callbackQuery.message.message_id
        });
        DisconnectDB(conn)
    })
});