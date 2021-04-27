const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql');
const express = require('express');
const app = express()
const ejs = require('ejs');
const session = require('express-session')
const bcrypt = require('bcrypt');
const generator = require('generate-password');
const salt_num = 10;


const TOKEN = process.env.TOKEN || ""
const DB_HOST = process.env.DB_HOST || ""
const DB_USER = process.env.DB_USER || ""
const DB_PASSWORD = process.env.DB_PASSWORD || ""
const DB_DATABASE = process.env.DB_DATABASE || ""
const PORT = process.env.PORT || 9090

const bot = new TelegramBot(TOKEN, {
    polling: true
});


var categorie = []
FillCategorie()

var countdownUser = {}

var partiteInCorso = {}

function ConnectDB() {
    const config = {
        host: DB_HOST,
        database: DB_DATABASE,
        user: DB_USER,
        password: DB_PASSWORD,
        multipleStatements: true,
        dateStrings: true
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
    conn.query("SELECT CONCAT(\"cat_\",IDCategoria) AS callback_data, Alias AS text FROM `categorie`", (err, res) => {
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
        conn.query("UPDATE `partite` SET Status=1 WHERE FKGruppo=? AND Status=0", id, (err, res) => {
            VerificaPartita(id).then((value) => {
                if (!value[3])
                    bot.sendMessage("-" + id, "Partita avviata");
                else
                    bot.sendMessage("-" + id, "Partita avviata.\nATTENZIONE: Possibili duplicati");
                DisconnectDB(conn);
                GeneraRuoli(id, value[1], value[0], value[2]);
            }).catch(() => {
                conn.query("DELETE FROM partite WHERE FKGruppo=? AND Status=1 ORDER BY `IDPartita` DESC LIMIT 1", id);
                bot.sendMessage("-" + id, "Partita non avviata");
            });
        })
    }, 15000);
    countdownUser[id] = callback;
}

function VerificaPartita(id) {
    return new Promise((resolve, reject) => {
        var conn = ConnectDB()
        conn.query("SELECT COUNT(LP.`FKUtente`) AS num, LP.`FKPartita`, P.`FKCategoria` FROM `logpartite` AS LP INNER JOIN `partite` AS P ON LP.`FKPartita`=P.`IDPartita` WHERE P.`Status`= 1 AND P.`FKGruppo`= ? GROUP BY LP.`FKPartita`", id, (err, res) => {
            try {
                if (res[0].num < 3)
                    reject();
                else if (res[0].num < 20)
                    resolve([res[0].num, res[0].FKPartita, res[0].FKCategoria, false]); // 3<x<20
                else
                    resolve([res[0].num, res[0].FKPartita, res[0].FKCategoria, true]); // >=21
                DisconnectDB(conn)
            } catch (e) {
                reject();
            }
        })
    })
}

function GeneraRuoli(IDMessaggio, IDPartita, NumGiocatori, FKCategoria) {
    new Promise((resolve, reject) => {
        var conn = ConnectDB()
        elementi = conn.query("SELECT `IDElemento` FROM `elementi` WHERE `FKCategoria`=? ORDER BY RAND() LIMIT ?", [FKCategoria, NumGiocatori], (err, res) => {
            if (err) {
                reject();
            }
            utenti = conn.query("SELECT L.`FKUtente`, U.`Username` FROM `logpartite` AS L INNER JOIN `utenti` AS U ON L.`FKUtente`=U.`IDUtente` WHERE `FKPartita`= ? ", [IDPartita], (errs, ress) => {
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
                        MandaMessaggi(IDMessaggio, IDPartita, value[1]);
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
                        MandaMessaggi(IDMessaggio, IDPartita, value[1]);
                })
                DisconnectDB(conn)
            }
        }
    }).catch(() => {
        bot.sendMessage(IDMessaggio, "Errore: Bot Inattivo.\nRiprovare più tardi");
    })
}

async function MandaMessaggi(IDMessaggio, IDPartita, players) {
    players.forEach(x => {
        var conn = ConnectDB()
        conn.query("SELECT E.`Valore`, LP.`FKUtente`, (SELECT `Username` FROM `utenti` WHERE `IDUtente`=LP.`FKUtente`) AS Username FROM `logpartite` AS LP INNER JOIN `elementi` AS E ON LP.`FKElemento`=E.`IDElemento` WHERE `FKUtente` <> ? AND `FKPartita`=?", [x.FKUtente, IDPartita], (err, res) => {
            if (err) {
                bot.sendMessage(x.FKUtente, "Errore: Bot Inattivo.\nRiprovare più tardi");
                throw err;
            }
            res.forEach(y => {
                bot.sendMessage(x.FKUtente, "[" + y.Username + "](tg://user?id=" + y.FKUtente + ") è " + y.Valore, {
                    parse_mode: 'Markdown'
                });
            })
        })
        DisconnectDB(conn)
    })
    GestisciPartiteInCorso(IDMessaggio, IDPartita, players)
}

async function GestisciPartiteInCorso(IDMessaggio, IDPartita, player) {
    if (partiteInCorso[IDMessaggio] != undefined) {
        clearTimeout(partiteInCorso[IDMessaggio].callback);
    } else {
        partiteInCorso[IDMessaggio] = {
            fase: 0,
            turno: 0,
            time: 0,
            result: undefined
        };

        if (player != undefined) {
            partiteInCorso[IDMessaggio].players = player;
        }
        if (IDPartita != undefined) {
            partiteInCorso[IDMessaggio].idpartita = IDPartita;
        }
    }

    if (partiteInCorso[IDMessaggio].fase == 0) {
        bot.sendMessage("-" + IDMessaggio, "Tocca a [" + partiteInCorso[IDMessaggio].players[partiteInCorso[IDMessaggio].turno].Username + "](tg://user?id=" + partiteInCorso[IDMessaggio].players[partiteInCorso[IDMessaggio].turno].FKUtente + ").\nHai 45 secondi per fare tutte le domande.", {
            parse_mode: 'Markdown'
        });
        partiteInCorso[IDMessaggio].time = 45000
    } else {
        partiteInCorso[IDMessaggio].time = 10000
    }

    partiteInCorso[IDMessaggio].callback = setTimeout(() => {
        if (partiteInCorso[IDMessaggio].fase == 0) {
            bot.sendMessage("-" + IDMessaggio, "Il tempo delle domande è finito, [" + partiteInCorso[IDMessaggio].players[partiteInCorso[IDMessaggio].turno].Username + "](tg://user?id=" + partiteInCorso[IDMessaggio].players[partiteInCorso[IDMessaggio].turno].FKUtente + ") scrivi la tua risposta.\n(*Unico Formato Accettato*: [\/result](tg://result) _risposta_)", {
                parse_mode: 'Markdown'
            });
            partiteInCorso[IDMessaggio].fase++;
            GestisciPartiteInCorso(IDMessaggio, undefined, undefined)
        } else {
            var conn = ConnectDB()
            try {
                conn.query("SELECT E.`Valore`,E.`Link` FROM `logpartite` AS LP INNER JOIN `elementi` AS E ON LP.`FKElemento`=E.`IDElemento` WHERE `FKUtente`= ? AND`FKPartita`=?", [partiteInCorso[IDMessaggio].players[partiteInCorso[IDMessaggio].turno].FKUtente, partiteInCorso[IDMessaggio].idpartita], (err, res) => {
                    if (err)
                        throw err;

                    if (partiteInCorso[IDMessaggio].result == undefined) {
                        bot.sendMessage("-" + IDMessaggio, "Risposta non data");
                    } else {
                        if (res[0].Valore.toUpperCase() == partiteInCorso[IDMessaggio].result.toUpperCase()) {
                            let FKUtente = partiteInCorso[IDMessaggio].players[partiteInCorso[IDMessaggio].turno].FKUtente
                            partiteInCorso[IDMessaggio].players.splice(partiteInCorso[IDMessaggio].turno, 1);
                            conn.query("UPDATE `logpartite` SET `Classificato`=(SELECT MAX(tab.`Classificato`)+1 FROM (SELECT * FROM `logpartite`) AS tab WHERE tab.`FKPartita`=`FKPartita`) WHERE `FKUtente`= ? AND `FKPartita`= ?", [FKUtente, partiteInCorso[IDMessaggio].idpartita], (errs, ress) => {
                                if (errs)
                                    throw errs;
                                bot.sendPhoto("-" + IDMessaggio, res[0].Link, {
                                    caption: "Hai indovinato"
                                })
                            })
                        } else {
                            bot.sendMessage("-" + IDMessaggio, "Ritenta nel prossimo turno, sarai più fortunato");
                        }
                    }

                    partiteInCorso[IDMessaggio].fase = 0;
                    if (partiteInCorso[IDMessaggio].turno < partiteInCorso[IDMessaggio].players.length - 1) {
                        partiteInCorso[IDMessaggio].turno++;
                    } else {
                        partiteInCorso[IDMessaggio].turno = 0;
                    }
                    if (partiteInCorso[IDMessaggio].players.length > 1) {
                        GestisciPartiteInCorso(IDMessaggio, undefined, undefined)
                    } else {
                        clearTimeout(partiteInCorso[IDMessaggio])
                        conn.query("UPDATE `logpartite` SET `Classificato`=(SELECT MAX(tab.`Classificato`)+1 FROM (SELECT * FROM `logpartite`) AS tab WHERE tab.`FKPartita`=`FKPartita`) WHERE `FKUtente`= ? AND `FKPartita`= ?; UPDATE `partite` SET Status=2 WHERE FKGruppo=? AND Status=1", [partiteInCorso[IDMessaggio].players[partiteInCorso[IDMessaggio].turno].FKUtente, partiteInCorso[IDMessaggio].idpartita, IDMessaggio], (err, res) => {
                            if (err) {
                                if (err.code != 'ER_DUP_ENTRY') {
                                    bot.sendMessage("-" + IDMessaggio, "Errore: Bot Inattivo.\nRiprovare più tardi");
                                    throw err
                                }
                            }
                            DisconnectDB(conn)
                            bot.sendMessage("-" + IDMessaggio, "Partita terminata.");
                        })
                    }
                })
            } catch (error) {
                console.log(error);
            }
        }
    }, partiteInCorso[IDMessaggio].time);
}

bot.onText(/\/start/, (msg) => {
    if (msg.chat.type == 'group') {
        var conn = ConnectDB()
        conn.query("INSERT INTO `utenti`(Ruolo,IDUtente) VALUES (?,1,?)", [msg.chat.title, Math.abs(msg.chat.id)], (err, result) => {
            if (err) {
                if (err.code != 'ER_DUP_ENTRY') {
                    bot.sendMessage(msg.chat.id, "Errore: Bot Inattivo.\nRiprovare più tardi");
                    throw err
                }
            }
            bot.sendMessage(msg.chat.id, "Grazie per avermi inserito in questo gruppo [" + msg.from.first_name + "](tg://user?id=" + msg.from.id + ")", {
                parse_mode: 'Markdown'
            });
        });
        DisconnectDB(conn)
    } else {
        var conn = ConnectDB()
        conn.query("INSERT INTO `utenti`(Username, Ruolo, IDUtente) VALUES (?,0,?)", [msg.chat.first_name, Math.abs(msg.chat.id)], (err, result) => {
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
        conn.query("SELECT IDPartita FROM `partite` WHERE FKGruppo=? AND (Status=0 OR Status=1)", Math.abs(msg.chat.id), (err, res) => {
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
        conn.query("SELECT IDPartita FROM `partite` WHERE FKGruppo=? AND Status=0", Math.abs(msg.chat.id), (err, result, field) => {
            if (err) {
                throw err
            }
            if (!result.length) {
                bot.sendMessage(msg.chat.id, "Azione non valida");
            } else {
                conn.query("INSERT INTO `logpartite`(FKUtente,FKPartita) VALUES (?,?)", [msg.from.id, result[0].IDPartita], (errs, results) => {
                    if (errs) {
                        if (errs.code == 'ER_DUP_ENTRY') {
                            bot.sendMessage(msg.chat.id, "[" + msg.from.first_name + "](tg://user?id=" + msg.from.id + ") partecipi già alla partita", {
                                parse_mode: 'Markdown'
                            });
                        } else if (errs.code == 'ER_NO_REFERENCED_ROW_2')
                            bot.sendMessage(msg.chat.id, "[" + msg.from.first_name + "](tg://user?id=" + msg.from.id + ") avvia il bot in privato premendo [\/start](t.me/NM_ChiSono_Bot)", {
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
    conn.query("INSERT INTO `partite`(FKCategoria,FKGruppo) VALUES (?,?)", [parseInt(number), Math.abs(parseInt(callbackQuery.message.chat.id))], (err, results) => {
        if (err) {
            bot.editMessageText("Errore: Bot Inattivo.\nRiprovare più tardi", {
                chat_id: callbackQuery.message.chat.id,
                message_id: callbackQuery.message.message_id
            });
            console.error("Errore nel database: ")
            throw err;
        }
        bot.editMessageText("Partita avviata con successo.\nCategoria scelta: *" + categoria + "*.\nPer partecipare digitare \/partecipo", {
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
        conn.query("UPDATE `partite` SET Status=2 WHERE FKGruppo=? AND (Status=1 OR Status=0)", Math.abs(msg.chat.id), (err, res) => {
            if (err) {
                if (err.code != 'ER_DUP_ENTRY') {
                    bot.sendMessage(msg.chat.id, "Errore: Bot Inattivo.\nRiprovare più tardi");
                    throw err
                }
            }
            if (partiteInCorso[Math.abs(msg.chat.id)] != undefined) {
                clearTimeout(partiteInCorso[Math.abs(msg.chat.id)].callback);
                partiteInCorso[Math.abs(msg.chat.id)] = undefined
            }
            if (countdownUser[Math.abs(msg.chat.id)] != undefined) {
                clearTimeout(countdownUser[Math.abs(msg.chat.id)])
                countdownUser[Math.abs(msg.chat.id)] = undefined
            }
            DisconnectDB(conn)
            bot.sendMessage(msg.chat.id, "Partita annullata");
        })
    } else {
        bot.sendMessage(msg.chat.id, "Comando disponibile solo per i gruppi");
    }
});

bot.onText(/\/result (.+)/, (msg, match) => {
    if (msg.chat.type == 'group') {
        if ((partiteInCorso[Math.abs(msg.chat.id)] != undefined) && (partiteInCorso[Math.abs(msg.chat.id)].players[partiteInCorso[Math.abs(msg.chat.id)].turno].FKUtente == msg.from.id) && (partiteInCorso[Math.abs(msg.chat.id)].fase == 1)) {
            bot.sendMessage(msg.chat.id, "Vediamo se hai indovinato (La tua risposta è: " + match[1] + ")");
            partiteInCorso[Math.abs(msg.chat.id)].result = match[1];
        } else
            bot.sendMessage(msg.chat.id, "Azione non valida");
    } else {
        bot.sendMessage(msg.chat.id, "Comando disponibile solo per i gruppi");
    }
});


bot.onText(/\/generapassword/, (msg) => {
    let from = ""
    if (msg.chat.type == 'private') {
        from = msg.chat.username;
    } else {
        from = msg.chat.title;
    }

    var password = generator.generate({
        length: 10,
        numbers: true
    })

    let salt = bcrypt.genSaltSync(salt_num);
    let hash = bcrypt.hashSync(password, salt);
    var conn = ConnectDB()
    conn.query("UPDATE `utenti` SET `Password`=?,`Username`=? WHERE `IDUtente`=?", [hash, from, Math.abs(msg.chat.id)], function(error, result) {
        if (error) {
            console.log(error);
            bot.sendMessage(msg.chat.id, "Riprova più tardi");
        }
        bot.sendMessage(msg.chat.id, "Inviata");
        bot.sendMessage(msg.from.id, "Password generata con successo.\nUsername: " + from + "\nPassword: " + password);
    });
    DisconnectDB(conn)

});

bot.onText(/\/setpassword (.+)/, (msg, match) => {
    if (msg.chat.type == 'group') {
        bot.sendMessage(msg.chat.id, "Comando non disponibile per i gruppi");
    } else {
        let salt = bcrypt.genSaltSync(salt_num);
        let hash = bcrypt.hashSync(match[1], salt);
        var conn = ConnectDB()
        conn.query("UPDATE `utenti` SET `Password`=?,`Username`=? WHERE `IDUtente`=?", [hash, msg.chat.username, Math.abs(msg.chat.id)], function(error, result) {
            if (error) {
                console.log(error);
                bot.sendMessage(msg.chat.id, "Riprova più tardi");
            }
            bot.sendMessage(msg.chat.id, "Password configurata.");
        });
        DisconnectDB(conn)
    }
});

/*
 *  WebSite express
 */

app.use(express.urlencoded({
    extended: true,
})).use(session({
    secret: '0luuFR501RY4PPr',
    name: 'uniqueSessionID',
    resave: false,
    saveUninitialized: false,
}));


app.use('/static', express.static('static'));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        if (req.session.type.data == 0) {
            var conn = ConnectDB()
            conn.query("SELECT LP.`FKPartita`, LP.`Classificato`, E.`Valore`, E.`Link`, C.Alias, C.IDCategoria FROM `logpartite` AS LP INNER JOIN `elementi` AS E ON LP.FKElemento=E.IDElemento INNER JOIN `categorie` AS C ON E.FKCategoria=C.IDCategoria WHERE `FKUtente`=?", [req.session.IDUser], (err, result) => {
                if (err) {
                    res.render("login", {
                        title: "Login",
                        message: false,
                        type: false
                    });
                }
                res.render("dashboard", {
                    title: "Dashboard delle partite di " + req.session.username,
                    head: ["ID Partita", "Immagine", "Elemento", " Categoria", "Classificato"],
                    body: result,
                    url: 'home'
                });
            });
            DisconnectDB(conn)
        } else {
            var conn = ConnectDB()
            conn.query("SELECT P.`IDPartita`, P.`FKCategoria`, C.`Alias`, P.`DataCreazione`, (SELECT COUNT(*) FROM `logpartite` WHERE FKPartita=IDPartita) AS Giocatori FROM `partite` AS P INNER JOIN `categorie` AS C ON P.FKCategoria=C.IDCategoria WHERE `FKGruppo`=?", [req.session.IDUser], (err, result) => {
                if (err) {
                    res.render("login", {
                        title: "Login",
                        message: false,
                        type: false
                    });
                }
                res.render("partite", {
                    title: "Dashboard delle partite di " + req.session.username,
                    head: ["ID Partita", "Categoria", "Data e Ora d'avvio", " Numero di giocatori"],
                    body: result,
                    url: 'home'
                });
            });
            DisconnectDB(conn)
        }
    } else {
        res.render("login", {
            title: "Login",
            message: false,
            type: false
        });
    }
})

app.get('/categorie', (req, res) => {
    if (req.session.loggedIn) {
        var conn = ConnectDB()
        conn.query("SELECT `IDCategoria`, `Alias`,(SELECT COUNT(`FKCategoria`) FROM `partite` WHERE `FKCategoria`=`IDCategoria` GROUP BY `FKCategoria`) AS Utilizzato FROM `categorie` ORDER BY `IDCategoria`", (err, result) => {
            if (err) {
                res.redirect("/")
            }
            res.render("categorie", {
                title: "Categorie disponibili",
                head: ["ID Categoria", "Categoria", "Utilizzato"],
                body: result,
                url: 'categorie'
            });
        });
        DisconnectDB(conn)
    } else {
        res.redirect("/")
    }
})

app.get('/partita/:tagId', (req, res) => {
    if (req.session.loggedIn) {
        var conn = ConnectDB()
        conn.query("SELECT U.Username AS FKPartita, LP.`Classificato`, E.`Valore`, E.`Link`, C.Alias, C.IDCategoria FROM `logpartite` AS LP INNER JOIN `elementi` AS E ON LP.FKElemento=E.IDElemento INNER JOIN `categorie` AS C ON E.FKCategoria=C.IDCategoria INNER JOIN `utenti` AS U ON LP.FKUtente=U.IDUtente WHERE `FKPartita`=?", [req.params.tagId], (err, result) => {
            if (err) {
                res.render("login", {
                    title: "Login",
                    message: false,
                    type: false
                });
            }
            res.render("dashboard", {
                title: "Dashboard delle partite di " + req.session.username,
                head: ["Nome Giocatore", "Immagine", "Elemento", " Categoria", "Classificato"],
                body: result,
                url: 'categorie'
            });
        });
        DisconnectDB(conn)
    } else {
        res.redirect("/")
    }
})

app.get('/elementi/:tagId', (req, res) => {
    if (req.session.loggedIn) {
        if (req.params.tagId == 1) {
            var conn = ConnectDB()
            conn.query("SELECT `IDElemento`, `Valore`, `Link`,(SELECT COUNT(`FKElemento`) FROM `logpartite` WHERE `FKElemento`=`IDElemento` GROUP BY `FKElemento`) AS Utilizzato FROM `elementi`", (err, result) => {
                if (err) {
                    res.redirect("/")
                }
                res.render("elementi", {
                    title: "Tutti gli elementi",
                    head: ["ID Elemento", "Immagine", "Descrizione", "Utilizzato"],
                    body: result,
                    url: 'categorie'
                });
                DisconnectDB(conn)
            });
        } else {
            var conn = ConnectDB()
            conn.query("SELECT `IDElemento`, `Valore`, `Link`,(SELECT COUNT(`FKElemento`) FROM `logpartite` WHERE `FKElemento`=`IDElemento` GROUP BY `FKElemento`) AS Utilizzato FROM `elementi` WHERE `FKCategoria`=?", [req.params.tagId], (err, result) => {
                if (err) {
                    res.redirect("/")
                }
                res.render("elementi", {
                    title: "Tutti gli elementi",
                    head: ["ID Elemento", "Immagine", "Descrizione", "Utilizzato"],
                    body: result,
                    url: 'categorie'
                });
                DisconnectDB(conn)
            });
        }
    } else {
        res.redirect("/")
    }
})

app.post('/', (req, res, next) => {
    var conn = ConnectDB()
    conn.query("SELECT `IDUtente`,`Password`, `Ruolo` FROM `utenti` WHERE `Username`=?", req.body.username, function(error, result) {
        if (error || result.length == 0) {
            res.render("login", {
                title: "Login",
                message: "Dati errati.",
                type: "alert-warning"
            });
        } else {
            let compare = bcrypt.compareSync(req.body.password, result[0].Password)
            if (compare) {
                res.locals.IDUser = result[0].IDUtente
                res.locals.username = req.body.username
                res.locals.type = result[0].Ruolo
                next()
            } else
                res.render("login", {
                    title: "Login",
                    message: "Dati errati.",
                    type: "alert-danger"
                });
        }
    });
    DisconnectDB(conn)
}, (req, res) => {
    req.session.loggedIn = true
    req.session.IDUser = res.locals.IDUser
    req.session.username = res.locals.username
    req.session.type = res.locals.type
    res.redirect("/")
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {})
    res.redirect("/")
})

app.listen(process.env.PORT, () => console.log("Connesso online"));