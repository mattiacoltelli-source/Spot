window.APP_SPOTS = {
  region: "Riva del Garda",
  center: [45.885, 10.842],
  zoom: 11,
  storageKeys: {
    favorites: "riva_favorites_v2",
    planner: "riva_day_planner_v2"
  },

  topWowNames: [
    "Punta Larici",
    "Sentiero del Ponale",
    "Monte Brione",
    "Bastione di Riva",
    "Monte Altissimo",
    "Lago di Tenno",
    "Busatte Tempesta",
    "Tremalzo Panorama",
    "Belvedere di Pregasina",
    "Lago di Ledro"
  ],

  topSunsetNames: [
    "Monte Brione",
    "Bastione di Riva",
    "Punta Larici",
    "Lungolago Riva",
    "Belvedere di Nago",
    "Monte Altissimo",
    "Torbole Waterfront",
    "Belvedere di Pregasina",
    "Lido di Riva",
    "Lago di Tenno"
  ],

  spots: [
    {
      id: "core-0",
      name: "Punta Larici",
      zone: "ovest",
      light: "tramonto",
      activity: "trekking",
      difficulty: "medio",
      level: "core",
      lat: 45.8598,
      lon: 10.8075,
      desc: "Il viewpoint più forte della zona, balcone naturale enorme sopra il Garda.",
      tip: "Se vuoi il colpo grosso, qui vai fortissimo soprattutto nel tardo pomeriggio.",
      experience: {
        wow: 10,
        tipo: "trekking panoramico",
        tempo: "2-4h",
        mood: "epico"
      },
      whenToGo: {
        best: "tramonto",
        note: "luce bassa e cielo abbastanza pulito alzano tantissimo la resa"
      },
      whenToAvoid: [
        "vento forte",
        "temporali",
        "visibilità molto chiusa"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "più comodo lato Pregasina",
        walk: "variabile in base al punto di partenza",
        strada: "asfaltata fino ai punti base"
      },
      crowd: {
        best: "giorni feriali o arrivo anticipato",
        worst: "tramonti perfetti e weekend"
      },
      smartTips: [
        "Perfetto come highlight del giorno",
        "Meglio non arrivare all'ultimo minuto",
        "Ultimo tratto da rispettare se il terreno è brutto"
      ],
      image: "https://picsum.photos/seed/Punta-Larici-Riva/900/600"
    },

    {
      id: "core-1",
      name: "Sentiero del Ponale",
      zone: "ovest",
      light: "giorno",
      activity: "mtb",
      difficulty: "medio",
      level: "core",
      lat: 45.8719,
      lon: 10.8501,
      desc: "La classica strada panoramica sul lago: iconica, facile da capire, fortissima da vivere.",
      tip: "Vai presto se vuoi goderla davvero meglio.",
      experience: {
        wow: 10,
        tipo: "bike / hike panoramico",
        tempo: "1-3h",
        mood: "iconico"
      },
      whenToGo: {
        best: "giorno",
        note: "molto bene la mattina o in ore non troppo piene"
      },
      whenToAvoid: [
        "ore centrali affollate",
        "giorni con meteo instabile forte"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "facile da Riva",
        walk: "0 min",
        strada: "asfaltata e sterrata"
      },
      crowd: {
        best: "presto",
        worst: "metà mattina e pomeriggio nei giorni forti"
      },
      smartTips: [
        "Uno dei migliori spot da spiegare a chi non conosce la zona",
        "Ottimo sia in MTB che a piedi",
        "Più atmosfera di movimento che spot statico"
      ],
      image: "https://picsum.photos/seed/Ponale-Riva/900/600"
    },

    {
      id: "core-2",
      name: "Monte Brione",
      zone: "lago",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 45.8892,
      lon: 10.8595,
      desc: "Vista altissima ma accessibile su Riva, Torbole e tutto il lago nord.",
      tip: "Uno dei migliori spot easy della zona.",
      experience: {
        wow: 9,
        tipo: "viewpoint facile",
        tempo: "30-90 min",
        mood: "panorama pulito"
      },
      whenToGo: {
        best: "tramonto",
        note: "molto forte con luce morbida e aria pulita"
      },
      whenToAvoid: [
        "luce dura",
        "momenti molto pieni"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio in base al lato",
        walk: "breve",
        strada: "asfaltata"
      },
      crowd: {
        best: "tardo pomeriggio con un po' di anticipo",
        worst: "sunset popolari"
      },
      smartTips: [
        "Perfetto se vuoi resa alta con sforzo basso",
        "Buono anche per far vedere l'app a qualcuno",
        "Spot molto leggibile"
      ],
      image: "https://picsum.photos/seed/Monte-Brione-Riva/900/600"
    },

    {
      id: "core-3",
      name: "Bastione di Riva",
      zone: "lago",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 45.8871,
      lon: 10.8404,
      desc: "Vista alta su Riva del Garda, bellissima per finale di giornata senza troppa fatica.",
      tip: "Molto bene in golden hour.",
      experience: {
        wow: 9,
        tipo: "view urbano-lago",
        tempo: "30-75 min",
        mood: "forte ma semplice"
      },
      whenToGo: {
        best: "tramonto",
        note: "top come chiusura facile"
      },
      whenToAvoid: [
        "ore centrali",
        "meteo piatto e spento"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "molto comodo in città",
        walk: "breve salita",
        strada: "asfaltata"
      },
      crowd: {
        best: "feriali o arrivo anticipato",
        worst: "tramonti perfetti"
      },
      smartTips: [
        "Ottimo piano B se non vuoi muoverti troppo",
        "Molto utile come spot sunset rapido",
        "Combina bene con centro storico"
      ],
      image: "https://picsum.photos/seed/Bastione-Riva/900/600"
    },

    {
      id: "core-4",
      name: "Monte Altissimo",
      zone: "montagna",
      light: "tramonto",
      activity: "trekking",
      difficulty: "impegnativo",
      level: "core",
      lat: 45.8962,
      lon: 10.8508,
      desc: "Grande classico di quota, con vista enorme sul Garda e sensazione vera di montagna.",
      tip: "Da fare quando vuoi la giornata seria.",
      experience: {
        wow: 10,
        tipo: "trekking di quota",
        tempo: "4-7h",
        mood: "grande panorama"
      },
      whenToGo: {
        best: "giorno / tramonto",
        note: "meglio con buona visibilità e poca instabilità"
      },
      whenToAvoid: [
        "temporali",
        "vento forte",
        "giorni di scarsa visibilità"
      ],
      access: {
        difficolta: "impegnativo",
        parcheggio: "variabile in base all'accesso scelto",
        walk: "lungo",
        strada: "asfaltata fino ai punti base"
      },
      crowd: {
        best: "partenza presto",
        worst: "giorni top di stagione"
      },
      smartTips: [
        "Da trattare come esperienza centrale",
        "Non sprecarlo in mezza giornata scarsa",
        "Se il cielo è chiuso, valuta un piano più basso"
      ],
      image: "https://picsum.photos/seed/Monte-Altissimo-Riva/900/600"
    },

    {
      id: "core-5",
      name: "Lago di Tenno",
      zone: "nord",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "core",
      lat: 45.9381,
      lon: 10.8109,
      desc: "Lago turchese molto forte visivamente, ottimo per pausa bella e facile.",
      tip: "La mattina rende benissimo.",
      experience: {
        wow: 9,
        tipo: "lago relax",
        tempo: "1-2h",
        mood: "pulito e scenico"
      },
      whenToGo: {
        best: "mattina / giorno",
        note: "molto bello con luce ancora non dura"
      },
      whenToAvoid: [
        "momenti troppo pieni",
        "giorni molto caldi con molta gente"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "breve",
        strada: "asfaltata"
      },
      crowd: {
        best: "presto",
        worst: "metà giornata in alta stagione"
      },
      smartTips: [
        "Ottimo se vuoi un wow facile",
        "Più da equilibrio e bellezza che da sport duro",
        "Combina bene con Canale di Tenno"
      ],
      image: "https://picsum.photos/seed/Lago-di-Tenno-Riva/900/600"
    },

    {
      id: "core-6",
      name: "Busatte Tempesta",
      zone: "est",
      light: "giorno",
      activity: "trekking",
      difficulty: "medio",
      level: "core",
      lat: 45.8823,
      lon: 10.8926,
      desc: "Percorso spettacolare sopra il lago, con scale, balconi e passaggi molto scenici.",
      tip: "Molto valido se vuoi panorama continuo e cammino appagante.",
      experience: {
        wow: 9,
        tipo: "trekking panoramico",
        tempo: "2-4h",
        mood: "scenografico"
      },
      whenToGo: {
        best: "giorno",
        note: "meglio con visibilità ampia e temperature accettabili"
      },
      whenToAvoid: [
        "ore troppo calde",
        "temporali",
        "terreno scivoloso"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "comodo lato Torbole",
        walk: "0 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "presto",
        worst: "fasce più comode di metà giornata"
      },
      smartTips: [
        "Ottimo da proporre a chi vuole wow senza fare una cima vera",
        "Molto fotogenico",
        "Meglio non farlo in pieno forno"
      ],
      image: "https://picsum.photos/seed/Busatte-Tempesta-Riva/900/600"
    },

    {
      id: "core-7",
      name: "Lago di Ledro",
      zone: "nord",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "core",
      lat: 45.8788,
      lon: 10.7388,
      desc: "Uno dei laghi più belli e facili da godere della zona, perfetto per rallentare bene.",
      tip: "Molto utile nelle giornate di equilibrio.",
      experience: {
        wow: 8,
        tipo: "lago e passeggiata",
        tempo: "1-3h",
        mood: "rilassato"
      },
      whenToGo: {
        best: "giorno",
        note: "bello quasi sempre, soprattutto in momenti tranquilli"
      },
      whenToAvoid: [
        "giorni super pieni"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "breve",
        strada: "asfaltata"
      },
      crowd: {
        best: "mattina o tardo pomeriggio",
        worst: "metà giornata"
      },
      smartTips: [
        "Molto buono come reset della giornata",
        "Più esperienza piacevole che spot estremo",
        "Funziona bene anche con meteo non perfetto"
      ],
      image: "https://picsum.photos/seed/Ledro-Riva/900/600"
    },

    {
      id: "core-8",
      name: "Tremalzo Panorama",
      zone: "ovest",
      light: "giorno",
      activity: "mtb",
      difficulty: "impegnativo",
      level: "core",
      lat: 45.8442,
      lon: 10.7179,
      desc: "Zona iconica per MTB seria, panorami enormi e sensazione outdoor vera.",
      tip: "Quando vuoi bike forte, qui il livello sale.",
      experience: {
        wow: 9,
        tipo: "mtb iconica",
        tempo: "4-7h",
        mood: "adrenalinico"
      },
      whenToGo: {
        best: "giorno",
        note: "da usare con gamba buona e meteo stabile"
      },
      whenToAvoid: [
        "temporali",
        "stanchezza alta",
        "giornate troppo corte"
      ],
      access: {
        difficolta: "impegnativo",
        parcheggio: "variabile",
        walk: "0 min",
        strada: "mista"
      },
      crowd: {
        best: "giorni feriali",
        worst: "alta stagione bike"
      },
      smartTips: [
        "Un must per chi ama la MTB",
        "Non da inserire a caso in una giornata piena",
        "Più esperienza che spot singolo"
      ],
      image: "https://picsum.photos/seed/Tremalzo-Riva/900/600"
    },

    {
      id: "core-9",
      name: "Belvedere di Pregasina",
      zone: "ovest",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 45.8726,
      lon: 10.8232,
      desc: "Balcone incredibile sul lago, facilissimo da usare e molto forte nel finale di giornata.",
      tip: "Ottimo se vuoi wow rapido.",
      experience: {
        wow: 8,
        tipo: "viewpoint rapido",
        tempo: "20-40 min",
        mood: "forte e semplice"
      },
      whenToGo: {
        best: "tramonto",
        note: "top come pre-sunset o sunset easy"
      },
      whenToAvoid: [
        "meteo spento",
        "luce dura"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "minimo",
        strada: "asfaltata"
      },
      crowd: {
        best: "un po' prima del tramonto",
        worst: "fasce più famose"
      },
      smartTips: [
        "Molto utile come spot furbo",
        "Grande resa con poco sforzo",
        "Perfetto da inserire in una giornata piena"
      ],
      image: "https://picsum.photos/seed/Pregasina-Riva/900/600"
    },

    {
      id: "core-10",
      name: "Monte Baldo",
      zone: "montagna",
      light: "giorno",
      activity: "trekking",
      difficulty: "medio",
      level: "core",
      lat: 45.7588,
      lon: 10.8104,
      desc: "Fuori dal cuore di Riva ma fortissimo per trekking e panorami di grande scala sul Garda.",
      tip: "Se vuoi ampliare il raggio dell'app con una montagna davvero valida, qui ci sta benissimo.",
      experience: {
        wow: 9,
        tipo: "montagna panoramica",
        tempo: "3-6h",
        mood: "grande respiro"
      },
      whenToGo: {
        best: "giorno",
        note: "molto bene con cielo aperto e visibilità ampia"
      },
      whenToAvoid: [
        "giorni chiusi",
        "partenze troppo tardive"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "variabile",
        walk: "variabile",
        strada: "asfaltata fino agli accessi"
      },
      crowd: {
        best: "feriali o partenze presto",
        worst: "giorni top di stagione"
      },
      smartTips: [
        "Non è Riva stretta, ma è coerentissimo nel raggio Garda",
        "Da usare come modulo premium più ampio",
        "Alza tantissimo il valore dell'app"
      ],
      image: "https://picsum.photos/seed/Monte-Baldo-Riva/900/600"
    },

    {
      id: "core-11",
      name: "Lungolago Riva",
      zone: "lago",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "core",
      lat: 45.8836,
      lon: 10.8416,
      desc: "Passeggiata lago super semplice ma fortissima nel mood, soprattutto per chiudere il giorno bene.",
      tip: "Ottimo finale senza sbatti.",
      experience: {
        wow: 7,
        tipo: "lungolago",
        tempo: "30-90 min",
        mood: "soft"
      },
      whenToGo: {
        best: "tramonto / sera",
        note: "perfetto quando vuoi bellezza facile"
      },
      whenToAvoid: [
        "solo se cerchi sport duro"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "comodo in città",
        walk: "0 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "quasi sempre",
        worst: "momenti centrali turistici"
      },
      smartTips: [
        "Molto utile per equilibrio giornata",
        "Semplice ma da non sottovalutare",
        "Funziona anche come spot demo"
      ],
      image: "https://picsum.photos/seed/Lungolago-Riva/900/600"
    },

    {
      id: "core-12",
      name: "Torbole Waterfront",
      zone: "est",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "core",
      lat: 45.8718,
      lon: 10.8751,
      desc: "Lungolago di Torbole, semplice ma molto piacevole per chiudere la giornata con vista e aria buona.",
      tip: "Perfetto se sei già lato Torbole.",
      experience: {
        wow: 7,
        tipo: "waterfront relax",
        tempo: "30-75 min",
        mood: "rilassato"
      },
      whenToGo: {
        best: "tramonto / sera",
        note: "bello soprattutto come chiusura semplice"
      },
      whenToAvoid: [
        "solo se cerchi spot più forti"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "medio",
        walk: "0 min",
        strada: "asfaltata"
      },
      crowd: {
        best: "feriali",
        worst: "weekend e momenti top"
      },
      smartTips: [
        "Utile più che estremo",
        "Buon equilibrio nell'app",
        "Perfetto come piano leggero"
      ],
      image: "https://picsum.photos/seed/Torbole-Waterfront-Riva/900/600"
    },

    {
      id: "core-13",
      name: "Canoa Garda Nord",
      zone: "lago",
      light: "alba",
      activity: "water",
      difficulty: "facile",
      level: "core",
      lat: 45.8852,
      lon: 10.8431,
      desc: "Esperienza molto bella e semplice in canoa sul lago, perfetta in acqua calma.",
      tip: "Mattina presto o momenti tranquilli sono il top.",
      experience: {
        wow: 8,
        tipo: "canoa / kayak",
        tempo: "1-2h",
        mood: "pulito e leggero"
      },
      whenToGo: {
        best: "alba / mattina",
        note: "molto meglio con acqua calma e vento basso"
      },
      whenToAvoid: [
        "vento forte",
        "acqua molto disturbata"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "comodo in zona lago",
        walk: "minimo",
        strada: "asfaltata"
      },
      crowd: {
        best: "presto",
        worst: "momenti più caotici"
      },
      smartTips: [
        "Una delle migliori micro-esperienze acqua",
        "Aggiunge varietà vera all'app",
        "Molto bella da far vedere"
      ],
      image: "https://picsum.photos/seed/Canoa-Garda-Riva/900/600"
    },

    {
      id: "core-14",
      name: "SUP Riva Morning",
      zone: "lago",
      light: "alba",
      activity: "water",
      difficulty: "facile",
      level: "core",
      lat: 45.8847,
      lon: 10.8424,
      desc: "SUP semplice e molto scenico sul lago, ottimo se vuoi una partenza diversa.",
      tip: "Alba o mattina presto rendono tutto più bello.",
      experience: {
        wow: 7,
        tipo: "sup lago",
        tempo: "1h",
        mood: "calmo"
      },
      whenToGo: {
        best: "alba / mattina",
        note: "top con acqua più liscia"
      },
      whenToAvoid: [
        "vento forte",
        "lago troppo mosso"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "facile",
        walk: "minimo",
        strada: "asfaltata"
      },
      crowd: {
        best: "prestissimo",
        worst: "momenti popolari"
      },
      smartTips: [
        "Perfetto come experience piccola ma bella",
        "Molto instagrammabile senza essere pesante",
        "Da usare come extra sportivo facile"
      ],
      image: "https://picsum.photos/seed/SUP-Riva-Riva/900/600"
    },

    {
      id: "core-15",
      name: "Rafting Sarca",
      zone: "nord",
      light: "giorno",
      activity: "water",
      difficulty: "medio",
      level: "core",
      lat: 45.9118,
      lon: 10.8828,
      desc: "Esperienza acqua più dinamica sul Sarca, diversa dal classico lago.",
      tip: "Molto valida se vuoi varietà vera nel viaggio.",
      experience: {
        wow: 7,
        tipo: "rafting guidato",
        tempo: "2-3h",
        mood: "adrenalinico soft"
      },
      whenToGo: {
        best: "giorno",
        note: "sempre meglio come esperienza organizzata"
      },
      whenToAvoid: [
        "stanchezza alta",
        "giornata già troppo piena"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "dipende dal centro attività",
        walk: "minimo",
        strada: "asfaltata"
      },
      crowd: {
        best: "prenotato bene",
        worst: "alta stagione improvvisata"
      },
      smartTips: [
        "Non è il cuore dell'app, ma come micro-modulo è forte",
        "Molto meglio se trattato come attività guidata",
        "Perfetto per cambiare ritmo"
      ],
      image: "https://picsum.photos/seed/Rafting-Sarca-Riva/900/600"
    },

    {
      id: "core-16",
      name: "Canyoning Base",
      zone: "nord",
      light: "giorno",
      activity: "water",
      difficulty: "medio",
      level: "core",
      lat: 45.9234,
      lon: 10.8594,
      desc: "Modulo canyoning base per chi vuole un’attività acqua più avventura ma non dominante.",
      tip: "Sempre meglio guidato.",
      experience: {
        wow: 7,
        tipo: "canyoning leggero",
        tempo: "2-4h",
        mood: "avventura"
      },
      whenToGo: {
        best: "giorno",
        note: "come esperienza dedicata, non infilata male"
      },
      whenToAvoid: [
        "giornata già pesante",
        "meteo incerto forte"
      ],
      access: {
        difficolta: "medio",
        parcheggio: "variabile",
        walk: "variabile",
        strada: "mista"
      },
      crowd: {
        best: "con prenotazione ben gestita",
        worst: "improvvisazione"
      },
      smartTips: [
        "Lo terrei piccolo ma presente",
        "Ottimo come esperienza diversa",
        "Da non mettere al centro dell'app"
      ],
      image: "https://picsum.photos/seed/Canyoning-Riva/900/600"
    },

    {
      id: "core-17",
      name: "Arco Castle View",
      zone: "nord",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 45.9188,
      lon: 10.8854,
      desc: "Vista molto bella in area Arco, utile per dare varietà rispetto al lago puro.",
      tip: "Bella nel tardo pomeriggio.",
      experience: {
        wow: 8,
        tipo: "view storico-panoramico",
        tempo: "45-90 min",
        mood: "forte ma semplice"
      },
      whenToGo: {
        best: "tramonto",
        note: "ottimo con luce laterale"
      },
      whenToAvoid: [
        "ore centrali forti"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "comodo in Arco",
        walk: "breve salita",
        strada: "asfaltata"
      },
      crowd: {
        best: "feriali",
        worst: "momenti turistici classici"
      },
      smartTips: [
        "Molto valido per ampliare l'app oltre Riva stretta",
        "Piace molto anche a chi non è super sportivo",
        "Grande resa senza grossa fatica"
      ],
      image: "https://picsum.photos/seed/Arco-Castle-Riva/900/600"
    },

    {
      id: "core-18",
      name: "Canale di Tenno",
      zone: "nord",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "core",
      lat: 45.9391,
      lon: 10.8207,
      desc: "Borgo molto bello da inserire vicino al Lago di Tenno, perfetto per aggiungere varietà vera.",
      tip: "Funziona bene come tappa complementare.",
      experience: {
        wow: 7,
        tipo: "borgo storico",
        tempo: "30-75 min",
        mood: "curato"
      },
      whenToGo: {
        best: "giorno",
        note: "ottimo in abbinata a Tenno"
      },
      whenToAvoid: [
        "solo se vuoi una giornata solo sport"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "breve",
        strada: "asfaltata"
      },
      crowd: {
        best: "quasi sempre",
        worst: "fasce più turistiche"
      },
      smartTips: [
        "Aggiunge qualità travel all'app",
        "Molto utile per bilanciare le giornate",
        "Non è sport, ma è ottimo"
      ],
      image: "https://picsum.photos/seed/Canale-Tenno-Riva/900/600"
    },

    {
      id: "core-19",
      name: "Belvedere di Nago",
      zone: "est",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "core",
      lat: 45.8794,
      lon: 10.8889,
      desc: "Viewpoint molto valido sopra Torbole, facile da usare e utile come stop intelligente.",
      tip: "Molto bello con luce serale.",
      experience: {
        wow: 7,
        tipo: "viewpoint rapido",
        tempo: "20-40 min",
        mood: "facile"
      },
      whenToGo: {
        best: "tramonto",
        note: "molto meglio nella fascia serale"
      },
      whenToAvoid: [
        "luce dura",
        "meteo spento"
      ],
      access: {
        difficolta: "facile",
        parcheggio: "comodo",
        walk: "minimo",
        strada: "asfaltata"
      },
      crowd: {
        best: "feriali",
        worst: "tramonti migliori"
      },
      smartTips: [
        "Ottimo spot semplice ma utile",
        "Perfetto per una chiusura veloce",
        "Molto coerente nel raggio Riva-Torbole"
      ],
      image: "https://picsum.photos/seed/Nago-Riva/900/600"
    },

    {
      id: "secondary-0",
      name: "San Pietro Viewpoint",
      zone: "lago",
      light: "tramonto",
      activity: "view",
      difficulty: "medio",
      level: "secondary",
      lat: 45.8891,
      lon: 10.8478,
      desc: "Viewpoint classico sopra Riva, ottimo compromesso tra accesso e resa.",
      tip: "Molto valido in fascia serale.",
      image: "https://picsum.photos/seed/San-Pietro-Riva/900/600"
    },
    {
      id: "secondary-1",
      name: "Monte Brione Trail",
      zone: "lago",
      light: "giorno",
      activity: "trekking",
      difficulty: "facile",
      level: "secondary",
      lat: 45.8907,
      lon: 10.8581,
      desc: "Versione più camminata del Brione, ottima per muoversi senza esagerare.",
      tip: "Molto valida per mezza giornata.",
      image: "https://picsum.photos/seed/Monte-Brione-Trail-Riva/900/600"
    },
    {
      id: "secondary-2",
      name: "Porto San Nicolò View",
      zone: "lago",
      light: "tramonto",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 45.8789,
      lon: 10.8544,
      desc: "Punto vista facile lato Riva, utile come bonus serale.",
      tip: "Più pratico che estremo.",
      image: "https://picsum.photos/seed/Porto-San-Nicolo-Riva/900/600"
    },
    {
      id: "secondary-3",
      name: "Lido di Riva",
      zone: "lago",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 45.8818,
      lon: 10.8467,
      desc: "Spot lago facile e piacevole per abbassare il ritmo.",
      tip: "Molto valido come chiusura soft.",
      image: "https://picsum.photos/seed/Lido-Riva-Riva/900/600"
    },
    {
      id: "secondary-4",
      name: "Old Town Riva",
      zone: "lago",
      light: "sera",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 45.8862,
      lon: 10.8413,
      desc: "Passeggiata nel centro di Riva, utile per equilibrio e chiusura giornata.",
      tip: "Più atmosfera che sport, ma molto utile.",
      image: "https://picsum.photos/seed/Old-Town-Riva/900/600"
    },
    {
      id: "secondary-5",
      name: "Busatte Park Area",
      zone: "est",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 45.8787,
      lon: 10.8859,
      desc: "Zona verde sopra Torbole, utile come tappa easy o partenza verso sentieri.",
      tip: "Buona base semplice.",
      image: "https://picsum.photos/seed/Busatte-Park-Riva/900/600"
    },
    {
      id: "secondary-6",
      name: "Tempesta Lago",
      zone: "est",
      light: "tramonto",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 45.8608,
      lon: 10.8928,
      desc: "Zona più tranquilla del Garda estremo nord-est, piacevole come sosta.",
      tip: "Bella se vuoi aria diversa.",
      image: "https://picsum.photos/seed/Tempesta-Riva/900/600"
    },
    {
      id: "secondary-7",
      name: "Arco Olive Trail",
      zone: "nord",
      light: "giorno",
      activity: "trekking",
      difficulty: "facile",
      level: "secondary",
      lat: 45.9181,
      lon: 10.8882,
      desc: "Cammino facile e piacevole nell'area di Arco.",
      tip: "Buona scelta easy.",
      image: "https://picsum.photos/seed/Arco-Olive-Riva/900/600"
    },
    {
      id: "secondary-8",
      name: "Ceniga Riverside",
      zone: "nord",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 45.9362,
      lon: 10.9161,
      desc: "Zona fiume molto tranquilla e piacevole, utile come stop diverso dal lago.",
      tip: "Molto soft.",
      image: "https://picsum.photos/seed/Ceniga-Riva/900/600"
    },
    {
      id: "secondary-9",
      name: "Varone Area",
      zone: "nord",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 45.9018,
      lon: 10.8516,
      desc: "Area utile e piacevole, buona come tappa intermedia.",
      tip: "Più utile che clamorosa.",
      image: "https://picsum.photos/seed/Varone-Riva/900/600"
    },
    {
      id: "secondary-10",
      name: "Walking Lago di Ledro",
      zone: "nord",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "secondary",
      lat: 45.8793,
      lon: 10.7441,
      desc: "Passeggiata lago molto semplice ma molto godibile.",
      tip: "Ottima se vuoi abbassare il ritmo.",
      image: "https://picsum.photos/seed/Walking-Ledro-Riva/900/600"
    },
    {
      id: "secondary-11",
      name: "Ledro Bike Tour",
      zone: "nord",
      light: "giorno",
      activity: "mtb",
      difficulty: "facile",
      level: "secondary",
      lat: 45.8761,
      lon: 10.7479,
      desc: "Tour bike facile e molto piacevole attorno al Ledro.",
      tip: "Perfetto per giornata più morbida.",
      image: "https://picsum.photos/seed/Ledro-Bike-Riva/900/600"
    },
    {
      id: "secondary-12",
      name: "Bocca di Trat",
      zone: "montagna",
      light: "giorno",
      activity: "trekking",
      difficulty: "medio",
      level: "secondary",
      lat: 45.8677,
      lon: 10.7501,
      desc: "Area di quota molto forte per cammino, pascoli e grande sensazione di spazio.",
      tip: "Molto buona come alternativa meno mainstream.",
      image: "https://picsum.photos/seed/Bocca-di-Trat-Riva/900/600"
    },
    {
      id: "secondary-13",
      name: "Belvedere di Dromaé",
      zone: "nord",
      light: "tramonto",
      activity: "view",
      difficulty: "medio",
      level: "secondary",
      lat: 45.8872,
      lon: 10.7368,
      desc: "Belvedere molto forte sopra il Ledro, ampio e pulito.",
      tip: "Molto bello nel tardo pomeriggio.",
      image: "https://picsum.photos/seed/Dromae-Riva/900/600"
    },
    {
      id: "secondary-14",
      name: "Madonnina di Besta",
      zone: "nord",
      light: "tramonto",
      activity: "view",
      difficulty: "medio",
      level: "secondary",
      lat: 45.8878,
      lon: 10.7268,
      desc: "Viewpoint sulla valle di Ledro molto valido e intelligente.",
      tip: "Ottimo se vuoi un punto meno scontato.",
      image: "https://picsum.photos/seed/Besta-Riva/900/600"
    },
    {
      id: "secondary-15",
      name: "Monte Corno Ledro",
      zone: "montagna",
      light: "giorno",
      activity: "trekking",
      difficulty: "impegnativo",
      level: "secondary",
      lat: 45.9051,
      lon: 10.7246,
      desc: "Cima forte sopra il Ledro, molto bella se vuoi una montagna vera fuori dal mainstream più noto.",
      tip: "Più da giornata seria.",
      image: "https://picsum.photos/seed/Monte-Corno-Ledro-Riva/900/600"
    },
    {
      id: "secondary-16",
      name: "Kayak Easy Session",
      zone: "lago",
      light: "mattina",
      activity: "water",
      difficulty: "facile",
      level: "secondary",
      lat: 45.8849,
      lon: 10.8444,
      desc: "Versione facile acqua per chi vuole provare kayak senza complicarsi.",
      tip: "Molto meglio con poco vento.",
      image: "https://picsum.photos/seed/Kayak-Riva/900/600"
    },
    {
      id: "secondary-17",
      name: "SUP Sunset Session",
      zone: "lago",
      light: "tramonto",
      activity: "water",
      difficulty: "facile",
      level: "secondary",
      lat: 45.8839,
      lon: 10.8435,
      desc: "SUP semplice e bello come esperienza serale.",
      tip: "Bella se l'acqua è calma.",
      image: "https://picsum.photos/seed/SUP-Sunset-Riva/900/600"
    },
    {
      id: "secondary-18",
      name: "Tremalzo Access View",
      zone: "ovest",
      light: "giorno",
      activity: "view",
      difficulty: "medio",
      level: "secondary",
      lat: 45.8461,
      lon: 10.7232,
      desc: "Punto panoramico in area Tremalzo, utile se vuoi il wow bike senza fare tutto il mega giro.",
      tip: "Molto buono come modulo più leggero.",
      image: "https://picsum.photos/seed/Tremalzo-Access-Riva/900/600"
    },
    {
      id: "secondary-19",
      name: "Monte Baldo Easy View",
      zone: "montagna",
      light: "giorno",
      activity: "view",
      difficulty: "facile",
      level: "secondary",
      lat: 45.7568,
      lon: 10.8088,
      desc: "Versione più semplice del modulo Baldo, per chi vuole la quota senza fare il trekking grande.",
      tip: "Ottima variante smart.",
      image: "https://picsum.photos/seed/Baldo-Easy-Riva/900/600"
    },

    {
      id: "extra-0",
      name: "Spiaggia Sabbioni",
      zone: "lago",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "extra",
      lat: 45.8802,
      lon: 10.8493,
      desc: "Stop facile sul lago.",
      tip: "Buono per rallentare.",
      image: "https://picsum.photos/seed/Sabbioni-Riva/900/600"
    },
    {
      id: "extra-1",
      name: "Marina Riva Pause",
      zone: "lago",
      light: "sera",
      activity: "relax",
      difficulty: "facile",
      level: "extra",
      lat: 45.8857,
      lon: 10.8408,
      desc: "Pausa semplice in zona marina.",
      tip: "Chiude bene una giornata easy.",
      image: "https://picsum.photos/seed/Marina-Riva/900/600"
    },
    {
      id: "extra-2",
      name: "Nago Short View",
      zone: "est",
      light: "giorno",
      activity: "view",
      difficulty: "facile",
      level: "extra",
      lat: 45.8791,
      lon: 10.8894,
      desc: "Vista rapida ma valida sopra Torbole.",
      tip: "Da infilare se passi di lì.",
      image: "https://picsum.photos/seed/Nago-Short-Riva/900/600"
    },
    {
      id: "extra-3",
      name: "Mezzolago Stop",
      zone: "nord",
      light: "giorno",
      activity: "relax",
      difficulty: "facile",
      level: "extra",
      lat: 45.8886,
      lon: 10.7338,
      desc: "Pausa tranquilla in area Ledro.",
      tip: "Piccolo stop piacevole.",
      image: "https://picsum.photos/seed/Mezzolago-Riva/900/600"
    },
    {
      id: "extra-4",
      name: "Gelato vista lago",
      zone: "lago",
      light: "sera",
      activity: "relax",
      difficulty: "facile",
      level: "extra",
      lat: 45.8834,
      lon: 10.8412,
      desc: "Stop finale facile sul lago.",
      tip: "Perfetto come chiusura leggera.",
      image: "https://picsum.photos/seed/Gelato-Lago-Riva/900/600"
    }
  ]
};