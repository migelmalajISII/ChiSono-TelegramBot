const TelegramBot = require('node-telegram-bot-api');
const configurazione = require('./config/config.json');
const mysql = require('mysql');
const axios = require('axios');

const token = configurazione.TokenTelegram;
const bot = new TelegramBot(token, { polling: true });

var categorie = [];
//FillCategorie()

var countdown = {}

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

function RestartTimeOut(id) { // Stranamente Funziona Molto BUONO
    if (countdown[id] != undefined) {
        clearTimeout(countdown[id])
    }
    var callback = setTimeout(() => {
        var conn = ConnectDB()
        conn.query("UPDATE Partite SET Status=01 WHERE FKGruppo=? AND Status=00", id, (err, res) => {
            console.log(res)
            if (res[0].affectedRows > 0) {
                bot.sendMessage("-" + id, "Partita avviata");
            }
            DisconnectDB(conn)
        })
    }, 30000);
    countdown[id] = callback;
}

function NuovoRound(id) {

}

bot.onText(/\/start/, (msg) => {
    if (msg.chat.type == 'group') {
        var conn = ConnectDB()
        conn.query("INSERT INTO utenti(Ruolo,IDUtente) VALUES (0,?)", Math.abs(msg.chat.id), (err, result) => {
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
    if (msg.chat.type == 'group') { //Converti ai gruppi
        var conn = ConnectDB()
        conn.query("SELECT IDPartita FROM Partite WHERE FKGruppo=? AND Status=01 OR Status=00", Math.abs(msg.chat.id), (err, res) => {
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
        bot.sendMessage(msg.chat.id, "Comando disponibile solo per i gruppi");
    }
});

bot.onText(/\/setround (\d+)/, (msg, match) => {
    if (msg.chat.type == 'group') { //Converti ai gruppi
        var conn = ConnectDB()
        conn.query("UPDATE Partite SET Round=? WHERE FKGruppo=? AND (Status=00 OR Status=01)", [match[1], Math.abs(msg.chat.id)], (err, res) => {
            if (err) {
                bot.sendMessage(msg.chat.id, "Errore: Bot Inattivo.\nRiprovare più tardi");
                console.error("Errore nel database: " + err)
            }
            DisconnectDB(conn)
        })
    } else {
        bot.sendMessage(msg.chat.id, "Comando disponibile solo per i gruppi");
    }
});

bot.onText(/\/partecipo/, (msg) => {
    if (msg.chat.type == 'group') {
        new Promise((resolve, reject) => {
            var conn = ConnectDB()
            conn.query("INSERT INTO utenti(Ruolo,IDUtente) VALUES (0,?)", msg.from.id, (err, result) => {
                if (err) {
                    if (err.code != 'ER_DUP_ENTRY') {
                        reject(err);
                        return
                    }
                }
                resolve(msg.from.id);
                DisconnectDB(conn)
            })
        }).then(() => {
            var conn = ConnectDB()
            conn.query("SELECT IDPartita FROM partite WHERE FKGruppo=?", Math.abs(msg.chat.id), (err, result) => {
                //Gestione della partita avviata o non esistente e dell'utente già in partita
                if (err) {
                    throw err
                } else {
                    /*conn.query("INSERT INTO partecipazione(FKUtente,FKPartita) VALUES (?,?)", [value, result[0].IDPartita], (errs, results) => {
                        if (errs)
                            throw errs;
                    })*/
                }
                DisconnectDB(conn)
                RestartTimeOut(Math.abs(msg.chat.id))
                return true;
            })
        }).then((ok) => {
            console.log(ok)
            if (!ok)
                throw new Error("Not OK")
            bot.sendMessage(msg.chat.id, "*[" + msg.from.first_name + "](tg://user?id=" + msg.from.id + ")* Si è unito in questa partita", { parse_mode: 'Markdown' });
        }).catch(err => {
            //! Warning: Gestire Duplicato nella partecipazione
            console.log(err)
            bot.sendMessage(msg.chat.id, "Errore: Bot Inattivo.\nRiprovare più tardi");
            console.error("Errore nel database: ")
            throw err;
        })
    } else {
        bot.sendMessage(msg.chat.id, "Comando disponibile solo per i gruppi");
    }
});


bot.on("polling_error", (msg) => console.log(msg));

bot.on("callback_query", function(callbackQuery) {
    let number = callbackQuery.data.split('_')[1].trim()
    let categoria = categorie.find(elem => elem.callback_data == callbackQuery.data).text;
    var conn = ConnectDB()
    conn.query("INSERT INTO Partite(FKCategoria,FKGruppo) VALUES (?,?)", [parseInt(number), Math.abs(parseInt(callbackQuery.message.chat.id))], (err, results) => {
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