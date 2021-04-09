const TelegramBot = require('node-telegram-bot-api');
const configurazione = require('./config/config.json');
const mysql = require('mysql');
const axios = require('axios');

const token = configurazione.TokenTelegram;
const bot = new TelegramBot(token, {
    polling: true
});

var categorie = []
FillCategorie()

var countdownUser = {}

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
    if (countdownUser[id] != undefined) {
        clearTimeout(countdownUser[id])
    }
    var callback = setTimeout(() => {
        var conn = ConnectDB()
        conn.query("UPDATE Partite SET Status=1 WHERE FKGruppo=? AND Status=0", id, (err, res) => {
                VerificaPartita(id).then((value) => {
                    if (!value[3])
                        bot.sendMessage("-" + id, "Partita avviata");
                    else
                        bot.sendMessage("-" + id, "Partita avviata.\nATTENZIONE: Possibili duplicati");
                    DisconnectDB(conn);
                    GeneraRuoli("-" + id, value[1], value[0], value[2]);
                }).catch(() => {
                    conn.query("DELETE FROM partite WHERE FKGruppo=?", id);
                    bot.sendMessage("-" + id, "Partita non avviata");
                });
            })
            //}, 30000);
    }, 10000); //Passa a 30000
    countdownUser[id] = callback;
}

function VerificaPartita(id) {
    return new Promise((resolve, reject) => {
        var conn = ConnectDB()
        conn.query("SELECT COUNT(LP.`FKUtente`) AS num, LP.`FKPartita`, P.`FKCategoria` FROM `logpartite` AS LP INNER JOIN `partite` AS P ON LP.`FKPartita`=P.`IDPartita` WHERE P.`Status`= 1 AND P.`FKGruppo`= ? GROUP BY LP.`FKPartita`", id, (err, res) => {
            try {
                if (res[0].num < 1) // Cambiare a 2
                    reject(); // 0 e 1 Giocatore
                else if (res[0].num < 20)
                    resolve([res[0].num, res[0].FKPartita, res[0].FKCategoria, false]); // 2<x<20
                else
                    resolve([res[0].num, res[0].FKPartita, res[0].FKCategoria, true]); // >=21
                DisconnectDB(conn)
            } catch (e) {
                reject();
            }
        })
    })
}

async function GeneraRuoli(IDMessaggio, IDPartita, NumGiocatori, FKCategoria) {
    new Promise((resolve, reject) => {
        var conn = ConnectDB()
        elementi = conn.query("SELECT `IDElemento` FROM `elementi` WHERE `FKCategoria`=? ORDER BY RAND() LIMIT ?", [FKCategoria, NumGiocatori], (err, res) => {
            if (err) {
                reject();
            }
            utenti = conn.query("SELECT `FKUtente` FROM `logpartite` WHERE `FKPartita`=? ", [IDPartita], (errs, ress) => {
                if (errs) {
                    reject();
                }
                resolve([res, ress]);
            })
            DisconnectDB(conn)
        })
    }).then((value) => {
        if (NumGiocatori <= 20) {
            for (let i = 0; i < NumGiocatori; i++) {
                var conn = ConnectDB()
                conn.query("UPDATE `logpartite` SET `FKElemento`=? WHERE `FKUtente`=? AND `FKPartita`=?", [value[0][i].IDElemento, value[1][i].FKUtente, IDPartita], (err, res) => {
                    if (err) {
                        bot.sendMessage(IDMessaggio, "Errore: Bot Inattivo.\nRiprovare più tardi");
                        throw err;
                    }
                    if (i == NumGiocatori - 1)
                        MandaMessaggi(IDPartita, value[1]);
                })
                DisconnectDB(conn)
            }
        } else {
            for (let i = 0; i < NumGiocatori; i++) {
                let elem = Math.floor(Math.random() * value[0].length);
                var conn = ConnectDB()
                conn.query("UPDATE `logpartite` SET `FKElemento`=? WHERE `FKUtente`=? AND `FKPartita`=?", [value[0][elem].IDElemento, value[1][i].FKUtente, IDPartita], (err, res) => {
                    if (err) {
                        bot.sendMessage(IDMessaggio, "Errore: Bot Inattivo.\nRiprovare più tardi");
                        throw err;
                    }
                    if (i == NumGiocatori - 1)
                        MandaMessaggi(IDPartita, value[1]);
                })
                DisconnectDB(conn)
            }
        }
    }).catch(() => {
        bot.sendMessage(IDMessaggio, "Errore: Bot Inattivo.\nRiprovare più tardi");
    })
}

async function MandaMessaggi(IDPartita, players) {
    players.forEach(x => {
        var conn = ConnectDB()
        conn.query("SELECT E.`Valore`, LP.`FKUtente` FROM `logpartite` AS LP INNER JOIN `elementi` AS E ON LP.`FKElemento`=E.`IDElemento` WHERE `FKUtente` <> ? AND `FKPartita`=?", [x.FKUtente, IDPartita], (err, res) => {
            if (err) {
                bot.sendMessage(x.FKUtente, "Errore: Bot Inattivo.\nRiprovare più tardi");
                throw err;
            }
            res.forEach(y => {
                bot.sendMessage(x.FKUtente, "L' [Utente](tg://user?id=" + y.FKUtente + ") è " + y.Valore, {
                    parse_mode: 'Markdown'
                });
            })
        })
        DisconnectDB(conn)
    })
}

bot.onText(/\/start/, (msg) => {
    if (msg.chat.type == 'group') {
        var conn = ConnectDB()
        conn.query("INSERT INTO utenti(Ruolo,IDUtente) VALUES (1,?)", Math.abs(msg.chat.id), (err, result) => {
            if (err) {
                if (err.code != 'ER_DUP_ENTRY') {
                    bot.sendMessage(msg.chat.id, "Errore: Bot Inattivo.\nRiprovare più tardi");
                    throw err
                }
            }
            bot.sendMessage(msg.chat.id, "Grazie per avermi inserito in questo magnifico gruppo [" + msg.from.first_name + "](tg://user?id=" + msg.from.id + ")", {
                parse_mode: 'Markdown'
            });
        });
        DisconnectDB(conn)
    } else {
        var conn = ConnectDB()
        conn.query("INSERT INTO utenti(Ruolo,IDUtente) VALUES (0,?)", Math.abs(msg.chat.id), (err, result) => {
            if (err) {
                if (err.code != 'ER_DUP_ENTRY') {
                    bot.sendMessage(msg.chat.id, "Errore: Bot Inattivo.\nRiprovare più tardi");
                    throw err
                }
            }
            bot.sendMessage(msg.chat.id, "Utente registrato");
        });
        DisconnectDB(conn)
    }
});

bot.onText(/\/newgame/, (msg) => {
    if (msg.chat.type == 'group') {
        var conn = ConnectDB()
        conn.query("SELECT IDPartita FROM Partite WHERE FKGruppo=? AND (Status=1 OR Status=0)", Math.abs(msg.chat.id), (err, res) => {
            if (res.length) {
                bot.sendMessage(msg.chat.id, "Una partita è già in corso");
            } else {
                bot.sendMessage(msg.chat.id, "Scegli la categoria", {
                    reply_markup: {
                        inline_keyboard: [categorie]
                    }
                });
            }
            DisconnectDB(conn)
        })
    } else {
        bot.sendMessage(msg.chat.id, "Comando disponibile solo per i gruppi");
    }
});

bot.onText(/\/partecipo/, (msg) => {
    if (msg.chat.type == 'group') {
        var conn = ConnectDB()
        conn.query("SELECT IDPartita FROM partite WHERE FKGruppo=? AND Status=0", Math.abs(msg.chat.id), (err, result, field) => {
            if (err) {
                throw err
            }
            if (!result.length) {
                bot.sendMessage(msg.chat.id, "Azione non valida");
            } else {
                conn.query("INSERT INTO logpartite(FKUtente,FKPartita) VALUES (?,?)", [msg.from.id, result[0].IDPartita], (errs, results) => {
                    if (errs) {
                        if (errs.code == 'ER_DUP_ENTRY') {
                            bot.sendMessage(msg.chat.id, "[" + msg.from.first_name + "](tg://user?id=" + msg.from.id + ") partecipi già alla partita", {
                                parse_mode: 'Markdown'
                            });
                        } else if (errs.code == 'ER_NO_REFERENCED_ROW_2')
                            bot.sendMessage(msg.chat.id, "[" + msg.from.first_name + "](tg://user?id=" + msg.from.id + ") avvia il bot in privato premendo [\/start](tg://start)", {
                                parse_mode: 'Markdown'
                            });
                        else
                            throw errs;
                    } else {
                        RestartTimeOut(Math.abs(msg.chat.id))
                        bot.sendMessage(msg.chat.id, "[" + msg.from.first_name + "](tg://user?id=" + msg.from.id + ") Si è unito alla partita", {
                            parse_mode: 'Markdown'
                        });

                    }
                })
            }
            DisconnectDB(conn)
        })
    } else {
        bot.sendMessage(msg.chat.id, "Comando disponibile solo per i gruppi");
    }
});

bot.on("polling_error", (msg) => console.log(msg));

bot.on("callback_query", function(callbackQuery) {
    let element = callbackQuery.data;
    let number = element.split('_')[1].trim()

    while (number == 1) {
        element = categorie[Math.floor(Math.random() * categorie.length)].callback_data
        number = element.split('_')[1].trim();
    }

    let categoria = categorie.find(elem => elem.callback_data == element).text;
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
        RestartTimeOut(Math.abs(callbackQuery.message.chat.id));
    })
});

bot.onText(/\/termina/, (msg) => {
    if (msg.chat.type == 'group') {
        var conn = ConnectDB()
        conn.query("UPDATE Partite SET Status=2 WHERE FKGruppo=? AND Status=1", Math.abs(msg.chat.id), (err, res) => {
            if (err) {
                if (err.code != 'ER_DUP_ENTRY') {
                    bot.sendMessage(msg.chat.id, "Errore: Bot Inattivo.\nRiprovare più tardi");
                    throw err
                }
            }
            DisconnectDB(conn)
            bot.sendMessage(msg.chat.id, "Partita terminata, grazie per aver giocato con me");
        })
    } else {
        bot.sendMessage(msg.chat.id, "Comando disponibile solo per i gruppi");
    }
});