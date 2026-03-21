window.APP_SPOTS = {
  region: "Madeira",
  center: [32.75, -16.95],
  zoom: 10,
  storageKeys: {
    favorites: "madeira_favorites_v8",
    planner: "madeira_day_planner_v8"
  },

  topWowNames: [
    "Ponta de São Lourenço",
    "Pico do Arieiro",
    "Pico Ruivo Summit",
    "PR1 Arieiro → Ruivo",
    "Fanal Forest",
    "Ribeira da Janela",
    "Porto Moniz Pools",
    "Cabo Girão",
    "Bica da Cana",
    "Eira do Serrado"
  ],

  topSunsetNames: [
    "Ponta do Pargo Lighthouse",
    "Câmara de Lobos",
    "Cabo Girão",
    "Ponta do Sol",
    "Calheta Beach",
    "Pico dos Barcelos",
    "Miradouro do Pináculo",
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
      desc: "Promontorio scenografico con creste e oceano su entrambi i lati.",
      tip: "Parti molto presto: qui l’alba cambia davvero l’esperienza.",
      experience: {
        wow: 10,
        tipo: "trekking panoramico di cresta",
        tempo: "2-4h",
        mood: "epico"
      },
      whenToGo: {
        best: "alba",
        note: "meglio con cielo limpido e vento basso"
      },
      whenToAvoid: [
        "vento forte",
        "ore centrali",
        "giorni molto caldi"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "facile vicino all'inizio",
        walk: "0 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "molto presto",
        worst: "metà mattina"
      },
      smartTips: [
        "Arriva 45-60 min prima dell’alba",
        "Porta acqua",
        "Ottimo come spot principale della giornata"
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
      desc: "Il classico sopra le nuvole, tra i punti più iconici di Madeira.",
      tip: "Arriva prima dell’alba e vestiti bene.",
      experience: {
        wow: 10,
        tipo: "view alta quota",
        tempo: "30-90 min",
        mood: "iconico"
      },
      whenToGo: {
        best: "alba",
        note: "top con mare di nuvole"
      },
      whenToAvoid: [
        "nuvole basse chiuse",
        "vento forte",
        "visibilità pessima"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "diretto ma si riempie",
        walk: "0-5 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "molto presto",
        worst: "alba popolare"
      },
      smartTips: [
        "Porta giacca antivento",
        "Aspetta anche dopo l’alba",
        "Se è chiuso davvero, cambia spot"
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
      desc: "La cima più alta dell’isola con vista enorme.",
      tip: "In giornate limpide è uno dei top assoluti.",
      experience: {
        wow: 10,
        tipo: "cima panoramica",
        tempo: "2-4h",
        mood: "grande panorama"
      },
      whenToGo: {
        best: "alba",
        note: "meglio con aria limpida e poco vento"
      },
      whenToAvoid: [
        "nuvole basse persistenti",
        "vento forte",
        "scarpe inadatte"
      ],
      access: {
        difficolta: "impegnativo",
        parcheggio: "più comodo via Achada do Teixeira",
        walk: "circa 1.5h da Achada do Teixeira",
        strada: "asfaltata"
      },
      crowd: {
        best: "prestissimo",
        worst: "mattina media"
      },
      smartTips: [
        "Usa Achada do Teixeira se vuoi la via più gestibile",
        "Porta strato caldo",
        "Qui la visibilità conta tantissimo"
      ],
      image: "https://picsum.photos/seed/Pico-Ruivo-Madeira/900/600"
    },

    {
      id: "core-3",
      name: "PR1 Arieiro → Ruivo",
      zone: "montagna",
      light: "alba",
      activity: "trekking",
      difficulty: "impegnativo",
      level: "core",
      lat: 32.7355,
      lon: -16.9288,
      desc: "Il trekking simbolo di Madeira tra creste, tunnel e panorami enormi.",
      tip: "Da fare con meteo stabile e gambe buone.",
      experience: {
        wow: 10,
        tipo: "trekking iconico di alta quota",
        tempo: "4-6h",
        mood: "avventura"
      },
      whenToGo: {
        best: "mattina presto",
        note: "meglio partire presto con buona visibilità"
      },
      whenToAvoid: [
        "vento forte",
        "visibilità bassa",
        "meteo instabile"
      ],
      access: {
        difficolta: "impegnativo",
        parcheggio: "facile lato Arieiro",
        walk: "0 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "molto presto",
        worst: "fascia centrale del mattino"
      },
      smartTips: [
        "Controlla apertura e condizioni del percorso",
        "Porta torcia per i tunnel",
        "Meglio farlo come esperienza centrale della giornata"
      ],
      image: "https://picsum.photos/seed/PR1-Arieiro-Ruivo-Madeira/900/600"
    },

    {
      id: "core-4",
      name: "Fanal Forest",
      zone: "ovest",
      light: "giorno",
      activity: "trekking",
      difficulty: "facile",
      level: "core",
      lat: 32.7603,
      lon: -17.1476,
      desc: "Foresta magica con alberi contorti e atmosfera unica.",
      tip: "Se trovi nebbia, qui hai fatto centro.",
      experience: {
        wow: 9,
        tipo: "foresta atmosferica",
        tempo: "1-2h",
        mood: "mistico"
      },
      whenToGo: {
        best: "nebbia",
        note: "giornate grigie o nebbiose top"
      },
      whenToAvoid: [
        "cielo limpido",
        "sole forte a picco"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "vicino",
        walk: "0-5 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "presto o con meteo incerto",
        worst: "giornate celebri sui social"
      },
      smartTips: [
        "Qui il brutto tempo aiuta",
        "Cammina un po’ oltre la zona più immediata",
        "Non inseguire il sole"
      ],
      image: "https://picsum.photos/seed/Fanal-Forest-Madeira/900/600"
    },

    {
      id: "core-5",
      name: "Ribeira da Janela",
      zone: "nord",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.8652,
      lon: -17.1446,
      desc: "Rocce in mare tra le più iconiche e fotogeniche di Madeira.",
      tip: "Molto meglio con mare vivo e luce bassa.",
      experience: {
        wow: 9,
        tipo: "costa rocciosa iconica",
        tempo: "20-40 min",
        mood: "classico fotografico"
      },
      whenToGo: {
        best: "alba",
        note: "top con onde o mare mosso leggero"
      },
      whenToAvoid: [
        "mare troppo piatto",
        "luce dura",
        "meteo spento"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "vicino",
        walk: "2 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "molto presto",
        worst: "orari comodi"
      },
      smartTips: [
        "Se il mare è vivo, lo spot sale molto",
        "Ottimo con Seixal e Porto Moniz",
        "Non serve restare tantissimo"
      ],
      image: "https://picsum.photos/seed/Ribeira-da-Janela-Madeira/900/600"
    },

    {
      id: "core-6",
      name: "Porto Moniz Pools",
      zone: "nord",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.8664,
      lon: -17.1666,
      desc: "Piscine vulcaniche e oceano aperto, tappa forte e molto leggibile.",
      tip: "Rende molto meglio a luce morbida.",
      experience: {
        wow: 8,
        tipo: "mare e roccia vulcanica",
        tempo: "1-2h",
        mood: "scenico e facile"
      },
      whenToGo: {
        best: "tramonto",
        note: "meglio nel tardo pomeriggio e verso fine luce"
      },
      whenToAvoid: [
        "mezzogiorno pieno",
        "troppa gente",
        "vento molto forte"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "comodo in zona",
        walk: "0-3 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "fuori dagli orari più turistici",
        worst: "metà giornata"
      },
      smartTips: [
        "Più da chiusura di giornata che da stop centrale",
        "Resta se il cielo si accende",
        "Facilissimo da inserire nel road day nord-ovest"
      ],
      image: "https://picsum.photos/seed/Porto-Moniz-Madeira/900/600"
    },

    {
      id: "core-7",
      name: "Cabo Girão",
      zone: "sud",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.6558,
      lon: -17.0048,
      desc: "Grande falesia con vista ampissima sul sud.",
      tip: "Vai verso sera: con luce dura perde parecchio.",
      experience: {
        wow: 8,
        tipo: "viewpoint verticale",
        tempo: "20-40 min",
        mood: "grande panorama facile"
      },
      whenToGo: {
        best: "tramonto",
        note: "luce più morbida e piacevole"
      },
      whenToAvoid: [
        "mezzogiorno",
        "momenti molto affollati"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "diretto",
        walk: "1 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "tardo pomeriggio",
        worst: "fasce turistiche classiche"
      },
      smartTips: [
        "Perfetto come stop breve ma forte",
        "Meglio abbinarlo a Câmara o Ponta do Sol",
        "Non dargli troppo tempo"
      ],
      image: "https://picsum.photos/seed/Cabo-Girao-Madeira/900/600"
    },

    {
      id: "core-8",
      name: "Bica da Cana",
      zone: "ovest",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.7781,
      lon: -17.1128,
      desc: "Uno dei migliori sunrise facili dell’isola.",
      tip: "Tra i punti alba più furbi se vuoi resa alta senza trekking pesante.",
      experience: {
        wow: 9,
        tipo: "sunrise viewpoint",
        tempo: "20-40 min",
        mood: "wow facile"
      },
      whenToGo: {
        best: "alba",
        note: "top con nuvole basse sotto quota"
      },
      whenToAvoid: [
        "vento forte",
        "copertura alta uniforme"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "vicino",
        walk: "5 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "molto presto",
        worst: "spot alba popolari"
      },
      smartTips: [
        "Resta anche dopo il primo momento",
        "Ottimo piano B se Arieiro è scomodo",
        "Guarda la quota delle nuvole"
      ],
      image: "https://picsum.photos/seed/Bica-da-Cana-Madeira/900/600"
    },

    {
      id: "core-9",
      name: "Ponta do Pargo Lighthouse",
      zone: "ovest",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.812,
      lon: -17.2623,
      desc: "Uno dei tramonti più affidabili e puliti di Madeira.",
      tip: "Se vuoi il tramonto serio, questo è uno dei posti migliori.",
      experience: {
        wow: 9,
        tipo: "sunset point",
        tempo: "30-50 min",
        mood: "pulito e forte"
      },
      whenToGo: {
        best: "tramonto",
        note: "più forte arrivando un po’ prima"
      },
      whenToAvoid: [
        "copertura totale verso ovest"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "vicino",
        walk: "1 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "arrivo anticipato",
        worst: "tramonti perfetti popolari"
      },
      smartTips: [
        "Uno dei migliori posti per chiudere il giorno forte",
        "Ottimo anche con composizioni semplici",
        "Non andare via troppo presto"
      ],
      image: "https://picsum.photos/seed/Ponta-do-Pargo-Madeira/900/600"
    },

    {
      id: "core-10",
      name: "Seixal Beach",
      zone: "nord",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 32.8246,
      lon: -17.1082,
      desc: "Spiaggia nera con montagne verdi dietro, tra i contrasti più forti dell’isola.",
      tip: "Molto bella al mattino presto.",
      experience: {
        wow: 8,
        tipo: "spiaggia vulcanica",
        tempo: "30-60 min",
        mood: "forte contrasto"
      },
      whenToGo: {
        best: "alba",
        note: "molto valida anche poco dopo"
      },
      whenToAvoid: [
        "mezzogiorno piatto",
        "giornate spente"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "vicino",
        walk: "2 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "presto",
        worst: "fasce comode"
      },
      smartTips: [
        "Ottima in combo con Ribeira e Porto Moniz",
        "Rende più dal vivo di quanto sembri"
      ],
      image: "https://picsum.photos/seed/Seixal-Beach-Madeira/900/600"
    },

    {
      id: "core-11",
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
      experience: {
        wow: 8,
        tipo: "view sulla valle",
        tempo: "20-40 min",
        mood: "panorama interno"
      },
      whenToGo: {
        best: "tramonto",
        note: "la luce radente migliora le forme"
      },
      whenToAvoid: [
        "meteo chiuso in quota",
        "visibilità molto scarsa"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "vicino",
        walk: "2 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "tardo pomeriggio",
        worst: "orari turistici"
      },
      smartTips: [
        "Perfetto se vuoi montagna senza fatica",
        "Ottimo in combo con Boca dos Namorados"
      ],
      image: "https://picsum.photos/seed/Eira-do-Serrado-Madeira/900/600"
    },

    {
      id: "core-12",
      name: "Levada do Caldeirão Verde",
      zone: "nord",
      light: "giorno",
      activity: "trekking",
      difficulty: "medio",
      level: "core",
      lat: 32.8072,
      lon: -16.905,
      desc: "Uno dei trekking più famosi di Madeira, verde e immersivo.",
      tip: "Porta una luce per i tunnel più bui.",
      experience: {
        wow: 8,
        tipo: "levada trekking",
        tempo: "3-4h",
        mood: "immersivo"
      },
      whenToGo: {
        best: "giorno",
        note: "meglio partire presto"
      },
      whenToAvoid: [
        "ore tarde",
        "giorni molto affollati"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "facile in zona partenza",
        walk: "0 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "presto",
        worst: "metà mattina"
      },
      smartTips: [
        "Non puntare tutto solo sulla cascata finale",
        "Meglio farlo quando hai energie vere"
      ],
      image: "https://picsum.photos/seed/Caldeirao-Verde-Madeira/900/600"
    },

    {
      id: "core-13",
      name: "Achadas da Cruz View",
      zone: "nord",
      light: "tramonto",
      activity: "view",
      difficulty: "medio",
      level: "core",
      lat: 32.8648,
      lon: -17.2176,
      desc: "Una delle scogliere più spettacolari dell’isola.",
      tip: "Bellissima anche restando solo in alto.",
      experience: {
        wow: 9,
        tipo: "cliff viewpoint",
        tempo: "30-60 min",
        mood: "drammatico"
      },
      whenToGo: {
        best: "tramonto",
        note: "molto forte con aria pulita"
      },
      whenToAvoid: [
        "meteo chiuso",
        "vento troppo forte"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "facile",
        walk: "5 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "tardo pomeriggio",
        worst: "meno critico di altri spot celebri"
      },
      smartTips: [
        "Anche senza scendere, il punto alto vale molto",
        "Ottimo con Porto Moniz o ovest estremo"
      ],
      image: "https://picsum.photos/seed/Achadas-da-Cruz-View-Madeira/900/600"
    },

    {
      id: "core-14",
      name: "Câmara de Lobos",
      zone: "sud",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "core",
      lat: 32.6488,
      lon: -16.9777,
      desc: "Villaggio di pescatori molto scenografico e piacevole da vivere.",
      tip: "Perfetto per tramonto, passeggiata e chiusura giornata.",
      experience: {
        wow: 7,
        tipo: "villaggio costiero",
        tempo: "1-2h",
        mood: "rilassato"
      },
      whenToGo: {
        best: "tramonto",
        note: "top come chiusura semplice e bella"
      },
      whenToAvoid: [
        "ore centrali se cerchi atmosfera",
        "parcheggio scomodo in momenti pieni"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "5-10 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "tardo pomeriggio",
        worst: "cena e weekend"
      },
      smartTips: [
        "Perfetto per abbassare il ritmo senza perdere qualità",
        "Ottimo da combinare con Cabo Girão"
      ],
      image: "https://picsum.photos/seed/Camara-de-Lobos-Madeira/900/600"
    },

    {
      id: "secondary-0",
      name: "Ponta do Sol",
      zone: "sud",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.679,
      lon: -17.1012,
      desc: "Paese molto piacevole sul sud, perfetto per una fine giornata semplice.",
      tip: "Ideale come chiusura senza stress.",
      experience: {
        wow: 7,
        tipo: "villaggio relax",
        tempo: "1h"
      },
      whenToGo: {
        best: "tramonto",
        note: "molto piacevole con luce dorata"
      },
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "5 min"
      },
      smartTips: [
        "Ottimo per abbassare il ritmo dopo spot più forti"
      ],
      image: "https://picsum.photos/seed/Ponta-do-Sol-Madeira/900/600"
    },

    {
      id: "secondary-1",
      name: "25 Fontes",
      zone: "ovest",
      light: "giorno",
      activity: "trekking",
      difficulty: "medio",
      level: "secondary",
      lat: 32.7524,
      lon: -17.1318,
      desc: "Trekking celebre con cascata finale, bello ma sensibile all’affollamento.",
      tip: "Parti presto se vuoi godertelo davvero.",
      experience: {
        wow: 7,
        tipo: "trekking classico",
        tempo: "3h"
      },
      whenToGo: {
        best: "mattina presto",
        note: "molto meglio se anticipi la folla"
      },
      access: {
        difficolta: "medio",
        parcheggio: "medio",
        walk: "accesso iniziale significativo"
      },
      smartTips: [
        "Se vuoi serenità, battilo sul tempo"
      ],
      image: "https://picsum.photos/seed/25-Fontes-Madeira/900/600"
    },

    {
      id: "secondary-2",
      name: "Levada do Rei",
      zone: "montagna",
      light: "giorno",
      activity: "trekking",
      difficulty: "medio",
      level: "secondary",
      lat: 32.8068,
      lon: -16.9075,
      desc: "Levada molto solida, verde e appagante.",
      tip: "Ottima se vuoi trekking classico Madeira ben bilanciato.",
      experience: {
        wow: 7,
        tipo: "trekking levada",
        tempo: "3h"
      },
      whenToGo: {
        best: "giorno",
        note: "buona scelta quando vuoi un trekking solido"
      },
      access: {
        difficolta: "medio",
        parcheggio: "facile",
        walk: "0 min"
      },
      smartTips: [
        "Più equilibrio che spettacolo secco"
      ],
      image: "https://picsum.photos/seed/Levada-do-Rei-Madeira/900/600"
    },

    {
      id: "secondary-3",
      name: "Balcões",
      zone: "montagna",
      light: "mattina",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7368,
      lon: -16.897,
      desc: "Belvedere accessibile con rapporto resa-sforzo molto alto.",
      tip: "Perfetto se vuoi una mattina facile ma bella.",
      experience: {
        wow: 8,
        tipo: "viewpoint facile",
        tempo: "30-45 min"
      },
      whenToGo: {
        best: "mattina",
        note: "molto bene con aria pulita"
      },
      access: {
        difficolta: "facile",
        parcheggio: "vicino",
        walk: "10-15 min"
      },
      smartTips: [
        "Uno dei migliori punti facili di Madeira"
      ],
      image: "https://picsum.photos/seed/Balcoes-Madeira/900/600"
    },

    {
      id: "secondary-4",
      name: "Calheta Beach",
      zone: "ovest",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7182,
      lon: -17.176,
      desc: "Spiaggia e marina comode, più utile come fine giornata che come wow assoluto.",
      tip: "Molto valida come stop finale senza stress.",
      experience: {
        wow: 6,
        tipo: "relax e pausa",
        tempo: "45-90 min"
      },
      whenToGo: {
        best: "tramonto",
        note: "meglio nel tardo pomeriggio"
      },
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "2-5 min"
      },
      smartTips: [
        "Usalo come chiusura intelligente"
      ],
      image: "https://picsum.photos/seed/Calheta-Beach-Madeira/900/600"
    },

    {
      id: "secondary-5",
      name: "Porto da Cruz Waterfront",
      zone: "est",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7661,
      lon: -16.8299,
      desc: "Waterfront piacevole e ottimo come pausa strategica nel nord-est.",
      tip: "Buono come tappa intermedia.",
      experience: {
        wow: 6,
        tipo: "pausa costiera",
        tempo: "30-60 min"
      },
      whenToGo: {
        best: "giorno",
        note: "ottimo come tappa intermedia"
      },
      access: {
        difficolta: "facile",
        parcheggio: "facile",
        walk: "2 min"
      },
      smartTips: [
        "Più utile che iconico"
      ],
      image: "https://picsum.photos/seed/Porto-da-Cruz-Waterfront-Madeira/900/600"
    },

    {
      id: "secondary-6",
      name: "Miradouro do Guindaste",
      zone: "est",
      light: "alba",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.8217,
      lon: -16.8606,
      desc: "Uno dei viewpoint più puliti e facili del lato est.",
      tip: "Ottimo sunrise facile.",
      experience: {
        wow: 7,
        tipo: "viewpoint rapido",
        tempo: "20-30 min"
      },
      whenToGo: {
        best: "alba",
        note: "molto buono appena il sole sale"
      },
      access: {
        difficolta: "facile",
        parcheggio: "vicino",
        walk: "1-2 min"
      },
      smartTips: [
        "Ottimo se vuoi un’alba bella senza impegno"
      ],
      image: "https://picsum.photos/seed/Guindaste-Madeira/900/600"
    },

    {
      id: "secondary-7",
      name: "Santana Houses",
      zone: "nord",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.8046,
      lon: -16.8821,
      desc: "Casette tradizionali, tappa iconica più culturale che paesaggistica.",
      tip: "Meglio lontano dai momenti più pieni.",
      experience: {
        wow: 6,
        tipo: "tappa culturale",
        tempo: "30-60 min"
      },
      whenToGo: {
        best: "giorno",
        note: "meglio in orari tranquilli"
      },
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "2 min"
      },
      smartTips: [
        "Più utile per varietà che per intensità"
      ],
      image: "https://picsum.photos/seed/Santana-Houses-Madeira/900/600"
    },

    {
      id: "secondary-8",
      name: "Ribeiro Frio",
      zone: "montagna",
      light: "giorno",
      activity: "trekking",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7403,
      lon: -16.8906,
      desc: "Area verde e fresca, buona per combinare natura e cammino leggero.",
      tip: "Funziona bene anche con nuvole.",
      experience: {
        wow: 6,
        tipo: "zona verde",
        tempo: "45-90 min"
      },
      whenToGo: {
        best: "giorno",
        note: "buona quando vuoi stare bene senza forzare"
      },
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "variabile"
      },
      smartTips: [
        "Più utile come area che come spot singolo"
      ],
      image: "https://picsum.photos/seed/Ribeiro-Frio-Madeira/900/600"
    },

    {
      id: "secondary-9",
      name: "Curral das Freiras View",
      zone: "montagna",
      light: "giorno",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7119,
      lon: -16.9702,
      desc: "Valle chiusa e scenografica, molto rappresentativa dell’interno.",
      tip: "Funziona bene anche con meteo non perfetto.",
      experience: {
        wow: 7,
        tipo: "view valle interna",
        tempo: "20-30 min"
      },
      whenToGo: {
        best: "giorno",
        note: "buono anche con nuvole e atmosfera"
      },
      access: {
        difficolta: "facile",
        parcheggio: "vicino",
        walk: "breve"
      },
      smartTips: [
        "Buono se vuoi leggere l’isola interna senza fatica"
      ],
      image: "https://picsum.photos/seed/Curral-das-Freiras-Madeira/900/600"
    },

    {
      id: "secondary-10",
      name: "Prainha do Caniçal",
      zone: "est",
      light: "alba",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7397,
      lon: -16.7167,
      desc: "Piccola spiaggia vulcanica, molto buona per un inizio giornata tranquillo.",
      tip: "Meglio presto e con poca folla.",
      experience: {
        wow: 7,
        tipo: "spiaggia piccola",
        tempo: "30-60 min"
      },
      whenToGo: {
        best: "alba",
        note: "molto meglio di mattina"
      },
      access: {
        difficolta: "facile",
        parcheggio: "vicino",
        walk: "breve"
      },
      smartTips: [
        "Buona se vuoi partire morbido in zona est"
      ],
      image: "https://picsum.photos/seed/Prainha-do-Canical-Madeira/900/600"
    },

    {
      id: "secondary-11",
      name: "Paul da Serra",
      zone: "ovest",
      light: "tramonto",
      activity: "mtb",
      difficulty: "medio",
      level: "secondary",
      lat: 32.763,
      lon: -17.133,
      desc: "Altipiano aperto, più atmosfera e spazio che spot singolo.",
      tip: "Bellissimo con luce lunga e orizzonte largo.",
      experience: {
        wow: 7,
        tipo: "altipiano outdoor",
        tempo: "30-90 min"
      },
      whenToGo: {
        best: "tramonto",
        note: "molto valido con luce lunga"
      },
      access: {
        difficolta: "medio",
        parcheggio: "facile",
        walk: "variabile"
      },
      smartTips: [
        "Più da sensazione di luogo che da spot preciso"
      ],
      image: "https://picsum.photos/seed/Paul-da-Serra-Madeira/900/600"
    },

    {
      id: "secondary-12",
      name: "Funchal Old Town",
      zone: "sud",
      light: "sera",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.6482,
      lon: -16.9036,
      desc: "Centro storico utile per passeggiare, mangiare e respirare atmosfera urbana.",
      tip: "Buono tra tardo pomeriggio e sera.",
      experience: {
        wow: 6,
        tipo: "old town",
        tempo: "1-2h"
      },
      whenToGo: {
        best: "sera",
        note: "più piacevole quando l’aria si abbassa"
      },
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "variabile"
      },
      smartTips: [
        "Ottimo per dare ritmo e pausa al viaggio"
      ],
      image: "https://picsum.photos/seed/Funchal-Old-Town-Madeira/900/600"
    },

    {
      id: "secondary-13",
      name: "Botanical Garden",
      zone: "sud",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.6652,
      lon: -16.8905,
      desc: "Giardino ordinato e piacevole, utile per una giornata più soft.",
      tip: "Perfetto quando vuoi rallentare.",
      experience: {
        wow: 6,
        tipo: "giardino e vista",
        tempo: "1-2h"
      },
      whenToGo: {
        best: "giorno",
        note: "ottimo nelle giornate più tranquille"
      },
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "breve"
      },
      smartTips: [
        "Più da respiro che da highlight assoluto"
      ],
      image: "https://picsum.photos/seed/Botanical-Garden-Madeira/900/600"
    },

    {
      id: "secondary-14",
      name: "Monte Palace Area",
      zone: "sud",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.6765,
      lon: -16.9008,
      desc: "Giardini e scorci ricchi, bella tappa tranquilla.",
      tip: "Ideale se vuoi rallentare ma vedere comunque cose belle.",
      experience: {
        wow: 6,
        tipo: "giardini",
        tempo: "1-2h"
      },
      whenToGo: {
        best: "giorno",
        note: "molto buono in giornate soft"
      },
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "breve"
      },
      smartTips: [
        "Utile per varietà nel viaggio"
      ],
      image: "https://picsum.photos/seed/Monte-Palace-Madeira/900/600"
    },

    {
      id: "secondary-15",
      name: "Garajau Cristo Rei",
      zone: "sud",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.6372,
      lon: -16.8501,
      desc: "Scogliera e statua sul mare, molto valida verso sera e vicina a Funchal.",
      tip: "Bel tramonto semplice senza grossi spostamenti.",
      experience: {
        wow: 7,
        tipo: "viewpoint facile",
        tempo: "30-45 min"
      },
      whenToGo: {
        best: "tramonto",
        note: "molto bene a fine giornata"
      },
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "breve"
      },
      smartTips: [
        "Ottimo se sei basato vicino a Funchal"
      ],
      image: "https://picsum.photos/seed/Garajau-Cristo-Rei-Madeira/900/600"
    },

    {
      id: "secondary-16",
      name: "Praia Formosa",
      zone: "sud",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.6359,
      lon: -16.9492,
      desc: "Spiaggia urbana comoda, più utile che memorabile.",
      tip: "Perfetta se vuoi poco sbatti.",
      experience: {
        wow: 6,
        tipo: "spiaggia urbana",
        tempo: "45-60 min"
      },
      whenToGo: {
        best: "tramonto",
        note: "più da atmosfera finale che da wow"
      },
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "breve"
      },
      smartTips: [
        "Tappa da comodità, non da caccia allo spot"
      ],
      image: "https://picsum.photos/seed/Praia-Formosa-Madeira/900/600"
    },

    {
      id: "secondary-17",
      name: "Pico dos Barcelos",
      zone: "sud",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.6656,
      lon: -16.9372,
      desc: "Belvedere accessibile con vista ampia su Funchal.",
      tip: "Soluzione easy ma forte vicino alla città.",
      experience: {
        wow: 7,
        tipo: "view urbano ampio",
        tempo: "20-30 min"
      },
      whenToGo: {
        best: "tramonto",
        note: "luce serale sulla città funziona bene"
      },
      access: {
        difficolta: "facile",
        parcheggio: "diretto",
        walk: "1 min"
      },
      smartTips: [
        "Perfetto se vuoi vista grande senza fatica"
      ],
      image: "https://picsum.photos/seed/Pico-dos-Barcelos-Madeira/900/600"
    },

    {
      id: "secondary-18",
      name: "Miradouro do Pináculo",
      zone: "sud",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.6555,
      lon: -16.8794,
      desc: "Vista alta sulla città e sul lato est di Funchal.",
      tip: "Molto valido in luce serale.",
      experience: {
        wow: 7,
        tipo: "view urbano alto",
        tempo: "20-30 min"
      },
      whenToGo: {
        best: "tramonto",
        note: "funziona bene a fine giornata"
      },
      access: {
        difficolta: "facile",
        parcheggio: "vicino",
        walk: "1-2 min"
      },
      smartTips: [
        "Ottima alternativa a viewpoint più noti"
      ],
      image: "https://picsum.photos/seed/Pinaculo-Madeira/900/600"
    },

    {
      id: "secondary-19",
      name: "Miradouro da Portela",
      zone: "montagna",
      light: "giorno",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7399,
      lon: -16.8297,
      desc: "Belvedere molto leggibile su costa e rilievi del nord-est.",
      tip: "Ottima tappa di passaggio ben spesa.",
      experience: {
        wow: 7,
        tipo: "viewpoint intermedio",
        tempo: "15-25 min"
      },
      whenToGo: {
        best: "giorno",
        note: "molto valido con buona visibilità"
      },
      access: {
        difficolta: "facile",
        parcheggio: "facile",
        walk: "1 min"
      },
      smartTips: [
        "Ottimo spot intermedio da non sottovalutare"
      ],
      image: "https://picsum.photos/seed/Portela-Madeira/900/600"
    },

    {
      id: "secondary-20",
      name: "Machico Bay",
      zone: "est",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7167,
      lon: -16.7667,
      desc: "Baia ordinata e piacevole, utile come stop soft o pausa logistica.",
      tip: "Buona se vuoi respirare tra due spot forti.",
      experience: {
        wow: 6,
        tipo: "baia relax",
        tempo: "30-60 min"
      },
      whenToGo: {
        best: "giorno",
        note: "funziona come pausa"
      },
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "breve"
      },
      smartTips: [
        "Buona come pausa furba"
      ],
      image: "https://picsum.photos/seed/Machico-Bay-Madeira/900/600"
    },

    {
      id: "secondary-21",
      name: "Rocha do Navio",
      zone: "nord",
      light: "giorno",
      activity: "view",
      difficulty: "medio",
      level: "secondary",
      lat: 32.8164,
      lon: -16.885,
      desc: "Scogliera e teleferica, molto scenica e distintiva.",
      tip: "Molto valida come tappa nord se vuoi qualcosa di diverso.",
      experience: {
        wow: 7,
        tipo: "cliff con teleferica",
        tempo: "30-60 min"
      },
      whenToGo: {
        best: "giorno",
        note: "buona con visibilità pulita"
      },
      access: {
        difficolta: "medio",
        parcheggio: "facile",
        walk: "breve"
      },
      smartTips: [
        "Interessante se vuoi un nord meno banale"
      ],
      image: "https://picsum.photos/seed/Rocha-do-Navio-Madeira/900/600"
    },

    {
      id: "secondary-22",
      name: "Paul do Mar",
      zone: "sud",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7605,
      lon: -17.2291,
      desc: "Costa ruvida e piacevole, molto buona per una chiusura semplice ma con carattere.",
      tip: "Atmosfera molto buona a fine giornata.",
      experience: {
        wow: 7,
        tipo: "costa relax",
        tempo: "45-60 min"
      },
      whenToGo: {
        best: "tramonto",
        note: "molto bello a fine giornata"
      },
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "breve"
      },
      smartTips: [
        "Più atmosfera che spot shock"
      ],
      image: "https://picsum.photos/seed/Paul-do-Mar-Madeira/900/600"
    },

    {
      id: "secondary-23",
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
      experience: {
        wow: 7,
        tipo: "view costiera",
        tempo: "30-45 min"
      },
      whenToGo: {
        best: "tramonto",
        note: "ottimo per una chiusura semplice"
      },
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "breve"
      },
      smartTips: [
        "Buono se vuoi sud-ovest bello ma non pesante"
      ],
      image: "https://picsum.photos/seed/Jardim-do-Mar-View-Madeira/900/600"
    },

    {
      id: "secondary-24",
      name: "Levada do Risco",
      zone: "ovest",
      light: "giorno",
      activity: "trekking",
      difficulty: "facile",
      level: "secondary",
      lat: 32.7528,
      lon: -17.1321,
      desc: "Percorso relativamente breve verso una cascata scenica.",
      tip: "Molto facile da infilare in giornata.",
      experience: {
        wow: 7,
        tipo: "mini trekking con cascata",
        tempo: "1-2h"
      },
      whenToGo: {
        best: "giorno",
        note: "ottima in combinazione con altre tappe Rabacal"
      },
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "accesso iniziale presente"
      },
      smartTips: [
        "Usalo come pezzo furbo, non come unico highlight"
      ],
      image: "https://picsum.photos/seed/Risco-Madeira/900/600"
    }
  ]
};