-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Creato il: Mag 01, 2021 alle 10:36
-- Versione del server: 8.0.13-4
-- Versione PHP: 7.2.24-0ubuntu0.18.04.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `VQu2KRKfj8`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `elementi`
--
-- Creazione: Apr 27, 2021 alle 21:04
--

CREATE TABLE `elementi` (
  `IDElemento` int(11) NOT NULL,
  `Valore` varchar(100) NOT NULL,
  `Link` varchar(255) DEFAULT NULL,
  `FKCategoria` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `elementi`
--

INSERT INTO `elementi` (`IDElemento`, `Valore`, `Link`, `FKCategoria`) VALUES
(1, 'Napoleone Bonaparte', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV02dZ9nXjpw0MsOGkHsgh1Dk7dVOXeUxg6A&usqp=CAU', 4),
(2, 'Maometto', 'https://www.papaboys.org/wp-content/uploads/2015/11/Maometto.jpg', 4),
(3, 'William Shakespeare', 'https://cdn.studenti.stbm.it/images/2016/11/04/william-shakespeare-orig.jpeg', 4),
(4, 'George Washington', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Gilbert_Stuart_-_George_Washington_-_Google_Art_Project_%286966745%29FXD.jpg/1200px-Gilbert_Stuart_-_George_Washington_-_Google_Art_Project_%286966745%29FXD.jpg', 4),
(5, 'Abraham Lincoln', 'https://www.occhionotizie.it/wp-content/uploads/2018/02/Abe-Lincoln_468377946-1_383827.jpg', 4),
(6, 'Adolf Hitler', 'https://www.unionesarda.it/foto/previewfotoprogressivejpeg/2021/02/04/adolf_hitler_archivio_l_unione_sard-906-560-985121.jpg', 4),
(7, 'Aristotele', 'https://cdn.studenti.stbm.it/images/2016/12/12/aristotele_300x200.jpeg', 4),
(8, 'Alessandro Magno', 'https://cdn.studenti.stbm.it/images/2016/07/12/busto-di-alessandro-magno-orig.jpeg', 4),
(9, 'Thomas Jefferson', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Official_Presidential_portrait_of_Thomas_Jefferson_%28by_Rembrandt_Peale%2C_1800%29.jpg/1200px-Official_Presidential_portrait_of_Thomas_Jefferson_%28by_Rembrandt_Peale%2C_1800%29.jpg', 4),
(10, 'Enrico VIII', 'https://media.paginemediche.it/benessere/storia-della-medicina/enrico-viii-sindrome-di-mcleod/enrico-ottavo-1200-900.jpg', 4),
(11, 'Charles Darwin', 'https://lh6.googleusercontent.com/proxy/89q1TP5EuEMZFdulr3f5gcGTPPt6tldz0DmMa9PXJo0_J6sv7BV_8NYdbhTH4P408b47NpDpFUM6s4O84Q08qTWfnNe58CeyVS5R3rDHbVSf-OPfg11n4sleKdYmbeSI=s0-d', 4),
(12, 'Elisabetta I d\'Inghilterra', 'https://www.lettore.org/wp-content/uploads/2019/04/00000393.jpg', 4),
(13, 'Giulio Cesare', 'https://iluoghidellasorgente.files.wordpress.com/2019/12/index.jpg?w=394&h=262', 4),
(14, 'Martin Lutero', 'https://upload.wikimedia.org/wikipedia/commons/9/90/Lucas_Cranach_d.%C3%84._-_Martin_Luther%2C_1528_%28Veste_Coburg%29.jpg', 4),
(15, 'Iosif Stalin', 'https://www.fattiperlastoria.it/wp-content/uploads/2020/10/Stalin_01-1200x750-1.jpg', 4),
(16, 'Albert Einstein', 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg', 4),
(17, 'Cristoforo Colombo', 'https://www.itagnol.com/wp-content/uploads/2020/06/cristoforo-colombo.jpg', 4),
(18, 'Isaac Newton', 'http://t0.gstatic.com/licensed-image?q=tbn:ANd9GcR1i8hpklFse8cN3hcOA-qQ-2Jf0F4jXmoPEWPC63JQHnv9OVnM6ahz2u3keOkF', 4),
(19, 'Carlo Magno', 'https://upload.wikimedia.org/wikipedia/commons/9/98/Louis-F%C3%A9lix_Amiel_-_Charlemagne_empereur_d%27Occident_%28742-814%29.jpg', 4),
(20, 'Wolfgang Amadeus Mozart', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/1200px-Wolfgang-amadeus-mozart_1.jpg', 4),
(21, 'Platone', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Plato_Silanion_Musei_Capitolini_MC1377.jpg/1200px-Plato_Silanion_Musei_Capitolini_MC1377.jpg', 4),
(22, 'Luigi XIV', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Louis_XIV_of_France.jpg/1200px-Louis_XIV_of_France.jpg', 4),
(23, 'Ludwig Van Beethoven', 'http://t0.gstatic.com/licensed-image?q=tbn:ANd9GcT0MANypa2s9Z2FrM8F7qhNx7wAtmntnbxGBxiLAaUQl8f33z0DnK1tRp1UCJ0r', 4),
(24, 'Leonardo da Vinci', 'http://t2.gstatic.com/licensed-image?q=tbn:ANd9GcTCS0e-ZTVqbESl8pRMUXb2Eda0FdJxPBOhpMLE_QFm0jcoHJbSLnnEqgqyShZg', 4),
(25, 'Carlo Linneo', 'http://t0.gstatic.com/licensed-image?q=tbn:ANd9GcRj5EV1Oj1PEKWfhjb8QqAIA_CbnT0ayaldBmVz9ftsxme4i_Cx_4RS-bAvIBxM', 4),
(26, 'Charles Dickens', 'https://www.teleclubitalia.it/wp-content/uploads/2019/12/Charles-Dickens.jpg', 4),
(27, 'Benjamin Franklin', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Franklin-Benjamin-LOC.jpg/1200px-Franklin-Benjamin-LOC.jpg', 4),
(28, 'George W. Bush', 'https://www.gelestatic.it/thimg/xZePf33AGkmh6GUA1SysUMi-gG8=/1280x605/https%3A//www.lastampa.it/image/contentid/policy%3A1.38924679%3A1591221620/e93deb67e2f87c20da87c21186f7e9c0.jpg%3Ff%3Dtaglio_full2%26h%3D605%26w%3D1280%26%24p%24f%24h%24w%3D8a1d676', 4),
(29, 'Winston Churchill', 'https://www.avvenire.it/c/2019/PublishingImages/04f07c5f2db24d8d8b40ce2ce7d65815/Winston-Churchill.jpg', 4),
(30, 'Carlo I d\'Inghilterra', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Charles_I_%281630s%29.jpg/1200px-Charles_I_%281630s%29.jpg', 4),
(31, 'Thomas Edison', 'https://i2.wp.com/www.linkiesta.it/wp-content/uploads/2020/02/02ec69f0-71f4-4cd0-a0e5-d556b86951cf_large.jpg?fit=1200%2C934&ssl=1', 4),
(32, 'Giacomo I d\'Inghilterra', 'https://londonita.com/wp-content/uploads/2020/01/Carlo_I_Stuart.jpg', 4),
(33, 'Friedrich Nietzsche', 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Nietzsche187c.jpg', 4),
(34, 'Sigmund Freud', 'https://www.stateofmind.it/wp-content/uploads/2017/10/Sigmund-Freud-il-fondatore-della-psicoanalisi-Introduzione-alla-Psicologia-3.jpg', 4),
(35, 'Mohandas Karamchand Gandhi', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Mohandas_K._Gandhi%2C_portrait.jpg/441px-Mohandas_K._Gandhi%2C_portrait.jpg', 4),
(36, 'Woodrow Wilson', 'https://www.storiamo.it/wp-content/uploads/2021/01/Woodrow_Wilson_28_presidente_usa.jpg', 4),
(37, 'Johann Sebastian Bach', 'https://images.wired.it/wp-content/uploads/2019/03/21094545/1553154345_Johann_Sebastian_Bach.jpg', 4),
(38, 'Galileo Galilei', 'https://www.leomagazineofficial.it/wp-content/uploads/2021/01/GalileoGalilei-1152x675.jpg', 4),
(39, 'Tigre', 'https://www.pitturiamo.com/it/immagine/quadro-moderno/la-tigre-212418.jpg', 2),
(40, 'Elefante', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Afrikanischer_Elefant%2C_Miami.jpg/1200px-Afrikanischer_Elefant%2C_Miami.jpg', 2),
(41, 'Cane', 'https://www.cdt.ch/binrepository/960x640/0c0/0d0/none/798450/JKSL/shutterstock-379727605_1389022_20200324143150.jpg', 2),
(42, 'Serpente', 'https://images.everyeye.it/img-notizie/il-veleno-serpenti-evoluto-uccidere-non-autodifesa-v4-436365.jpg', 2),
(43, 'Uccello', 'https://www.focus.it/site_stored/imgs/0006/013/uccelli-vedere.1020x680.jpg', 2),
(44, 'Ragno', 'https://static.fanpage.it/wp-content/uploads/sites/5/2019/12/ragnoviolinocover-1200x1200.jpg', 2),
(45, 'Ape', 'https://www.ediltecnico.it/wp-content/uploads/2017/11/Ape2-1280x720.jpg', 2),
(46, 'Leone', 'https://safariavventura.com/wp-content/uploads/2018/02/Leone-africano-1200x480.jpg', 2),
(47, 'Corvo', 'https://ilbolive.unipd.it/sites/default/files/2020-09/corvo1.jpg', 2),
(48, 'Topo', 'https://www.triesteallnews.it/wp-content/images/2018/08/topi-di-citt%C3%A0.jpeg', 2),
(49, 'Cavallo', 'https://www.amoreaquattrozampe.it/wp-content/uploads/2020/10/cavallo-impenna-1280x720.jpg', 2),
(50, 'Gatto', 'https://www.larcadinoepetshop.it/wp-content/uploads/2019/03/articolo-gatto.jpg', 2),
(51, 'Asino', 'https://www.letteraemme.it/wp-content/uploads/2020/01/asino-lipari.jpg', 2),
(52, 'Volpe', 'https://www.calanchidiatri.it/wp-content/uploads/2019/02/la-volpe.jpg', 2),
(53, 'Pappagallo', 'https://www.ipersoap.com/wp-content/uploads/2020/07/pappagallo_cover.png', 2),
(54, 'Bue', 'https://www.ilcuocoincamicia.com/wp-content/uploads/2017/12/Bue-Grasso-1170x780.jpg', 2),
(55, 'Cammello', 'https://images.everyeye.it/img-notizie/cosa-c-e-davvero-all-interno-gobbe-cammelli-v3-477562-1280x720.jpg', 2),
(56, 'Scoiattolo', 'https://www.buongiornonatura.it/wp-content/uploads/2019/11/Scoiattolo-grigio-foto-Ambrogio-Molinari-scaled.jpg', 2),
(57, 'Coniglio', 'https://www.zoo-service.it/wp-content/uploads/2019/05/coniglio-nano.jpg', 2),
(58, 'Pesce', 'https://www.starbene.it/content/uploads/2019/03/pesci.jpg', 2),
(59, 'Delfino', 'https://static.ohga.it/wp-content/uploads/sites/24/2020/05/delfino.jpg', 2),
(60, 'Squalo', 'https://www.repstatic.it/content/nazionale/img/2019/02/25/174542878-c7f2af5c-5a55-44a8-bc54-a7d39e1fb6a1.jpg', 2),
(61, 'Grillo', 'https://www.pronatura.ch/sites/pronatura.ch/files/styles/hero_huge/public/2017-11/tdj2014_feldgrille_1920x960_cr_fabian_biasio.jpg?itok=5_SJl7on', 2),
(62, 'Coccodrillo', 'https://www.luomoconlavaligia.it/wp-content/uploads/2013/05/maren-pauly-1196343-unsplash.jpg', 2),
(63, 'Leopardo', 'https://www.focusjunior.it/content/uploads/site_stored/imgs/0002/004/leopardo_04-1280x720.jpg', 2),
(64, 'Zebra', 'https://upload.wikimedia.org/wikipedia/commons/9/96/Common_zebra_1.jpg', 2),
(65, 'Giraffa', 'https://www.ergosum.org/wp-content/uploads/2020/01/AdobeStock_108737489-2-scaled-2560x1280.jpeg', 2),
(66, 'Scimmia', 'https://media.wsimag.com/attachments/369144ed9353eb6e6e211d0d779364413382b3f8/store/fill/1090/613/a10d4610745a1ed7ab0d925e1d9f682ab7e6486c96f7493b7e978bdf9568/Linfanticidio-nelle-scimmie-non-e-una-rarita.jpg', 2),
(67, 'Farfalla', 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Blue_Morpho.jpg', 2),
(68, 'Aragosta', 'https://www.marblu.it/wp-content/uploads/2019/05/Aragosta_Lobster.jpg', 2),
(69, 'Gallina', 'https://www.ilverdemondo.it/public/blog/thumbs/quanto-vive-una-gallina-it-000.jpg', 2),
(70, 'Balena', 'https://www.focus.it/site_stored/imgs/0003/020/cor_42-20461279.1020x680.jpg', 2),
(71, 'Colomba', 'https://www.myriamartesacrastore.it/blog/wp-content/uploads/2019/09/Il-significato-simbolico-della-colomba.jpg', 2),
(72, 'Mosca', 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Common_housefly_01.jpg', 2),
(73, 'Pecora', 'https://www.passione-animali.it/p4-data/uploads/2016/10/allevare-le-pecore.jpg', 2),
(74, 'Mucca', 'https://static.fanpage.it/wp-content/uploads/sites/4/2020/05/mucca-1200x900.jpg', 2),
(75, 'Tartaruga', 'https://marevivo.it/wp-content/uploads/2020/03/turtle_tale_rr_jr_june_july_2017.jpg', 2),
(76, 'Lumaca', 'https://www.beautyoflake.ch/wp-content/uploads/2019/01/I-BENEFICI-DELLA-CREMA-A-BASE-DI-BAVA-DI-LUMACA-uai-1280x1280.jpg', 2),
(77, 'Zanzara', 'https://www.ufficiostampa.provincia.tn.it/var/002/storage/images/media/immagini-comunicati-stampa/primo-piano-koreicus-br-image/2946062-1-ita-IT/primo-piano-koreicus-br_imagefullwide.jpg', 2),
(78, 'Capra', 'https://inchiestasicilia.com/wp-content/uploads/2020/05/girgentana-goat-2351716__340-1280x720.jpg', 2),
(79, 'Istanbul', 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Istanbul2010.jpg', 3),
(80, 'Bergen', 'http://res.cloudinary.com/simpleview/image/upload/v1574085889/clients/norway/bryggen_wharf_bergen_hordaland_fjord_norway_photo_florian_olbrechts_34ad36ea-f7bc-4150-b48b-af2c2c14628f.jpg', 3),
(81, 'Il Cairo', 'https://static2-viaggi.corriereobjects.it/wp-content/uploads/2015/06/ilcairo-1080x720.jpg?v=355141', 3),
(82, 'Atene', 'https://cdn.shopify.com/s/files/1/0015/0028/2982/t/20/assets/25c3db490046--Atene-Grecia.jpg?v=1575999618', 3),
(83, 'New Orleans', 'https://siviaggia.it/wp-content/uploads/sites/2/2016/05/new-orleans-bourbon-street-t.jpg', 3),
(84, 'Kyoto', 'https://staticr1.blastingcdn.com/media/photogallery/2019/11/23/660x290/b_1200x680/kyoto-antica-capitale-del-giappone-prima-di-tokyo_2359256.jpg', 3),
(85, 'Vienna', 'https://siviaggia.it/wp-content/uploads/sites/2/2020/03/vienna-canzoni.jpg', 3),
(86, 'Siena', 'https://www.unisi.it/sites/default/files/styles/hp_slider/public/Application_2021_2021_siena.jpg?itok=PB_0YC0u', 3),
(87, 'Rio de Janeiro', 'https://www.costacrociere.it/content/dam/costa/inventory-assets/ports/RIO/c035_rio_de_janeiro.jpg', 3),
(88, 'Sydney', 'https://www.australia.com/content/dam/assets/photograph/digital/l/h/4/q/1001978.jpg', 3),
(89, 'Venezia', 'https://www.myveniceapartment.com/wp-content/uploads/2019/01/canale-venezia-my-venice-apartment.jpg', 3),
(90, 'Tirana', 'http://www.turismo.al/wp-content/uploads/2017/08/Tirana.jpg', 3),
(91, 'Amsterdam', 'https://images.musement.com/cover/0002/15/amsterdam_header-114429.jpeg', 3),
(92, 'San Francisco', 'https://cdn.turkishairlines.com/m/7d36f19018fa3e3d/original/Travel-Guide-of-San-Francisco-via-Turkish-Airlines.jpg', 3),
(93, 'Firenze', 'https://images.lonelyplanetitalia.it/uploads/firenze?q=80&p=slider&s=5ea359c02d3477ff82b9bed88a04a7ac', 3),
(94, 'Roma', 'https://lh3.googleusercontent.com/proxy/ICqBEGOifky5IIKymmfU5gv9_Uv22knQHyE8NzEUvT3bMV6lYREYnPNAyZHxIZkQ5X95nF-dOti1TxQ-jGQxZ6eh15JZeVdeuYtqrPmwT4w3sYGHVG2mgEf-ND2ssscuL6az1TgkSg', 3),
(95, 'Barcellona', 'https://www.artribune.com/wp-content/uploads/2020/12/Night-view-of-Barcelona.-%C2%A9-Laura-Guerrero.jpg', 3),
(96, 'Londra', 'https://www.vivalingue.com/wp-content/uploads/2019/08/STUDIARE-A-LONDRA-1900x1080.jpg', 3),
(97, 'New York City', 'https://images.lonelyplanetitalia.it/static/places/new-york-city-319.jpg?q=80&s=8e869330edc4469524e3483836896448', 3),
(98, 'Parigi', 'https://vivi.imgix.net/images/vivilondra/categorie/Parigi.jpg?auto=enhance%2Cformat%2Credeye%2Ccompress&crop=entropy&fit=crop&h=1700&ixlib=php-1.2.1&q=90&w=2560&s=5efe597a954f18378ec3c5fb2616d9c2', 3);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `elementi`
--
ALTER TABLE `elementi`
  ADD PRIMARY KEY (`IDElemento`),
  ADD KEY `FKCategoria` (`FKCategoria`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `elementi`
--
ALTER TABLE `elementi`
  MODIFY `IDElemento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `elementi`
--
ALTER TABLE `elementi`
  ADD CONSTRAINT `elementi_ibfk_1` FOREIGN KEY (`FKCategoria`) REFERENCES `categorie` (`idcategoria`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
