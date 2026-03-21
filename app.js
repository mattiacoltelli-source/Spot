window.APP_SPOTS = {
  region: "Madeira",
  center: [32.75, -16.95],
  zoom: 10,
  storageKeys: {
    favorites: "madeira_favorites_v5",
    planner: "madeira_day_planner_v5"
  },

  topWowNames: [
    "Ponta de São Lourenço",
    "Pico do Arieiro",
    "Pico Ruivo Summit",
    "Fanal Forest",
    "Ribeira da Janela",
    "Porto Moniz Pools",
    "Cabo Girão",
    "Levada do Caldeirão Verde",
    "Ponta do Pargo Lighthouse",
    "Eira do Serrado"
  ],

  topSunsetNames: [
    "Ponta do Pargo Lighthouse",
    "Câmara de Lobos",
    "Cabo Girão",
    "Ponta do Sol",
    "Calheta Beach",
    "Pico dos Barcelos",
    "Miradouro do Facho",
    "Jardim do Mar View",
    "Paul do Mar",
    "Porto Moniz Pools"
  ],

  spots: [
    {
      id: "core-0",
      name: "Ponta de São Lourenço",
      zone: "est",
      light: "alba",
      activity: "trekking",
      difficulty: "medio",
      level: "core",
      lat: 32.744,
      lon: -16.704,
      desc: "Il promontorio più scenografico dell'isola, perfetto per creste, mare e luce forte.",
      tip: "Parti molto presto: rende davvero all'alba.",
      longDescription: "È uno dei trekking simbolo di Madeira: paesaggio arido, tagli di costa fortissimi e una sensazione molto diversa dal resto dell’isola. È uno spot che funziona sia come esperienza completa sia come tappa wow anche solo parziale.",
      photoTips: "Bellissimo con luce laterale bassa, soprattutto nelle prime ore. Le linee della costa e i contrasti terra-mare rendono molto meglio prima che la luce diventi dura.",
      experience: {
        wow: 10,
        tipo: "trekking costiero iconico",
        tempo: "3-5h",
        mood: "epico e aperto"
      },
      whenToGo: {
        best: "alba",
        note: "Il meglio arriva con luce bassa e aria limpida. Se vuoi farlo bene, parti presto."
      },
      whenToAvoid: [
        "mezzogiorno pieno con luce dura",
        "vento forte in cresta",
        "giornate troppo compresse"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "medio",
        walk: "il percorso vero è a piedi e richiede tempo",
        strada: "comoda fino al parcheggio iniziale"
      },
      crowd: {
        best: "prestissimo",
        worst: "tarda mattina e centro giornata"
      },
      smartTips: [
        "Se non vuoi fare tutto il trekking, anche il primo tratto dà già molto.",
        "Tieni margine per il ritorno: il sole qui stanca più del previsto.",
        "Molto forte come prima grande tappa del lato est."
      ],
      image: "https://picsum.photos/seed/Ponta-de-Sao-Lourenco-Madeira/900/600"
    },
    {
      id: "core-1",
      name: "Pico do Arieiro",
      zone: "montagna",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.7354,
      lon: -16.9281,
      desc: "Il classico sopra le nuvole, uno dei punti più iconici di Madeira.",
      tip: "Meglio arrivare prima dell'alba: vento e freddo frequenti.",
      longDescription: "È uno degli spot simbolo assoluti dell’isola. Quando funziona bene, regala l’immagine Madeira più riconoscibile: creste, nuvole sotto quota e luce che entra sulle montagne.",
      photoTips: "Vai molto presto. Se trovi mare di nuvole, lavora su silhouette e livelli di profondità.",
      experience: {
        wow: 10,
        tipo: "viewpoint d'alta quota",
        tempo: "45m-2h",
        mood: "drammatico e iconico"
      },
      whenToGo: {
        best: "alba",
        note: "Perfetto con cielo pulito sopra e nuvole basse sotto. Il momento giusto è prima del primo sole."
      },
      whenToAvoid: [
        "vento molto forte",
        "nebbia chiusa senza visibilità",
        "orario tardi con folla"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "pochi minuti dalle aree principali",
        strada: "di montagna ma semplice"
      },
      crowd: {
        best: "prima dell'alba",
        worst: "dopo l'alba nelle giornate famose"
      },
      smartTips: [
        "Porta uno strato caldo anche se giù fa caldo.",
        "Controlla il cielo verso est e sotto quota: cambia tutto.",
        "Se è troppo chiuso, valuta un piano B più basso."
      ],
      image: "https://picsum.photos/seed/Pico-do-Arieiro-Madeira/900/600"
    },
    {
      id: "core-2",
      name: "Pico Ruivo Summit",
      zone: "montagna",
      light: "alba",
      activity: "trekking",
      difficulty: "impegnativo",
      level: "core",
      lat: 32.7591,
      lon: -16.9431,
      desc: "La cima più alta dell'isola, con vista ampissima se il cielo regge.",
      tip: "In giornate limpide è uno dei top assoluti.",
      longDescription: "È uno di quei punti che alzano il livello del viaggio. Se il meteo è dalla tua parte, la vista è enorme e molto appagante.",
      photoTips: "Preferisci alba o prime ore. Con aria limpida puoi cercare immagini molto pulite e profonde.",
      experience: {
        wow: 10,
        tipo: "cima principale di Madeira",
        tempo: "3-5h",
        mood: "grande e appagante"
      },
      whenToGo: {
        best: "alba",
        note: "Quando l’aria è pulita, qui fai davvero la differenza."
      },
      whenToAvoid: [
        "visibilità scarsa",
        "giornata già stanca",
        "meteo instabile in quota"
      ],
      access: {
        difficolta: "impegnativo",
        parcheggio: "medio",
        walk: "cammino vero, non spot mordi e fuggi",
        strada: "dipende dal punto di accesso scelto"
      },
      crowd: {
        best: "prestissimo",
        worst: "giornate super popolari"
      },
      smartTips: [
        "Non usarlo come tappa improvvisata: va costruito bene.",
        "Se vuoi più controllo, valuta l’accesso da Achada do Teixeira.",
        "Perfetto per il giorno forte del viaggio."
      ],
      image: "https://picsum.photos/seed/Pico-Ruivo-Madeira/900/600"
    },
    {
      id: "core-3",
      name: "Fanal Forest",
      zone: "ovest",
      light: "giorno",
      activity: "trekking",
      difficulty: "facile",
      level: "core",
      lat: 32.7603,
      lon: -17.1476,
      desc: "Foresta magica con alberi contorti e nebbia, unica per atmosfera.",
      tip: "Se trovi foschia o nuvole basse, qui giochi in casa.",
      longDescription: "È uno spot totalmente diverso dal resto di Madeira: meno panorama aperto e più atmosfera. Quando entra la nebbia, diventa uno dei luoghi più fotografici dell’isola.",
      photoTips: "Le giornate grigie qui sono un vantaggio. Cerca inquadrature semplici, con alberi isolati e profondità morbida.",
      experience: {
        wow: 9,
        tipo: "foresta atmosferica",
        tempo: "1-3h",
        mood: "mistico e sospeso"
      },
      whenToGo: {
        best: "giorno",
        note: "Rende meglio con nuvole basse, foschia o luce morbida."
      },
      whenToAvoid: [
        "sole molto duro",
        "fretta",
        "orario in cui cerchi solo panorami aperti"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "puoi usarlo anche in modo leggero",
        strada: "semplice ma a tratti umida"
      },
      crowd: {
        best: "mattina presto o meteo incerto",
        worst: "quando tutti vanno per la foto famosa"
      },
      smartTips: [
        "Se è chiuso e umido, non è un difetto: è proprio il suo valore.",
        "Funziona benissimo come cambio di atmosfera in una giornata piena.",
        "Non cercare il sole: cerca l’aria giusta."
      ],
      image: "https://picsum.photos/seed/Fanal-Forest-Madeira/900/600"
    },
    {
      id: "core-4",
      name: "Ribeira da Janela",
      zone: "nord",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.8652,
      lon: -17.1446,
      desc: "Formazioni rocciose in mare iconiche, molto fotogeniche.",
      tip: "Ottimo con onde e luce bassa.",
      longDescription: "È uno dei punti più forti per un’immagine marina molto riconoscibile. Semplice da leggere ma forte come impatto.",
      photoTips: "Le rocce in acqua rendono meglio con luce bassa, mare un po’ vivo e cielo con struttura.",
      experience: {
        wow: 9,
        tipo: "viewpoint costiero fotografico",
        tempo: "30m-1h",
        mood: "pulito e forte"
      },
      whenToGo: {
        best: "alba",
        note: "Il meglio arriva con luce bassa e un minimo di moto del mare."
      },
      whenToAvoid: [
        "luce piatta di centro giornata",
        "fretta e cielo vuoto",
        "nord completamente chiuso"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "molto breve",
        strada: "comoda"
      },
      crowd: {
        best: "presto",
        worst: "orario turistico centrale"
      },
      smartTips: [
        "Molto forte se combinato con Seixal o Porto Moniz.",
        "Se il cielo è interessante, qui sale di livello.",
        "È uno spot rapido ma serio."
      ],
      image: "https://picsum.photos/seed/Ribeira-da-Janela-Madeira/900/600"
    },
    {
      id: "core-5",
      name: "Porto Moniz Pools",
      zone: "nord",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.8664,
      lon: -17.1666,
      desc: "Piscine vulcaniche e oceano aperto, classico intramontabile.",
      tip: "Resta fino a luce bassa per il meglio.",
      longDescription: "È una tappa molto forte e molto facile da leggere: roccia vulcanica, acqua, orizzonte e atmosfera di fine giornata. Perfetta da inserire in un road day sul nord-ovest.",
      photoTips: "La parte più interessante spesso arriva a fine giornata, quando il contrasto si abbassa e le rocce prendono più carattere.",
      experience: {
        wow: 9,
        tipo: "piscine naturali vulcaniche",
        tempo: "45m-2h",
        mood: "marino e scenografico"
      },
      whenToGo: {
        best: "tramonto",
        note: "Molto più interessante a luce morbida che nel pieno del giorno."
      },
      whenToAvoid: [
        "mezzogiorno duro",
        "nord totalmente chiuso",
        "sosta troppo rapida"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "facile e breve",
        strada: "semplice"
      },
      crowd: {
        best: "fine giornata non troppo presto",
        worst: "fasce centrali affollate"
      },
      smartTips: [
        "Ottimo finale di un giro nord-ovest.",
        "Se il mare è vivo, l’atmosfera sale.",
        "Usalo più come scena finale che come stop da mezzogiorno."
      ],
      image: "https://picsum.photos/seed/Porto-Moniz-Madeira/900/600"
    },
    {
      id: "core-6",
      name: "Cabo Girão",
      zone: "sud",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.6558,
      lon: -17.0048,
      desc: "Grande falesia con panorama fortissimo sul sud.",
      tip: "Perfetto verso sera, meno bello a luce dura.",
      longDescription: "È uno spot immediato, molto forte e molto accessibile. Ideale se vuoi un grande panorama senza sforzo.",
      photoTips: "La luce migliore è più morbida, non pieno mezzogiorno. Con visibilità pulita rende tantissimo.",
      experience: {
        wow: 9,
        tipo: "falesia panoramica",
        tempo: "30m-1h",
        mood: "grande e facile"
      },
      whenToGo: {
        best: "tramonto",
        note: "Molto più bello quando la luce si abbassa e il sud prende profondità."
      },
      whenToAvoid: [
        "luce dura",
        "giornata velata sul sud",
        "aspettative da trekking"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "facile",
        walk: "brevissima",
        strada: "molto semplice"
      },
      crowd: {
        best: "tardo pomeriggio presto",
        worst: "fasce più turistiche"
      },
      smartTips: [
        "Ottimo se vuoi wow rapido senza fatica.",
        "Funziona bene dentro una giornata sud-ovest.",
        "Da usare quando vuoi massima resa e minima energia."
      ],
      image: "https://picsum.photos/seed/Cabo-Girao-Madeira/900/600"
    },
    {
      id: "core-7",
      name: "Levada do Caldeirão Verde",
      zone: "nord",
      light: "giorno",
      activity: "trekking",
      difficulty: "medio",
      level: "core",
      lat: 32.8072,
      lon: -16.905,
      desc: "Uno dei trekking più famosi di Madeira, verde e molto immersivo.",
      tip: "Porta una luce se affronti tunnel bui.",
      longDescription: "È una delle classiche esperienze Madeira: vegetazione intensa, percorso molto immersivo e un finale che ripaga bene.",
      photoTips: "Lavora sulle texture del verde e sulle prospettive del sentiero, non solo sul punto finale.",
      experience: {
        wow: 9,
        tipo: "levada classica immersiva",
        tempo: "3-4h",
        mood: "verde e coinvolgente"
      },
      whenToGo: {
        best: "giorno",
        note: "Rende bene con luce morbida e giornata senza fretta."
      },
      whenToAvoid: [
        "partenza tardi",
        "giorno troppo pieno",
        "se vuoi solo uno spot rapido"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "medio",
        walk: "trekking vero ma regolare",
        strada: "buona fino alla partenza"
      },
      crowd: {
        best: "mattina presto",
        worst: "orari popolari"
      },
      smartTips: [
        "Vai presto se vuoi viverlo meglio e con meno gente.",
        "Perfetto per il giorno verde di Madeira.",
        "Non concentrarti solo sulla cascata finale."
      ],
      image: "https://picsum.photos/seed/Caldeirao-Verde-Madeira/900/600"
    },
    {
      id: "core-8",
      name: "Ponta do Pargo Lighthouse",
      zone: "ovest",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.812,
      lon: -17.2623,
      desc: "Uno dei tramonti più seri e puliti di Madeira.",
      tip: "Se vuoi il tramonto forte, qui vai bene.",
      longDescription: "È una delle certezze del lato ovest. Minimal, pulito, molto leggibile e molto efficace.",
      photoTips: "Arriva in anticipo e resta fino agli ultimi minuti utili. Funziona bene anche con composizioni molto semplici.",
      experience: {
        wow: 9,
        tipo: "tramonto pulito sull'ovest",
        tempo: "45m-1h30",
        mood: "essenziale e forte"
      },
      whenToGo: {
        best: "tramonto",
        note: "È uno dei punti più affidabili per chiudere forte la giornata."
      },
      whenToAvoid: [
        "arrivo all'ultimo secondo",
        "giornata troppo compressa",
        "se cerchi un posto urbano"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "facile",
        walk: "brevissima",
        strada: "semplice"
      },
      crowd: {
        best: "arrivare con anticipo",
        worst: "ultimi minuti se tutti puntano lì"
      },
      smartTips: [
        "Se sei già a ovest, è quasi sempre una chiusura forte.",
        "Pochi elementi, ma molto efficaci.",
        "Resta anche dopo il sole basso."
      ],
      image: "https://picsum.photos/seed/Ponta-do-Pargo-Madeira/900/600"
    },
    {
      id: "core-9",
      name: "Eira do Serrado",
      zone: "montagna",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.704,
      lon: -16.9697,
      desc: "Belvedere forte sulla valle di Curral das Freiras.",
      tip: "Molto bene nel tardo pomeriggio.",
      longDescription: "Uno dei punti migliori per leggere l’interno di Madeira in modo semplice ma forte.",
      photoTips: "Tardo pomeriggio e luce radente funzionano molto bene sulla valle.",
      experience: {
        wow: 8,
        tipo: "viewpoint interno iconico",
        tempo: "30m-1h",
        mood: "profondo e montano"
      },
      whenToGo: {
        best: "tramonto",
        note: "La luce di fine giornata dà volume alla valle."
      },
      whenToAvoid: [
        "meteo completamente chiuso",
        "fretta estrema",
        "centro giornata piatto"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "molto breve",
        strada: "montana ma semplice"
      },
      crowd: {
        best: "tardo pomeriggio gestito bene",
        worst: "momenti più famosi"
      },
      smartTips: [
        "Ottimo se vuoi montagna senza trekking.",
        "Funziona bene insieme a Câmara de Lobos o Funchal.",
        "Molto più forte con luce laterale."
      ],
      image: "https://picsum.photos/seed/Eira-do-Serrado-Madeira/900/600"
    },
    {
      id: "core-10",
      name: "Câmara de Lobos",
      zone: "sud",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "core",
      lat: 32.6488,
      lon: -16.9777,
      desc: "Villaggio di pescatori molto scenografico e piacevole da vivere.",
      tip: "Perfetto per tramonto e cena leggera.",
      longDescription: "È un posto che unisce estetica, atmosfera e facilità. Funziona bene come tappa finale di giornata, con meno pressione e più gusto.",
      photoTips: "Cerca la luce calda sulle barche e sul paese. Anche le scene semplici qui possono funzionare molto bene.",
      experience: {
        wow: 8,
        tipo: "villaggio scenografico",
        tempo: "1-2h",
        mood: "autentico e piacevole"
      },
      whenToGo: {
        best: "tramonto",
        note: "Perfetto per chiudere con atmosfera e non solo con panorama."
      },
      whenToAvoid: [
        "passaggio troppo rapido",
        "orari centrali anonimi",
        "se cerchi montagna o trekking"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "semplice",
        strada: "comoda"
      },
      crowd: {
        best: "fine giornata",
        worst: "fasce più turistiche"
      },
      smartTips: [
        "Molto forte come finale morbido dopo spot più duri.",
        "Usalo più da vivere che da spuntare.",
        "Ottimo se vuoi anche mangiare bene in zona."
      ],
      image: "https://picsum.photos/seed/Camara-de-Lobos-Madeira/900/600"
    },
    {
      id: "core-11",
      name: "Seixal Beach",
      zone: "nord",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.8246,
      lon: -17.1082,
      desc: "Spiaggia nera con montagne verdi alle spalle, molto forte visivamente.",
      tip: "Molto bella al mattino presto.",
      longDescription: "Contrasto molto forte tra sabbia scura, mare e verde dietro. È una delle immagini più belle del lato nord.",
      photoTips: "Mattina presto o cielo drammatico. Le linee della spiaggia funzionano bene anche con composizioni larghe.",
      experience: {
        wow: 9,
        tipo: "spiaggia vulcanica scenica",
        tempo: "30m-1h30",
        mood: "potente e pulito"
      },
      whenToGo: {
        best: "alba",
        note: "Il meglio arriva presto, quando il contrasto è ancora elegante."
      },
      whenToAvoid: [
        "luce dura",
        "fretta",
        "spiaggia affollata"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "breve",
        strada: "semplice"
      },
      crowd: {
        best: "presto",
        worst: "orario comodo centrale"
      },
      smartTips: [
        "Ottima in combo con Ribeira da Janela.",
        "Funziona bene anche con meteo un po’ drammatico.",
        "Qui la semplicità visiva aiuta."
      ],
      image: "https://picsum.photos/seed/Seixal-Beach-Madeira/900/600"
    },
    {
      id: "core-12",
      name: "25 Fontes",
      zone: "ovest",
      light: "giorno",
      activity: "trekking",
      difficulty: "medio",
      level: "core",
      lat: 32.7524,
      lon: -17.1318,
      desc: "Trekking molto celebre, con cascata finale e tanta vegetazione.",
      tip: "Parti presto se vuoi evitare affollamento.",
      longDescription: "È una tappa classica, molto nota, ma resta valida se la gestisci bene con orari furbi.",
      photoTips: "Meglio presto. Se è affollato, punta di più sulle porzioni di percorso e sui dettagli naturali.",
      experience: {
        wow: 8,
        tipo: "levada famosa con cascata",
        tempo: "3-4h",
        mood: "verde e classico"
      },
      whenToGo: {
        best: "giorno",
        note: "Da fare con partenza furba, non tardi."
      },
      whenToAvoid: [
        "orario già pieno",
        "giornata troppo compressa",
        "se vuoi zero gente"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "medio",
        walk: "lunghezza discreta ma regolare",
        strada: "semplice fino alla zona di partenza"
      },
      crowd: {
        best: "prima possibile",
        worst: "tarda mattina"
      },
      smartTips: [
        "Molto meglio come partenza mattutina che come riempitivo.",
        "Non aspettarti isolamento: qui conta la gestione oraria.",
        "Buon classico, ma va preso con metodo."
      ],
      image: "https://picsum.photos/seed/25-Fontes-Madeira/900/600"
    },
    {
      id: "core-13",
      name: "Levada do Risco",
      zone: "ovest",
      light: "giorno",
      activity: "trekking",
      difficulty: "facile",
      level: "core",
      lat: 32.7528,
      lon: -17.1321,
      desc: "Percorso breve verso una cascata scenica, perfetto come mezza mattina.",
      tip: "Ottimo se vuoi qualcosa di bello senza tirarti troppo.",
      longDescription: "È uno di quei posti che entrano bene in una giornata piena senza mangiarsi troppe energie.",
      photoTips: "Buono con cielo morbido. Può funzionare bene anche con taglio più stretto sulla cascata.",
      experience: {
        wow: 8,
        tipo: "mini trekking con cascata",
        tempo: "1-2h",
        mood: "facile ma valido"
      },
      whenToGo: {
        best: "giorno",
        note: "Molto utile quando vuoi infilare qualcosa di bello senza stravolgere il piano."
      },
      whenToAvoid: [
        "orario troppo affollato",
        "quando vuoi un trek lungo",
        "pioggia molto forte"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "semplice",
        strada: "comoda"
      },
      crowd: {
        best: "presto",
        worst: "fasce centrali"
      },
      smartTips: [
        "Molto furbo in combo con 25 Fontes o area Rabaçal.",
        "Perfetto se hai energia media e vuoi resa alta.",
        "Da usare come pezzo intelligente, non come giornata intera."
      ],
      image: "https://picsum.photos/seed/Risco-Madeira/900/600"
    },
    {
      id: "core-14",
      name: "Bica da Cana",
      zone: "ovest",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.7781,
      lon: -17.1128,
      desc: "Sunrise point molto forte sopra un mare di nuvole.",
      tip: "Uno dei migliori punti alba facili dell'isola.",
      longDescription: "È uno spot potentissimo per partire presto senza un grande sforzo fisico. Se trovi nuvole sotto e cielo pulito sopra, fa davvero il colpo grosso.",
      photoTips: "Vai con anticipo e resta anche poco dopo l’alba: spesso la luce migliore arriva subito dopo il primo momento.",
      experience: {
        wow: 9,
        tipo: "sunrise point facile",
        tempo: "30m-1h",
        mood: "alto e pulito"
      },
      whenToGo: {
        best: "alba",
        note: "Perfetto per alba seria senza trekking pesante."
      },
      whenToAvoid: [
        "giornata totalmente chiusa",
        "partenza tardiva",
        "se vuoi un posto urbano"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "facile",
        walk: "minima",
        strada: "semplice"
      },
      crowd: {
        best: "molto presto",
        worst: "quando viene scoperto troppo"
      },
      smartTips: [
        "Ottimo piano B o piano A all’alba.",
        "Se il cielo promette bene, qui sei messo forte.",
        "Molto alta resa per poco sforzo."
      ],
      image: "https://picsum.photos/seed/Bica-da-Cana-Madeira/900/600"
    },
    {
      id: "core-15",
      name: "Balcões",
      zone: "montagna",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.7368,
      lon: -16.897,
      desc: "Belvedere accessibile con panorama molto forte sulle vallate.",
      tip: "Perfetto se vuoi una mattina facile ma bella.",
      longDescription: "Molto furbo per chi cerca resa alta e sforzo basso.",
      photoTips: "Cielo con struttura e luce mattutina aiutano moltissimo.",
      experience: {
        wow: 8,
        tipo: "viewpoint facile",
        tempo: "45m-1h30",
        mood: "semplice e efficace"
      },
      whenToGo: {
        best: "alba",
        note: "Molto valido nelle prime ore, senza complicarti."
      },
      whenToAvoid: [
        "giornata totalmente piatta",
        "orari molto comodi",
        "aspettative da esperienza epica"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "breve e semplice",
        strada: "comoda"
      },
      crowd: {
        best: "presto",
        worst: "quando tutti vogliono il punto facile"
      },
      smartTips: [
        "Ottimo quando vuoi conservare energie.",
        "Molto buono nelle giornate incerte ma non chiuse.",
        "Spot furbo, non sottovalutarlo."
      ],
      image: "https://picsum.photos/seed/Balcoes-Madeira/900/600"
    },
    {
      id: "core-16",
      name: "Achadas da Cruz View",
      zone: "nord",
      light: "tramonto",
      activity: "view",
      difficulty: "medio",
      level: "core",
      lat: 32.8648,
      lon: -17.2176,
      desc: "Una delle scogliere più scenografiche dell'isola.",
      tip: "Bellissima anche restando solo in alto.",
      longDescription: "È una tappa molto forte per profondità, verticalità e sensazione di margine estremo.",
      photoTips: "Molto forte con luce bassa e aria pulita. Anche senza scendere, il punto alto regge molto bene.",
      experience: {
        wow: 9,
        tipo: "scogliera estrema",
        tempo: "45m-2h",
        mood: "verticale e memorabile"
      },
      whenToGo: {
        best: "tramonto",
        note: "A luce bassa la profondità qui sale tantissimo."
      },
      whenToAvoid: [
        "visibilità pessima",
        "se vuoi spot facile da vivere in fretta",
        "troppo vento"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "medio",
        walk: "dipende da quanto vuoi esplorare",
        strada: "ok"
      },
      crowd: {
        best: "tardo pomeriggio pulito",
        worst: "orari più battuti"
      },
      smartTips: [
        "Anche solo il top viewpoint vale il viaggio.",
        "Perfetto per un nord-ovest forte.",
        "Sensazione di grande scala molto alta."
      ],
      image: "https://picsum.photos/seed/Achadas-da-Cruz-View-Madeira/900/600"
    },
    {
      id: "core-17",
      name: "Ponta do Sol",
      zone: "sud",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "core",
      lat: 32.679,
      lon: -17.1012,
      desc: "Paese molto piacevole sul sud, con luce calda molto bella.",
      tip: "Perfetto per fine giornata semplice.",
      longDescription: "È una tappa molto facile da amare: comoda, calda, piacevole e senza sforzo.",
      photoTips: "Luce dorata e scene quotidiane rendono molto bene. Non serve complicare.",
      experience: {
        wow: 8,
        tipo: "paese costiero rilassato",
        tempo: "1-2h",
        mood: "caldo e semplice"
      },
      whenToGo: {
        best: "tramonto",
        note: "Ottimo se vuoi chiudere bene senza pressione."
      },
      whenToAvoid: [
        "passaggio troppo rapido",
        "centro giornata anonimo",
        "aspettative da spot estremo"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "molto semplice",
        strada: "comoda"
      },
      crowd: {
        best: "fine giornata",
        worst: "fasce più normali del giorno"
      },
      smartTips: [
        "Molto buono per abbassare il ritmo senza abbassare il piacere.",
        "Ottima chiusura sul lato sud.",
        "Funziona più da atmosfera che da spot unico."
      ],
      image: "https://picsum.photos/seed/Ponta-do-Sol-Madeira/900/600"
    },
    {
      id: "core-18",
      name: "Calheta Beach",
      zone: "ovest",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "core",
      lat: 32.7182,
      lon: -17.176,
      desc: "Spiaggia e marina comode per chiudere una giornata sportiva.",
      tip: "Molto valida come stop finale senza stress.",
      longDescription: "Più semplice e rilassata rispetto ad altri spot wow, ma molto utile come chiusura intelligente.",
      photoTips: "Buona per una fine giornata morbida più che per la foto estrema.",
      experience: {
        wow: 7,
        tipo: "chiusura easy sul mare",
        tempo: "45m-2h",
        mood: "facile e piacevole"
      },
      whenToGo: {
        best: "tramonto",
        note: "Ottima se vuoi concludere bene senza cercare l’effetto epico."
      },
      whenToAvoid: [
        "se vuoi il tramonto più forte dell'isola",
        "orario centrale senza senso",
        "giornata già molto lenta"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "facile",
        walk: "minima",
        strada: "comodissima"
      },
      crowd: {
        best: "fine giornata",
        worst: "momenti più comodi"
      },
      smartTips: [
        "Perfetta dopo trekking o trasferimenti lunghi.",
        "Molto più utile che spettacolare, ma bene così.",
        "Ottimo stop di decompressione."
      ],
      image: "https://picsum.photos/seed/Calheta-Beach-Madeira/900/600"
    },
    {
      id: "core-19",
      name: "Miradouro do Facho",
      zone: "est",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.7175,
      lon: -16.7635,
      desc: "Belvedere sopra Machico, molto utile verso sera.",
      tip: "Se sei già in zona est, è una chiusura furba.",
      longDescription: "Non è il tramonto più celebrato di Madeira, ma è una scelta intelligente: accessibile, leggibile e ottima se ti trovi già sul lato est.",
      photoTips: "Funziona bene con luce calda e città/mare leggibili. È più forte se non arrivi già tardi.",
      experience: {
        wow: 7,
        tipo: "tramonto rapido e furbo",
        tempo: "30m-1h",
        mood: "pratico e pulito"
      },
      whenToGo: {
        best: "tramonto",
        note: "Molto utile quando non vuoi attraversare l’isola per chiudere la giornata."
      },
      whenToAvoid: [
        "se cerchi il tramonto top assoluto",
        "giornata troppo velata",
        "attesa da spot iconico estremo"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "facile",
        walk: "breve",
        strada: "semplice"
      },
      crowd: {
        best: "arrivo con margine",
        worst: "ultimissimi minuti"
      },
      smartTips: [
        "Usalo quando la logistica conta.",
        "Molto furbo per chi dorme o rientra a est.",
        "Buon finale senza sbatti."
      ],
      image: "https://picsum.photos/seed/Facho-Machico-Madeira/900/600"
    },

    {
      id: "secondary-0",
      name: "Miradouro da Ponta do Rosto",
      zone: "est",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7433,
      lon: -16.7086,
      desc: "Belvedere immediato e potentissimo sul lato est, con oceano da entrambi i lati.",
      tip: "Ottimo se vuoi un wow rapido senza trekking lungo.",
      experience: { wow: 8, tipo: "viewpoint rapido", tempo: "20-40m" },
      whenToGo: { best: "alba", note: "Molto bene con partenza presto." },
      access: { difficolta: "facile", parcheggio: "medio", walk: "brevissimo", strada: "semplice" },
      image: "https://picsum.photos/seed/Ponta-do-Rosto-Madeira/900/600"
    },
    {
      id: "secondary-1",
      name: "Porto da Cruz Waterfront",
      zone: "est",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7661,
      lon: -16.8299,
      desc: "Waterfront piacevole e ottimo come pausa nel nord-est.",
      tip: "Buono come stop tra spot più intensi.",
      experience: { wow: 7, tipo: "pausa sul mare", tempo: "30-60m" },
      whenToGo: { best: "giorno", note: "Molto utile come break." },
      access: { difficolta: "facile", parcheggio: "facile", walk: "semplice", strada: "comoda" },
      image: "https://picsum.photos/seed/Porto-da-Cruz-Waterfront-Madeira/900/600"
    },
    {
      id: "secondary-2",
      name: "Miradouro do Guindaste",
      zone: "est",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.8217,
      lon: -16.8606,
      desc: "Uno dei viewpoint più puliti e scenici sul lato est.",
      tip: "Ottimo sunrise facile.",
      experience: { wow: 8, tipo: "belvedere costiero", tempo: "20-40m" },
      whenToGo: { best: "alba", note: "Molto forte nelle prime ore." },
      access: { difficolta: "facile", parcheggio: "facile", walk: "breve", strada: "semplice" },
      image: "https://picsum.photos/seed/Guindaste-Madeira/900/600"
    },
    {
      id: "secondary-3",
      name: "Prainha do Caniçal",
      zone: "est",
      light: "alba",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7397,
      lon: -16.7167,
      desc: "Piccola spiaggia vulcanica, bella per inizio giornata tranquillo.",
      tip: "Meglio presto e con poca folla.",
      experience: { wow: 7, tipo: "spiaggia vulcanica piccola", tempo: "30-60m" },
      whenToGo: { best: "alba", note: "Molto buona a inizio giornata." },
      access: { difficolta: "facile", parcheggio: "medio", walk: "breve", strada: "semplice" },
      image: "https://picsum.photos/seed/Prainha-do-Canical-Madeira/900/600"
    },
    {
      id: "secondary-4",
      name: "Machico Bay",
      zone: "est",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7167,
      lon: -16.7667,
      desc: "Baia ordinata e piacevole per una tappa semplice.",
      tip: "Buona come stop soft o pausa logistica.",
      experience: { wow: 6, tipo: "pausa comoda", tempo: "30-60m" },
      whenToGo: { best: "giorno", note: "Molto utile dentro una giornata piena." },
      access: { difficolta: "facile", parcheggio: "facile", walk: "minima", strada: "comodissima" },
      image: "https://picsum.photos/seed/Machico-Bay-Madeira/900/600"
    },
    {
      id: "secondary-5",
      name: "Rocha do Navio",
      zone: "nord",
      light: "giorno",
      activity: "view",
      difficulty: "medio",
      level: "secondary",
      lat: 32.8164,
      lon: -16.885,
      desc: "Scogliera e teleferica, molto scenica.",
      tip: "Molto valida come tappa nord.",
      experience: { wow: 8, tipo: "scogliera panoramica", tempo: "45-90m" },
      whenToGo: { best: "giorno", note: "Buona in giornata di nord-est." },
      access: { difficolta: "medio", parcheggio: "medio", walk: "dipende da quanto vuoi fare", strada: "ok" },
      image: "https://picsum.photos/seed/Rocha-do-Navio-Madeira/900/600"
    },
    {
      id: "secondary-6",
      name: "São Jorge Coast View",
      zone: "nord",
      light: "giorno",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.823,
      lon: -16.909,
      desc: "Costa verde e ripida, molto rappresentativa del nord.",
      tip: "Buono come spot di passaggio.",
      experience: { wow: 7, tipo: "vista costiera nord", tempo: "20-40m" },
      whenToGo: { best: "giorno", note: "Buona tappa intermedia." },
      access: { difficolta: "facile", parcheggio: "medio", walk: "breve", strada: "semplice" }
    },
    {
      id: "secondary-7",
      name: "Ponta Delgada Waterfront",
      zone: "nord",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.8241,
      lon: -16.9297,
      desc: "Piccolo centro costiero buono per una pausa.",
      tip: "Molto utile per spezzare la giornata.",
      experience: { wow: 6, tipo: "waterfront tranquillo", tempo: "20-45m" },
      whenToGo: { best: "giorno", note: "Più utile che iconico." },
      access: { difficolta: "facile", parcheggio: "facile", walk: "minima", strada: "comodissima" }
    },
    {
      id: "secondary-8",
      name: "Seixal Natural Pools",
      zone: "nord",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.8241,
      lon: -17.1085,
      desc: "Piscine naturali utili per stop tranquillo.",
      tip: "Ottime se vuoi rallentare.",
      experience: { wow: 7, tipo: "piscine naturali easy", tempo: "30-60m" },
      whenToGo: { best: "giorno", note: "Molto buone come pausa." },
      access: { difficolta: "facile", parcheggio: "medio", walk: "breve", strada: "semplice" }
    },
    {
      id: "secondary-9",
      name: "Teleférico Achadas da Cruz Top",
      zone: "nord",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.8639,
      lon: -17.2172,
      desc: "Scogliera fortissima senza scendere in basso.",
      tip: "Molto forte anche solo in alto.",
      experience: { wow: 8, tipo: "belvedere verticale", tempo: "20-45m" },
      whenToGo: { best: "tramonto", note: "Ottimo punto rapido in nord-ovest." },
      access: { difficolta: "facile", parcheggio: "medio", walk: "minima", strada: "ok" }
    },
    {
      id: "secondary-10",
      name: "Levada do Alecrim",
      zone: "ovest",
      light: "giorno",
      activity: "trekking",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7601,
      lon: -17.1327,
      desc: "Trekking semplice e piacevole in zona Rabaçal.",
      tip: "Buona scelta easy.",
      experience: { wow: 7, tipo: "trekking verde facile", tempo: "1-2h" },
      whenToGo: { best: "giorno", note: "Molto utile se vuoi stare morbido." },
      access: { difficolta: "facile", parcheggio: "medio", walk: "regolare", strada: "semplice" }
    },
    {
      id: "secondary-11",
      name: "Encumeada Pass",
      zone: "montagna",
      light: "giorno",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7491,
      lon: -17.032,
      desc: "Passo centrale molto utile per leggere l'isola.",
      tip: "Ottimo spot di transizione.",
      experience: { wow: 7, tipo: "passo panoramico", tempo: "15-30m" },
      whenToGo: { best: "giorno", note: "Molto buono da infilare." },
      access: { difficolta: "facile", parcheggio: "facile", walk: "minima", strada: "comoda" }
    },
    {
      id: "secondary-12",
      name: "Achada do Teixeira",
      zone: "montagna",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7583,
      lon: -16.9332,
      desc: "Accesso più semplice verso il Pico Ruivo.",
      tip: "Molto utile logisticamente.",
      experience: { wow: 6, tipo: "accesso smart", tempo: "15-30m" },
      whenToGo: { best: "alba", note: "Più furbo che iconico da solo." },
      access: { difficolta: "facile", parcheggio: "medio", walk: "minima", strada: "ok" }
    },
    {
      id: "secondary-13",
      name: "Vereda do Larano",
      zone: "est",
      light: "giorno",
      activity: "trekking",
      difficulty: "medio",
      level: "secondary",
      lat: 32.7733,
      lon: -16.8445,
      desc: "Sentiero costiero con grande panorama.",
      tip: "Molto buono se vuoi costa e cammino.",
      experience: { wow: 8, tipo: "trekking costiero", tempo: "2-4h" },
      whenToGo: { best: "giorno", note: "Da fare con margine e voglia di camminare." },
      access: { difficolta: "medio", parcheggio: "medio", walk: "trek vero", strada: "ok" }
    },
    {
      id: "secondary-14",
      name: "Boca dos Namorados",
      zone: "montagna",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7057,
      lon: -16.969,
      desc: "Alternativa molto valida alla zona Eira do Serrado.",
      tip: "Se vuoi una vista forte senza sbatti, funziona bene.",
      experience: { wow: 7, tipo: "viewpoint montano", tempo: "20-40m" },
      whenToGo: { best: "tramonto", note: "Molto buona nel tardo pomeriggio." },
      access: { difficolta: "facile", parcheggio: "medio", walk: "breve", strada: "ok" },
      image: "https://picsum.photos/seed/Boca-dos-Namorados-Madeira/900/600"
    },
    {
      id: "secondary-15",
      name: "Paul da Serra",
      zone: "ovest",
      light: "tramonto",
      activity: "mtb",
      difficulty: "medio",
      level: "secondary",
      lat: 32.763,
      lon: -17.133,
      desc: "Altipiano aperto perfetto per uscite outdoor e luce lunga.",
      tip: "Bellissimo con orizzonte largo nel tardo pomeriggio.",
      experience: { wow: 7, tipo: "altipiano outdoor", tempo: "1-2h" },
      whenToGo: { best: "tramonto", note: "Più atmosfera e spazio che singolo spot." },
      access: { difficolta: "medio", parcheggio: "facile", walk: "variabile", strada: "semplice" },
      image: "https://picsum.photos/seed/Paul-da-Serra-Madeira/900/600"
    },
    {
      id: "secondary-16",
      name: "Levada do Rei",
      zone: "montagna",
      light: "giorno",
      activity: "trekking",
      difficulty: "medio",
      level: "secondary",
      lat: 32.8068,
      lon: -16.9075,
      desc: "Levada molto bella e appagante, con tanto verde.",
      tip: "Ottima se vuoi trekking classico Madeira.",
      experience: { wow: 8, tipo: "levada verde classica", tempo: "3-4h" },
      whenToGo: { best: "giorno", note: "Molto solida come esperienza piena." },
      access: { difficolta: "medio", parcheggio: "medio", walk: "regolare", strada: "ok" },
      image: "https://picsum.photos/seed/Levada-do-Rei-Madeira/900/600"
    },
    {
      id: "secondary-17",
      name: "Funchal Old Town",
      zone: "sud",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.6482,
      lon: -16.9036,
      desc: "Centro storico utile per passeggiare, mangiare e respirare l'atmosfera.",
      tip: "Buono tra tardo pomeriggio e sera.",
      experience: { wow: 7, tipo: "passeggiata urbana", tempo: "1-2h" },
      whenToGo: { best: "giorno", note: "Ottimo per dare ritmo diverso al viaggio." },
      access: { difficolta: "facile", parcheggio: "medio", walk: "semplice", strada: "urbana" },
      image: "https://picsum.photos/seed/Funchal-Old-Town-Madeira/900/600"
    },
    {
      id: "secondary-18",
      name: "Jardim do Mar View",
      zone: "sud",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.739,
      lon: -17.212,
      desc: "Paesino e costa molto piacevoli verso sera.",
      tip: "Molto valido per una chiusura semplice.",
      experience: { wow: 7, tipo: "tramonto costiero semplice", tempo: "30-60m" },
      whenToGo: { best: "tramonto", note: "Buona chiusura rilassata." },
      access: { difficolta: "facile", parcheggio: "medio", walk: "breve", strada: "comoda" }
    },
    {
      id: "secondary-19",
      name: "Paul do Mar",
      zone: "sud",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7605,
      lon: -17.2291,
      desc: "Costa più ruvida e piacevole per una chiusura semplice.",
      tip: "Atmosfera molto buona a fine giornata.",
      experience: { wow: 7, tipo: "chiusura sud-ovest", tempo: "30-60m" },
      whenToGo: { best: "tramonto", note: "Molto meglio verso sera." },
      access: { difficolta: "facile", parcheggio: "medio", walk: "semplice", strada: "ok" }
    },

    {
      id: "extra-0",
      name: "Miradouro do Véu da Noiva",
      zone: "nord",
      light: "giorno",
      activity: "view",
      difficulty: "facile",
      level: "extra",
      lat: 32.8335,
      lon: -17.1258,
      desc: "Vista iconica sulla cascata costiera, rapidissima ma molto efficace.",
      tip: "Perfetto come bonus forte senza rubare troppo tempo.",
      experience: { wow: 8, tipo: "stop rapido iconico", tempo: "10-20m" },
      whenToGo: { best: "giorno", note: "Spot bonus molto intelligente sul nord." },
      access: { difficolta: "facile", parcheggio: "facile", walk: "minima", strada: "comodissima" }
    },
    {
      id: "extra-1",
      name: "Cais do Sardinha",
      zone: "est",
      light: "alba",
      activity: "trekking",
      difficulty: "medio",
      level: "extra",
      lat: 32.7457,
      lon: -16.6889,
      desc: "Il finale davvero appagante del trekking di São Lourenço.",
      tip: "Usalo come extra serio solo se fai davvero il percorso.",
      experience: { wow: 8, tipo: "finale trekking premio", tempo: "legato al percorso" },
      whenToGo: { best: "alba", note: "Diventa grande se lo guadagni col cammino." },
      access: { difficolta: "medio", parcheggio: "n.d.", walk: "si raggiunge dentro il trekking", strada: "n.d." }
    },
    {
      id: "extra-2",
      name: "Palheiro Gardens",
      zone: "sud",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "extra",
      lat: 32.6684,
      lon: -16.8515,
      desc: "Giardini tranquilli e curati, perfetti per cambiare ritmo.",
      tip: "Ottimo extra quando vuoi una Madeira più morbida e ordinata.",
      experience: { wow: 6, tipo: "giardino elegante", tempo: "1-2h" },
      whenToGo: { best: "giorno", note: "Buon jolly per giornate soft o meteo così così." },
      access: { difficolta: "facile", parcheggio: "facile", walk: "semplice", strada: "comoda" },
      image: "https://picsum.photos/seed/Palheiro-Gardens-Madeira/900/600"
    },
    {
      id: "extra-3",
      name: "Pico dos Barcelos",
      zone: "sud",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "extra",
      lat: 32.6656,
      lon: -16.9372,
      desc: "Belvedere accessibile con vista ampia su Funchal.",
      tip: "Extra molto furbo se vuoi una vista città senza complicarti.",
      experience: { wow: 7, tipo: "viewpoint urbano alto", tempo: "20-40m" },
      whenToGo: { best: "tramonto", note: "Molto valido a luce serale." },
      access: { difficolta: "facile", parcheggio: "facile", walk: "brevissima", strada: "comodissima" },
      image: "https://picsum.photos/seed/Pico-dos-Barcelos-Madeira/900/600"
    },
    {
      id: "extra-4",
      name: "Penha d'Águia",
      zone: "est",
      light: "giorno",
      activity: "view",
      difficulty: "medio",
      level: "extra",
      lat: 32.7633,
      lon: -16.8244,
      desc: "Roccia iconica sul lato nord-est, molto distintiva visivamente.",
      tip: "Extra interessante se vuoi qualcosa di diverso e meno standard.",
      experience: { wow: 7, tipo: "roccia simbolica", tempo: "30-60m" },
      whenToGo: { best: "giorno", note: "Molto buona come variante nel nord-est." },
      access: { difficolta: "medio", parcheggio: "medio", walk: "variabile", strada: "ok" },
      image: "https://picsum.photos/seed/Penha-dAguia-Madeira/900/600"
    }
  ]
};