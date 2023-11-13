const DETRCodes = [
  {
    id: 12,
    text: "NETWORK RAIL",
  },
  {
    id: 15,
    text: "HIGHWAYS AGENCY",
  },
  {
    id: 16,
    text: "WELSH OFFICE",
  },
  {
    id: 19,
    text: "SCOTTISH OFFICE",
  },
  {
    id: 20,
    text: "TRANSPORT FOR LONDON",
  },
  {
    id: 22,
    text: "NORTHERN IRELAND EXECUTIVE",
  },
  {
    id: 114,
    text: "BATH AND NORTH EAST SOMERSET",
  },
  {
    id: 116,
    text: "BRISTOL CITY",
  },
  {
    id: 119,
    text: "SOUTH GLOUCESTERSHIRE",
  },
  {
    id: 121,
    text: "NORTH SOMERSET",
  },
  {
    id: 205,
    text: "BEDFORD DISTRICT",
  },
  {
    id: 215,
    text: "MID BEDFORDSHIRE ",
  },
  {
    id: 220,
    text: "SOUTH BEDFORDSHIRE ",
  },
  {
    id: 225,
    text: "BEDFORDSHIRE",
  },
  {
    id: 230,
    text: "LUTON",
  },
  {
    id: 235,
    text: "BEDFORD COUNCIL",
  },
  {
    id: 240,
    text: "CENTRAL BEDFORDSHIRE COUNCIL",
  },
  {
    id: 335,
    text: "BRACKNELL FOREST",
  },
  {
    id: 340,
    text: "WEST BERKSHIRE",
  },
  {
    id: 345,
    text: "READING",
  },
  {
    id: 350,
    text: "SLOUGH",
  },
  {
    id: 355,
    text: "WINDSOR AND MAIDENHEAD",
  },
  {
    id: 360,
    text: "WOKINGHAM",
  },
  {
    id: 405,
    text: "AYLESBURY VALE DISTRICT",
  },
  {
    id: 410,
    text: "SOUTH BUCKS DISTRICT",
  },
  {
    id: 415,
    text: "CHILTERN DISTRICT",
  },
  {
    id: 425,
    text: "WYCOMBE DISTRICT",
  },
  {
    id: 430,
    text: "BUCKINGHAMSHIRE",
  },
  {
    id: 435,
    text: "MILTON KEYNES",
  },
  {
    id: 505,
    text: "CAMBRIDGE DISTRICT",
  },
  {
    id: 510,
    text: "EAST CAMBRIDGESHIRE DISTRICT",
  },
  {
    id: 515,
    text: "FENLAND DISTRICT",
  },
  {
    id: 520,
    text: "HUNTINGDONSHIRE DISTRICT",
  },
  {
    id: 530,
    text: "SOUTH CAMBRIDGESHIRE DISTRICT",
  },
  {
    id: 535,
    text: "CAMBRIDGESHIRE",
  },
  {
    id: 540,
    text: "CITY OF PETERBOROUGH",
  },
  {
    id: 605,
    text: "CHESTER DISTRICT",
  },
  {
    id: 610,
    text: "CONGLETON DISTRICT",
  },
  {
    id: 615,
    text: "CREWE AND NANTWICH DISTRICT",
  },
  {
    id: 620,
    text: "ELLESMERE PORT AND NESTON",
  },
  {
    id: 630,
    text: "MACCLESFIELD DISTRICT",
  },
  {
    id: 635,
    text: "VALE ROYAL DISTRICT",
  },
  {
    id: 645,
    text: "CHESHIRE",
  },
  {
    id: 650,
    text: "HALTON",
  },
  {
    id: 655,
    text: "WARRINGTON",
  },
  {
    id: 660,
    text: "CHESHIRE EAST COUNCIL",
  },
  {
    id: 665,
    text: "CHESHIRE WEST AND CHESTER COUNCIL",
  },
  {
    id: 724,
    text: "HARTLEPOOL",
  },
  {
    id: 728,
    text: "REDCAR AND CLEVELAND",
  },
  {
    id: 734,
    text: "MIDDLESBROUGH",
  },
  {
    id: 738,
    text: "STOCKTON-ON-TEES",
  },
  {
    id: 800,
    text: "CORNWALL",
  },
  {
    id: 805,
    text: "CARADON DISTRICT",
  },
  {
    id: 810,
    text: "CARRICK DISTRICT",
  },
  {
    id: 815,
    text: "KERRIER DISTRICT",
  },
  {
    id: 820,
    text: "NORTH CORNWALL DISTRICT",
  },
  {
    id: 825,
    text: "PENWITH DISTRICT",
  },
  {
    id: 830,
    text: "RESTORMEL DISTRICT",
  },
  {
    id: 835,
    text: "ISLES OF SCILLY",
  },
  {
    id: 840,
    text: "CORNWALL COUNCIL",
  },
  {
    id: 900,
    text: "CUMBRIA",
  },
  {
    id: 905,
    text: "ALLERDALE DISTRICT",
  },
  {
    id: 910,
    text: "BARROW-IN-FURNESS DISTRICT",
  },
  {
    id: 915,
    text: "CARLISLE DISTRICT",
  },
  {
    id: 920,
    text: "COPELAND DISTRICT",
  },
  {
    id: 925,
    text: "EDEN DISTRICT",
  },
  {
    id: 930,
    text: "SOUTH LAKELAND DISTRICT",
  },
  {
    id: 1005,
    text: "AMBER VALLEY DISTRICT",
  },
  {
    id: 1010,
    text: "BOLSOVER DISTRICT",
  },
  {
    id: 1015,
    text: "CHESTERFIELD DISTRICT",
  },
  {
    id: 1025,
    text: "EREWASH DISTRICT",
  },
  {
    id: 1030,
    text: "HIGH PEAK DISTRICT",
  },
  {
    id: 1035,
    text: "NORTH EAST DERBYSHIRE DISTRICT",
  },
  {
    id: 1040,
    text: "SOUTH DERBYSHIRE DISTRICT",
  },
  {
    id: 1045,
    text: "DERBYSHIRE DALES DISTRICT",
  },
  {
    id: 1050,
    text: "DERBYSHIRE",
  },
  {
    id: 1055,
    text: "CITY OF DERBY",
  },
  {
    id: 1105,
    text: "EAST DEVON DISTRICT",
  },
  {
    id: 1110,
    text: "EXETER CITY",
  },
  {
    id: 1115,
    text: "NORTH DEVON DISTRICT",
  },
  {
    id: 1125,
    text: "SOUTH HAMS DISTRICT",
  },
  {
    id: 1130,
    text: "TEIGNBRIDGE DISTRICT",
  },
  {
    id: 1135,
    text: "MID DEVON DISTRICT",
  },
  {
    id: 1145,
    text: "TORRIDGE DISTRICT",
  },
  {
    id: 1150,
    text: "WEST DEVON DISTRICT",
  },
  {
    id: 1155,
    text: "DEVON",
  },
  {
    id: 1160,
    text: "CITY OF PLYMOUTH",
  },
  {
    id: 1165,
    text: "TORBAY",
  },
  {
    id: 1210,
    text: "CHRISTCHURCH DISTRICT",
  },
  {
    id: 1215,
    text: "NORTH DORSET DISTRICT",
  },
  {
    id: 1225,
    text: "PURBECK DISTRICT",
  },
  {
    id: 1230,
    text: "WEST DORSET DISTRICT",
  },
  {
    id: 1235,
    text: "WEYMOUTH AND PORTLAND DISTRICT",
  },
  {
    id: 1240,
    text: "EAST DORSET DISTRICT",
  },
  {
    id: 1245,
    text: "DORSET",
  },
  {
    id: 1250,
    text: "BOURNEMOUTH",
  },
  {
    id: 1255,
    text: "POOLE",
  },
  {
    id: 1260,
    text: "BOURNEMOUTH CHRISTCHURCH AND POOLE",
  },
  {
    id: 1265,
    text: "DORSET",
  },
  {
    id: 1305,
    text: "CHESTER LE STREET DISTRICT",
  },
  {
    id: 1315,
    text: "DERWENTSIDE DISTRICT",
  },
  {
    id: 1320,
    text: "DURHAM DISTRICT",
  },
  {
    id: 1325,
    text: "EASINGTON DISTRICT",
  },
  {
    id: 1330,
    text: "SEDGEFIELD DISTRICT",
  },
  {
    id: 1335,
    text: "TEESDALE DISTRICT",
  },
  {
    id: 1340,
    text: "WEAR VALLEY DISTRICT",
  },
  {
    id: 1345,
    text: "DURHAM",
  },
  {
    id: 1350,
    text: "DARLINGTON",
  },
  {
    id: 1355,
    text: "DURHAM COUNCIL",
  },
  {
    id: 1410,
    text: "EASTBOURNE DISTRICT",
  },
  {
    id: 1415,
    text: "HASTINGS DISTRICT",
  },
  {
    id: 1425,
    text: "LEWES DISTRICT",
  },
  {
    id: 1430,
    text: "ROTHER DISTRICT",
  },
  {
    id: 1435,
    text: "WEALDEN DISTRICT",
  },
  {
    id: 1440,
    text: "EAST SUSSEX",
  },
  {
    id: 1445,
    text: "BRIGHTON AND HOVE",
  },
  {
    id: 1505,
    text: "BASILDON DISTRICT",
  },
  {
    id: 1510,
    text: "BRAINTREE DISTRICT",
  },
  {
    id: 1515,
    text: "BRENTWOOD DISTRICT",
  },
  {
    id: 1520,
    text: "CASTLE POINT DISTRICT",
  },
  {
    id: 1525,
    text: "CHELMSFORD DISTRICT",
  },
  {
    id: 1530,
    text: "COLCHESTER DISTRICT",
  },
  {
    id: 1535,
    text: "EPPING FOREST DISTRICT",
  },
  {
    id: 1540,
    text: "HARLOW DISTRICT",
  },
  {
    id: 1545,
    text: "MALDON DISTRICT",
  },
  {
    id: 1550,
    text: "ROCHFORD DISTRICT",
  },
  {
    id: 1560,
    text: "TENDRING DISTRICT",
  },
  {
    id: 1570,
    text: "UTTLESFORD DISTRICT",
  },
  {
    id: 1585,
    text: "ESSEX",
  },
  {
    id: 1590,
    text: "SOUTHEND-ON-SEA",
  },
  {
    id: 1595,
    text: "THURROCK",
  },
  {
    id: 1600,
    text: "GLOUCESTERSHIRE",
  },
  {
    id: 1605,
    text: "CHELTENHAM DISTRICT",
  },
  {
    id: 1610,
    text: "COTSWOLD DISTRICT",
  },
  {
    id: 1615,
    text: "FOREST OF DEAN DISTRICT",
  },
  {
    id: 1620,
    text: "GLOUCESTER DISTRICT",
  },
  {
    id: 1625,
    text: "STROUD DISTRICT",
  },
  {
    id: 1630,
    text: "TEWKESBURY DISTRICT",
  },
  {
    id: 1705,
    text: "BASINGSTOKE AND DEANE DISTRICT",
  },
  {
    id: 1710,
    text: "EAST HAMPSHIRE DISTRICT",
  },
  {
    id: 1715,
    text: "EASTLEIGH DISTRICT",
  },
  {
    id: 1720,
    text: "FAREHAM DISTRICT",
  },
  {
    id: 1725,
    text: "GOSPORT DISTRICT",
  },
  {
    id: 1730,
    text: "HART DISTRICT",
  },
  {
    id: 1735,
    text: "HAVANT DISTRICT",
  },
  {
    id: 1740,
    text: "NEW FOREST DISTRICT",
  },
  {
    id: 1750,
    text: "RUSHMOOR DISTRICT",
  },
  {
    id: 1760,
    text: "TEST VALLEY DISTRICT",
  },
  {
    id: 1765,
    text: "WINCHESTER DISTRICT",
  },
  {
    id: 1770,
    text: "HAMPSHIRE",
  },
  {
    id: 1775,
    text: "CITY OF PORTSMOUTH",
  },
  {
    id: 1780,
    text: "CITY OF SOUTHAMPTON",
  },
  {
    id: 1805,
    text: "BROMSGROVE DISTRICT",
  },
  {
    id: 1820,
    text: "MALVERN HILLS DISTRICT",
  },
  {
    id: 1825,
    text: "REDDITCH DISTRICT",
  },
  {
    id: 1835,
    text: "WORCESTER DISTRICT",
  },
  {
    id: 1840,
    text: "WYCHAVON DISTRICT",
  },
  {
    id: 1845,
    text: "WYRE FOREST DISTRICT",
  },
  {
    id: 1850,
    text: "COUNTY OF HEREFORDSHIRE",
  },
  {
    id: 1855,
    text: "WORCESTERSHIRE",
  },
  {
    id: 1900,
    text: "HERTFORDSHIRE",
  },
  {
    id: 1905,
    text: "BROXBOURNE DISTRICT",
  },
  {
    id: 1910,
    text: "DACORUM DISTRICT",
  },
  {
    id: 1915,
    text: "EAST HERTFORDSHIRE DISTRICT",
  },
  {
    id: 1920,
    text: "HERTSMERE DISTRICT",
  },
  {
    id: 1925,
    text: "NORTH HERTFORDSHIRE DISTRICT",
  },
  {
    id: 1930,
    text: "ST ALBANS DISTRICT",
  },
  {
    id: 1935,
    text: "STEVENAGE DISTRICT",
  },
  {
    id: 1940,
    text: "THREE RIVERS DISTRICT",
  },
  {
    id: 1945,
    text: "WATFORD DISTRICT",
  },
  {
    id: 1950,
    text: "WELWYN HATFIELD BOROUGH",
  },
  {
    id: 2001,
    text: "EAST RIDING OF YORKSHIRE",
  },
  {
    id: 2002,
    text: "NORTH EAST LINCOLNSHIRE",
  },
  {
    id: 2003,
    text: "NORTH LINCOLNSHIRE",
  },
  {
    id: 2004,
    text: "CITY OF KINGSTON UPON HULL",
  },
  {
    id: 2114,
    text: "ISLE OF WIGHT",
  },
  {
    id: 2205,
    text: "ASHFORD DISTRICT",
  },
  {
    id: 2210,
    text: "CANTERBURY DISTRICT",
  },
  {
    id: 2215,
    text: "DARTFORD DISTRICT",
  },
  {
    id: 2220,
    text: "DOVER DISTRICT",
  },
  {
    id: 2230,
    text: "GRAVESHAM DISTRICT",
  },
  {
    id: 2235,
    text: "MAIDSTONE DISTRICT",
  },
  {
    id: 2245,
    text: "SEVENOAKS DISTRICT",
  },
  {
    id: 2250,
    text: "SHEPWAY DISTRICT",
  },
  {
    id: 2255,
    text: "SWALE DISTRICT",
  },
  {
    id: 2260,
    text: "THANET DISTRICT",
  },
  {
    id: 2265,
    text: "TONBRIDGE AND MALLING DISTRICT",
  },
  {
    id: 2270,
    text: "TUNBRIDGE WELLS DISTRICT",
  },
  {
    id: 2275,
    text: "KENT",
  },
  {
    id: 2280,
    text: "MEDWAY TOWNS",
  },
  {
    id: 2315,
    text: "BURNLEY DISTRICT",
  },
  {
    id: 2320,
    text: "CHORLEY DISTRICT",
  },
  {
    id: 2325,
    text: "FYLDE DISTRICT",
  },
  {
    id: 2330,
    text: "HYNDBURN DISTRICT",
  },
  {
    id: 2335,
    text: "LANCASTER CITY",
  },
  {
    id: 2340,
    text: "PENDLE DISTRICT",
  },
  {
    id: 2345,
    text: "PRESTON CITY",
  },
  {
    id: 2350,
    text: "RIBBLE VALLEY DISTRICT",
  },
  {
    id: 2355,
    text: "ROSSENDALE DISTRICT",
  },
  {
    id: 2360,
    text: "SOUTH RIBBLE DISTRICT",
  },
  {
    id: 2365,
    text: "WEST LANCASHIRE DISTRICT",
  },
  {
    id: 2370,
    text: "WYRE DISTRICT",
  },
  {
    id: 2371,
    text: "LANCASHIRE",
  },
  {
    id: 2372,
    text: "BLACKBURN",
  },
  {
    id: 2373,
    text: "BLACKPOOL",
  },
  {
    id: 2405,
    text: "BLABY DISTRICT",
  },
  {
    id: 2410,
    text: "CHARNWOOD DISTRICT",
  },
  {
    id: 2415,
    text: "HARBOROUGH DISTRICT",
  },
  {
    id: 2420,
    text: "HINCKLEY AND BOSWORTH DISTRICT",
  },
  {
    id: 2430,
    text: "MELTON DISTRICT",
  },
  {
    id: 2435,
    text: "NORTH WEST LEICESTERSHIRE",
  },
  {
    id: 2440,
    text: "OADBY AND WIGSTON DISTRICT",
  },
  {
    id: 2460,
    text: "LEICESTERSHIRE",
  },
  {
    id: 2465,
    text: "CITY OF LEICESTER",
  },
  {
    id: 2470,
    text: "RUTLAND",
  },
  {
    id: 2500,
    text: "LINCOLNSHIRE",
  },
  {
    id: 2505,
    text: "BOSTON DISTRICT",
  },
  {
    id: 2510,
    text: "EAST LINDSEY DISTRICT",
  },
  {
    id: 2515,
    text: "LINCOLN DISTRICT",
  },
  {
    id: 2520,
    text: "NORTH KESTEVEN DISTRICT",
  },
  {
    id: 2525,
    text: "SOUTH HOLLAND DISTRICT",
  },
  {
    id: 2530,
    text: "SOUTH KESTEVEN DISTRICT",
  },
  {
    id: 2535,
    text: "WEST LINDSEY DISTRICT",
  },
  {
    id: 2600,
    text: "NORFOLK",
  },
  {
    id: 2605,
    text: "BRECKLAND DISTRICT",
  },
  {
    id: 2610,
    text: "BROADLAND DISTRICT",
  },
  {
    id: 2615,
    text: "GREAT YARMOUTH DISTRICT",
  },
  {
    id: 2620,
    text: "NORTH NORFOLK DISTRICT",
  },
  {
    id: 2625,
    text: "NORWICH DISTRICT",
  },
  {
    id: 2630,
    text: "SOUTH NORFOLK DISTRICT",
  },
  {
    id: 2635,
    text: "KINGS LYN AND WEST NORFOLK",
  },
  {
    id: 2705,
    text: "CRAVEN DISTRICT",
  },
  {
    id: 2710,
    text: "HAMBLETON DISTRICT",
  },
  {
    id: 2715,
    text: "HARROGATE DISTRICT",
  },
  {
    id: 2720,
    text: "RICHMONDSHIRE DISTRICT",
  },
  {
    id: 2725,
    text: "RYEDALE DISTRICT",
  },
  {
    id: 2730,
    text: "SCARBOROUGH DISTRICT",
  },
  {
    id: 2735,
    text: "SELBY DISTRICT",
  },
  {
    id: 2741,
    text: "YORK",
  },
  {
    id: 2745,
    text: "NORTH YORKSHIRE",
  },
  {
    id: 2800,
    text: "NORTHAMPTONSHIRE",
  },
  {
    id: 2805,
    text: "CORBY DISTRICT",
  },
  {
    id: 2810,
    text: "DAVENTRY DISTRICT",
  },
  {
    id: 2815,
    text: "EAST NORTHAMPTONSHIRE DISTRICT",
  },
  {
    id: 2820,
    text: "KETTERING DISTRICT",
  },
  {
    id: 2825,
    text: "NORTHAMPTON DISTRICT",
  },
  {
    id: 2830,
    text: "SOUTH NORTHAMPTONSHIRE DISTRICT",
  },
  {
    id: 2835,
    text: "WELLINGBOROUGH DISTRICT",
  },
  {
    id: 2900,
    text: "NORTHUMBERLAND",
  },
  {
    id: 2905,
    text: "ALNWICK DISTRICT",
  },
  {
    id: 2910,
    text: "BERWICK-UPON-TWEED DISTRICT",
  },
  {
    id: 2915,
    text: "BLYTH VALLEY DISTRICT",
  },
  {
    id: 2920,
    text: "CASTLE MORPETH DISTRICT",
  },
  {
    id: 2925,
    text: "TYNEDALE DISTRICT",
  },
  {
    id: 2930,
    text: "WANSBECK DISTRICT",
  },
  {
    id: 2935,
    text: "NORTHUMBERLAND COUNCIL",
  },
  {
    id: 3005,
    text: "ASHFIELD DISTRICT",
  },
  {
    id: 3010,
    text: "BASSETLAW DISTRICT",
  },
  {
    id: 3015,
    text: "BROXTOWE DISTRICT",
  },
  {
    id: 3020,
    text: "GEDLING DISTRICT",
  },
  {
    id: 3025,
    text: "MANSFIELD DISTRICT",
  },
  {
    id: 3030,
    text: "NEWARK AND SHERWOOD DISTRICT",
  },
  {
    id: 3040,
    text: "RUSHCLIFFE DISTRICT",
  },
  {
    id: 3055,
    text: "NOTTINGHAMSHIRE",
  },
  {
    id: 3060,
    text: "CITY OF NOTTINGHAM",
  },
  {
    id: 3100,
    text: "OXFORDSHIRE",
  },
  {
    id: 3105,
    text: "CHERWELL DISTRICT",
  },
  {
    id: 3110,
    text: "OXFORD DISTRICT",
  },
  {
    id: 3115,
    text: "SOUTH OXFORDSHIRE DISTRICT",
  },
  {
    id: 3120,
    text: "VALE OF WHITE HORSE DISTRICT",
  },
  {
    id: 3125,
    text: "WEST OXFORDSHIRE DISTRICT",
  },
  {
    id: 3205,
    text: "BRIDGNORTH DISTRICT",
  },
  {
    id: 3210,
    text: "NORTH SHROPSHIRE DISTRICT",
  },
  {
    id: 3215,
    text: "OSWESTRY BOROUGH",
  },
  {
    id: 3220,
    text: "SHREWSBURY AND ATCHAM DISTRICT",
  },
  {
    id: 3225,
    text: "SOUTH SHROPSHIRE DISTRICT",
  },
  {
    id: 3235,
    text: "SHROPSHIRE",
  },
  {
    id: 3240,
    text: "THE WREKIN",
  },
  {
    id: 3245,
    text: "SHROPSHIRE COUNCIL",
  },
  {
    id: 3300,
    text: "SOMERSET",
  },
  {
    id: 3305,
    text: "MENDIP DISTRICT",
  },
  {
    id: 3310,
    text: "SEDGEMOOR DISTRICT",
  },
  {
    id: 3315,
    text: "TAUNTON DEANE DISTRICT",
  },
  {
    id: 3320,
    text: "WEST SOMERSET DISTRICT",
  },
  {
    id: 3325,
    text: "SOUTH SOMERSET DISTRICT",
  },
  {
    id: 3330,
    text: "SOMERSET WEST AND TAUNTON",
  },
  {
    id: 3405,
    text: "CANNOCK CHASE DISTRICT",
  },
  {
    id: 3410,
    text: "EAST STAFFORDSHIRE",
  },
  {
    id: 3415,
    text: "LICHFIELD DISTRICT",
  },
  {
    id: 3420,
    text: "NEWCASTLE-UNDER-LYME DISTRICT",
  },
  {
    id: 3425,
    text: "STAFFORD DISTRICT",
  },
  {
    id: 3430,
    text: "SOUTH STAFFORDSHIRE DISTRICT",
  },
  {
    id: 3435,
    text: "STAFFORDSHIRE MOORLANDS DISTRICT",
  },
  {
    id: 3445,
    text: "TAMWORTH DISTRICT",
  },
  {
    id: 3450,
    text: "STAFFORDSHIRE",
  },
  {
    id: 3455,
    text: "CITY OF STOKE-ON-TRENT",
  },
  {
    id: 3500,
    text: "SUFFOLK",
  },
  {
    id: 3505,
    text: "BABERGH DISTRICT",
  },
  {
    id: 3510,
    text: "FOREST HEATH DISTRICT",
  },
  {
    id: 3515,
    text: "IPSWICH DISTRICT",
  },
  {
    id: 3520,
    text: "MID SUFFOLK DISTRICT",
  },
  {
    id: 3525,
    text: "ST EDMUNDSBURY DISTRICT",
  },
  {
    id: 3530,
    text: "SUFFOLK COASTAL DISTRICT",
  },
  {
    id: 3535,
    text: "WAVENEY DISTRICT",
  },
  {
    id: 3545,
    text: "WEST SUFFOLK",
  },
  {
    id: 3600,
    text: "SURREY",
  },
  {
    id: 3605,
    text: "ELMBRIDGE DISTRICT",
  },
  {
    id: 3610,
    text: "EPSOM AND EWELL DISTRICT",
  },
  {
    id: 3615,
    text: "GUILDFORD DISTRICT",
  },
  {
    id: 3620,
    text: "MOLE VALLEY DISTRICT",
  },
  {
    id: 3625,
    text: "REIGATE AND BANSTEAD DISTRICT",
  },
  {
    id: 3630,
    text: "RUNNYMEDE DISTRICT",
  },
  {
    id: 3635,
    text: "SPELTHORNE DISTRICT",
  },
  {
    id: 3640,
    text: "SURREY HEATH DISTRICT",
  },
  {
    id: 3645,
    text: "TANDRIDGE DISTRICT",
  },
  {
    id: 3650,
    text: "WAVERLEY DISTRICT",
  },
  {
    id: 3655,
    text: "WOKING DISTRICT",
  },
  {
    id: 3700,
    text: "WARWICKSHIRE",
  },
  {
    id: 3705,
    text: "NORTH WARWICKSHIRE DISTRICT",
  },
  {
    id: 3710,
    text: "NUNEATON AND BEDWORTH DISTRICT",
  },
  {
    id: 3715,
    text: "RUGBY DISTRICT",
  },
  {
    id: 3720,
    text: "STRATFORD-ON-AVON DISTRICT",
  },
  {
    id: 3725,
    text: "WARWICK DISTRICT",
  },
  {
    id: 3800,
    text: "WEST SUSSEX",
  },
  {
    id: 3805,
    text: "ADUR DISTRICT",
  },
  {
    id: 3810,
    text: "ARUN DISTRICT",
  },
  {
    id: 3815,
    text: "CHICHESTER DISTRICT",
  },
  {
    id: 3820,
    text: "CRAWLEY BOROUGH",
  },
  {
    id: 3825,
    text: "HORSHAM DISTRICT",
  },
  {
    id: 3830,
    text: "MID SUSSEX DISTRICT",
  },
  {
    id: 3835,
    text: "WORTHING BOROUGH",
  },
  {
    id: 3905,
    text: "KENNET DISTRICT",
  },
  {
    id: 3910,
    text: "NORTH WILTSHIRE DISTRICT",
  },
  {
    id: 3915,
    text: "SALISBURY DISTRICT",
  },
  {
    id: 3925,
    text: "WEST WILTSHIRE DISTRICT",
  },
  {
    id: 3930,
    text: "WILTSHIRE",
  },
  {
    id: 3935,
    text: "SWINDON",
  },
  {
    id: 3940,
    text: "WILTSHIRE COUNCIL",
  },
  {
    id: 4205,
    text: "BOLTON DISTRICT",
  },
  {
    id: 4210,
    text: "BURY DISTRICT",
  },
  {
    id: 4215,
    text: "MANCHESTER DISTRICT",
  },
  {
    id: 4220,
    text: "OLDHAM DISTRICT",
  },
  {
    id: 4225,
    text: "ROCHDALE DISTRICT",
  },
  {
    id: 4230,
    text: "SALFORD DISTRICT",
  },
  {
    id: 4235,
    text: "STOCKPORT DISTRICT",
  },
  {
    id: 4240,
    text: "TAMESIDE DISTRICT",
  },
  {
    id: 4245,
    text: "TRAFFORD DISTRICT",
  },
  {
    id: 4250,
    text: "WIGAN DISTRICT",
  },
  {
    id: 4305,
    text: "KNOWSLEY DISTRICT",
  },
  {
    id: 4310,
    text: "LIVERPOOL DISTRICT",
  },
  {
    id: 4315,
    text: "ST HELENS DISTRICT",
  },
  {
    id: 4320,
    text: "SEFTON DISTRICT",
  },
  {
    id: 4325,
    text: "WIRRAL DISTRICT",
  },
  {
    id: 4405,
    text: "BARNSLEY DISTRICT",
  },
  {
    id: 4410,
    text: "DONCASTER DISTRICT",
  },
  {
    id: 4415,
    text: "ROTHERHAM DISTRICT",
  },
  {
    id: 4420,
    text: "SHEFFIELD CITY",
  },
  {
    id: 4505,
    text: "GATESHEAD COUNCIL",
  },
  {
    id: 4510,
    text: "NEWCASTLE UPON TYNE DISTRICT",
  },
  {
    id: 4515,
    text: "NORTH TYNESIDE DISTRICT",
  },
  {
    id: 4520,
    text: "SOUTH TYNESIDE DISTRICT",
  },
  {
    id: 4525,
    text: "SUNDERLAND DISTRICT",
  },
  {
    id: 4605,
    text: "BIRMINGHAM DISTRICT",
  },
  {
    id: 4610,
    text: "COVENTRY CITY",
  },
  {
    id: 4615,
    text: "DUDLEY DISTRICT",
  },
  {
    id: 4620,
    text: "SANDWELL DISTRICT",
  },
  {
    id: 4625,
    text: "SOLIHULL DISTRICT",
  },
  {
    id: 4630,
    text: "WALSALL DISTRICT",
  },
  {
    id: 4635,
    text: "WOLVERHAMPTON DISTRICT",
  },
  {
    id: 4705,
    text: "BRADFORD DISTRICT",
  },
  {
    id: 4710,
    text: "CALDERDALE DISTRICT",
  },
  {
    id: 4715,
    text: "KIRKLEES DISTRICT",
  },
  {
    id: 4720,
    text: "LEEDS DISTRICT",
  },
  {
    id: 4725,
    text: "WAKEFIELD DISTRICT",
  },
  {
    id: 5030,
    text: "CITY OF LONDON",
  },
  {
    id: 5060,
    text: "LONDON BOROUGH OF BARKING AND DAGENHAM",
  },
  {
    id: 5090,
    text: "LONDON BOROUGH OF BARNET",
  },
  {
    id: 5120,
    text: "LONDON BOROUGH OF BEXLEY",
  },
  {
    id: 5150,
    text: "LONDON BOROUGH OF BRENT",
  },
  {
    id: 5180,
    text: "LONDON BOROUGH OF BROMLEY",
  },
  {
    id: 5210,
    text: "LONDON BOROUGH OF CAMDEN",
  },
  {
    id: 5240,
    text: "LONDON BOROUGH OF CROYDON",
  },
  {
    id: 5270,
    text: "LONDON BOROUGH OF EALING",
  },
  {
    id: 5300,
    text: "LONDON BOROUGH OF ENFIELD",
  },
  {
    id: 5330,
    text: "LONDON BOROUGH OF GREENWICH",
  },
  {
    id: 5360,
    text: "LONDON BOROUGH OF HACKNEY",
  },
  {
    id: 5390,
    text: "LONDON BOROUGH OF HAMMERSMITH AND FULHAM",
  },
  {
    id: 5420,
    text: "LONDON BOROUGH OF HARINGEY",
  },
  {
    id: 5450,
    text: "LONDON BOROUGH OF HARROW",
  },
  {
    id: 5480,
    text: "LONDON BOROUGH OF HAVERING",
  },
  {
    id: 5510,
    text: "LONDON BOROUGH OF HILLINGDON",
  },
  {
    id: 5540,
    text: "LONDON BOROUGH OF HOUNSLOW",
  },
  {
    id: 5570,
    text: "LONDON BOROUGH OF ISLINGTON",
  },
  {
    id: 5600,
    text: "LONDON BOROUGH OF KENSINGTON AND CHELSEA",
  },
  {
    id: 5630,
    text: "LONDON BOROUGH OF KINGSTON UPON THAMES",
  },
  {
    id: 5660,
    text: "LONDON BOROUGH OF LAMBETH",
  },
  {
    id: 5690,
    text: "LONDON BOROUGH OF LEWISHAM",
  },
  {
    id: 5720,
    text: "LONDON BOROUGH OF MERTON",
  },
  {
    id: 5750,
    text: "LONDON BOROUGH OF NEWHAM",
  },
  {
    id: 5780,
    text: "LONDON BOROUGH OF REDBRIDGE",
  },
  {
    id: 5810,
    text: "LONDON BOROUGH OF RICHMOND UPON THAMES",
  },
  {
    id: 5840,
    text: "LONDON BOROUGH OF SOUTHWARK",
  },
  {
    id: 5870,
    text: "LONDON BOROUGH OF SUTTON",
  },
  {
    id: 5900,
    text: "LONDON BOROUGH OF TOWER HAMLETS",
  },
  {
    id: 5930,
    text: "LONDON BOROUGH OF WALTHAM FOREST",
  },
  {
    id: 5960,
    text: "LONDON BOROUGH OF WANDSWORTH",
  },
  {
    id: 5990,
    text: "CITY OF WESTMINSTER",
  },
  {
    id: 6805,
    text: "ISLE OF ANGLESEY",
  },
  {
    id: 6810,
    text: "GWYNEDD",
  },
  {
    id: 6815,
    text: "CARDIFF",
  },
  {
    id: 6820,
    text: "CEREDIGION",
  },
  {
    id: 6825,
    text: "CARMARTHENSHIRE",
  },
  {
    id: 6830,
    text: "DENBIGHSHIRE",
  },
  {
    id: 6835,
    text: "FLINTSHIRE",
  },
  {
    id: 6840,
    text: "MONMOUTHSHIRE",
  },
  {
    id: 6845,
    text: "PEMBROKESHIRE",
  },
  {
    id: 6850,
    text: "POWYS",
  },
  {
    id: 6855,
    text: "SWANSEA",
  },
  {
    id: 6905,
    text: "CONWY",
  },
  {
    id: 6910,
    text: "BLAENAU GWENT",
  },
  {
    id: 6915,
    text: "BRIDGEND",
  },
  {
    id: 6920,
    text: "CAERPHILLY",
  },
  {
    id: 6925,
    text: "MERTHYR TYDFIL",
  },
  {
    id: 6930,
    text: "NEATH PORT TALBOT",
  },
  {
    id: 6935,
    text: "NEWPORT",
  },
  {
    id: 6940,
    text: "RHONDDA CYNON TAF COUNTY BOROUGH COUNCIL",
  },
  {
    id: 6945,
    text: "TORFAEN",
  },
  {
    id: 6950,
    text: "THE VALE OF GLAMORGAN",
  },
  {
    id: 6955,
    text: "WREXHAM",
  },
  {
    id: 7000,
    text: "AVON FIRE & RESCUE SERVICE",
  },
  {
    id: 7001,
    text: "BEDFORDSHIRE & LUTON FIRE AND RESCUE SERVICE",
  },
  {
    id: 7002,
    text: "BUCKINGHAMSHIRE AND MILTON KEYNES FIRE & RESCUE",
  },
  {
    id: 7003,
    text: "CAMBRIDGESHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7004,
    text: "CENTRAL SCOTLAND FIRE BRIGADE",
  },
  {
    id: 7005,
    text: "CHESHIRE FIRE SERVICE",
  },
  {
    id: 7006,
    text: "CLEVELAND FIRE BRGADE",
  },
  {
    id: 7007,
    text: "CO DURHAM AND DARLINGTON FIRE AND RESCUE SERVICE",
  },
  {
    id: 7008,
    text: "DERBYSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7009,
    text: "DEVON FIRE AND RESCUE SERVICE",
  },
  {
    id: 7010,
    text: "DORSET FIRE AND RESCUE SERVICE",
  },
  {
    id: 7011,
    text: "DUMFRIES AND GALLOWAY FIRE BRIGADE",
  },
  {
    id: 7012,
    text: "EAST SUSSEX FIRE AND RESCUE SERVICE",
  },
  {
    id: 7013,
    text: "ESSEX COUNTY FIRE & RESCUE SERVICE",
  },
  {
    id: 7014,
    text: "FIFE FIRE & RESCUE SERVICE",
  },
  {
    id: 7015,
    text: "GRAMPIAN FIRE BRIGADE",
  },
  {
    id: 7016,
    text: "GREATER MANCHESTER FIRE AND RESCUE SERVICE",
  },
  {
    id: 7017,
    text: "HAMPSHIRE FIRE & RESCUE SERVICE",
  },
  {
    id: 7018,
    text: "HEREFORD AND WORCESTER FIRE AND RESCUE SERVICE",
  },
  {
    id: 7019,
    text: "HIGHLANDS & ISLANDS FIRE BRIGADE",
  },
  {
    id: 7020,
    text: "HUMBERSIDE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7021,
    text: "KENT FIRE AND RESCUE SERVICE",
  },
  {
    id: 7022,
    text: "LANCASHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7023,
    text: "LEICESTERSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7024,
    text: "LONDON FIRE AND EMERGENCY PLANNING AUTHORITY",
  },
  {
    id: 7025,
    text: "LOTHIAN AND BORDERS FIRE BRIGADE",
  },
  {
    id: 7026,
    text: "MERSEYSIDE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7027,
    text: "MID & WEST WALES FIRE AND RESCUE SERVICE",
  },
  {
    id: 7028,
    text: "NORTH WALES FIRE AND RESCUE SERVICE",
  },
  {
    id: 7029,
    text: "NORTH YORKSHIRE FIRE AUTHORITY",
  },
  {
    id: 7030,
    text: "NOTTINGHAMSHIRE FIRE AND RESCUE",
  },
  {
    id: 7031,
    text: "ROYAL BERKSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7032,
    text: "SHROPSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7033,
    text: "SOUTH WALES FIRE AND RESCUE SERVICE",
  },
  {
    id: 7034,
    text: "SOUTH YORKSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7035,
    text: "STAFFORDSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7036,
    text: "STRATHCLYDE FIRE BRIGADE",
  },
  {
    id: 7037,
    text: "TAYSIDE FIRE BRIGADE",
  },
  {
    id: 7038,
    text: "TYNE AND WEAR FIRE AND RESCUE SERVICE",
  },
  {
    id: 7039,
    text: "WEST MIDLANDS FIRE SERVICE",
  },
  {
    id: 7040,
    text: "WEST YORKSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7041,
    text: "WILTSHIRE FIRE BRIGADE",
  },
  {
    id: 7100,
    text: "AVON AND SOMERSET CONSTABULARY",
  },
  {
    id: 7101,
    text: "BEDFORDSHIRE POLICE AUTHORITY",
  },
  {
    id: 7102,
    text: "BRITISH TRANSPORT POLICE",
  },
  {
    id: 7103,
    text: "CAMBRIDGESHIRE CONSTABULARY",
  },
  {
    id: 7104,
    text: "CENTRAL SCOTLAND POLICE",
  },
  {
    id: 7105,
    text: "CHESHIRE CONSTABULARY",
  },
  {
    id: 7106,
    text: "CITY OF LONDON POLICE AUTHORITY",
  },
  {
    id: 7107,
    text: "CLEVELAND POLICE AUTHORITY",
  },
  {
    id: 7108,
    text: "CUMBRIA CONSTABULARY",
  },
  {
    id: 7109,
    text: "DERBYSHIRE POLICE",
  },
  {
    id: 7110,
    text: "DEVON AND CORNWALL CONSTABULARY",
  },
  {
    id: 7111,
    text: "DORSET POLICE",
  },
  {
    id: 7112,
    text: "DUMFRIES AND GALLOWAY CONSTABULARY",
  },
  {
    id: 7113,
    text: "DURHAM CONSTABULARY",
  },
  {
    id: 7114,
    text: "DYFED-POWYS POLICE",
  },
  {
    id: 7115,
    text: "ESSEX POLICE",
  },
  {
    id: 7116,
    text: "FIFE CONSTABULARY",
  },
  {
    id: 7117,
    text: "GLOUCESTERSHIRE CONSTABULARY",
  },
  {
    id: 7118,
    text: "GRAMPIAN POLICE",
  },
  {
    id: 7119,
    text: "GREATER MANCHESTER POLICE",
  },
  {
    id: 7120,
    text: "GWENT POLICE / HEDDLU GWENT",
  },
  {
    id: 7121,
    text: "HAMPSHIRE CONSTABULARY",
  },
  {
    id: 7122,
    text: "HERTFORDSHIRE CONSTABULARY",
  },
  {
    id: 7123,
    text: "HUMBERSIDE POLICE",
  },
  {
    id: 7124,
    text: "KENT POLICE",
  },
  {
    id: 7125,
    text: "LANCASHIRE CONSTABULARY",
  },
  {
    id: 7126,
    text: "LEICESTERSHIRE CONSTABULARY FORCE",
  },
  {
    id: 7127,
    text: "LINCOLNSHIRE POLICE",
  },
  {
    id: 7128,
    text: "LOTHIAN AND BORDERS POLICE",
  },
  {
    id: 7129,
    text: "MERSEYSIDE POLICE",
  },
  {
    id: 7130,
    text: "METROPOLITAN POLICE AUTHORITY",
  },
  {
    id: 7131,
    text: "NORFOLK CONSTABULARY",
  },
  {
    id: 7132,
    text: "NORTH WALES POLICE / HEDDLU GOGLEDD CYMRU",
  },
  {
    id: 7133,
    text: "NORTH YORKSHIRE POLICE",
  },
  {
    id: 7134,
    text: "NORTHAMPTONSHIRE POLICE",
  },
  {
    id: 7135,
    text: "NORTHERN CONSTABULARY",
  },
  {
    id: 7136,
    text: "NORTHUMBRIA POLICE",
  },
  {
    id: 7137,
    text: "NOTTINGHAMSHIRE POLICE",
  },
  {
    id: 7138,
    text: "SCOTTISH DRUG ENFORCEMENT AGENCY",
  },
  {
    id: 7139,
    text: "SOUTH WALES POLICE AUTHORITY",
  },
  {
    id: 7140,
    text: "SOUTH YORKSHIRE POLICE",
  },
  {
    id: 7141,
    text: "STAFFORDSHIRE POLICE",
  },
  {
    id: 7142,
    text: "STRATHCLYDE POLICE",
  },
  {
    id: 7143,
    text: "SUFFOLK CONSTABULARY",
  },
  {
    id: 7144,
    text: "SURREY POLICE",
  },
  {
    id: 7145,
    text: "SUSSEX POLICE AUTHORITY",
  },
  {
    id: 7146,
    text: "TAYSIDE POLICE",
  },
  {
    id: 7147,
    text: "THAMES VALLEY POLICE",
  },
  {
    id: 7148,
    text: "WARWICKSHIRE POLICE",
  },
  {
    id: 7149,
    text: "WEST MERCIA CONSTABULARY",
  },
  {
    id: 7150,
    text: "WEST MIDLANDS POLICE",
  },
  {
    id: 7151,
    text: "WEST YORKSHIRE POLICE",
  },
  {
    id: 7152,
    text: "WILTSHIRE CONSTABULARY",
  },
  {
    id: 7200,
    text: "BRECON BEACONS NATIONAL PARK AUTHORITY",
  },
  {
    id: 7201,
    text: "BROADS AUTHORITY",
  },
  {
    id: 7202,
    text: "DARTMOOR NATIONAL PARK",
  },
  {
    id: 7203,
    text: "EXMOOR NATIONAL PARK",
  },
  {
    id: 7204,
    text: "LAKE DISTRICT NATIONAL PARK AUTHORITY",
  },
  {
    id: 7205,
    text: "NORTH YORKSHIRE MOORS NATIONAL PARK",
  },
  {
    id: 7206,
    text: "NORTHUMBERLAND NATIONAL PARK AUTHORITY",
  },
  {
    id: 7207,
    text: "PEAK DISTRICT NATIONAL PARK AUTHORITY, THE",
  },
  {
    id: 7208,
    text: "PEMBROKESHIRE COAST NATIONAL PARK",
  },
  {
    id: 7209,
    text: "SNOWDONIA NATIONAL PARK",
  },
  {
    id: 7210,
    text: "YORKSHIRE DALES NATIONAL PARK AUTHORITY",
  },
  {
    id: 7211,
    text: "NEW FOREST NATIONAL PARK",
  },
  {
    id: 7300,
    text: "CHILTERN CONSERVATION BOARD",
  },
  {
    id: 7301,
    text: "COTSWOLD CONSERVATION BOARD",
  },
  {
    id: 7302,
    text: "LEE VALLEY REGIONAL PARK AUTHORITY",
  },
  {
    id: 7400,
    text: "CORNWALL COUNTY FIRE BRIGADE",
  },
  {
    id: 7401,
    text: "CUMBRIA FIRE AND RESCUE SERVICE",
  },
  {
    id: 7402,
    text: "GLOUCESTERSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7403,
    text: "HERTFORDSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7404,
    text: "ISLE OF WIGHT FIRE AND RESCUE",
  },
  {
    id: 7405,
    text: "LINCOLNSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7406,
    text: "NORFOLK FIRE SERVICE",
  },
  {
    id: 7407,
    text: "NORTHAMPTONSHIRE FIRE AND RESCUE",
  },
  {
    id: 7408,
    text: "NORTHUMBERLAND COUNTY FIRE AND RESCUE",
  },
  {
    id: 7409,
    text: "OXFORDSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7410,
    text: "SOMERSET FIRE AND RESCUE SERVICE",
  },
  {
    id: 7411,
    text: "SUFFOLK COUNTY FIRE SERVICE",
  },
  {
    id: 7412,
    text: "SURREY FIRE AND RESCUE SERVICE",
  },
  {
    id: 7413,
    text: "WARWICKSHIRE FIRE AND RESCUE SERVICE",
  },
  {
    id: 7414,
    text: "WEST SUSSEX FIRE AND RESCUE SERVICE",
  },
  {
    id: 7415,
    text: "WEST MIDLANDS REGIONAL CONTROL CENTRE",
  },
  {
    id: 7416,
    text: "SOUTH WEST REGIONAL CONTROL CENTRE",
  },
  {
    id: 7417,
    text: "SOUTH EAST REGIONAL CONTROL CENTRE",
  },
  {
    id: 7418,
    text: "YORKSHIRE AND HUMBERSIDE REGIONAL CONTROL CENTRE",
  },
  {
    id: 7419,
    text: "NORTH WEST REGIONAL CONTROL CENTRE",
  },
  {
    id: 7420,
    text: "NORTH EAST REGIONAL CONTROL CENTRE",
  },
  {
    id: 7421,
    text: "EAST OF ENGLAND REGIONAL CONTROL CENTRE",
  },
  {
    id: 7422,
    text: "EAST MIDLANDS REGIONAL CONTROL CENTRE",
  },
  {
    id: 7423,
    text: "LONDON CONTROL ROOM",
  },
  {
    id: 9000,
    text: "ORKNEY ISLANDS",
  },
  {
    id: 9010,
    text: "SHETLAND ISLANDS",
  },
  {
    id: 9020,
    text: "WESTERN ISLES",
  },
  {
    id: 9051,
    text: "CITY OF ABERDEEN",
  },
  {
    id: 9052,
    text: "ABERDEENSHIRE",
  },
  {
    id: 9053,
    text: "ANGUS",
  },
  {
    id: 9054,
    text: "ARGYLL AND BUTE",
  },
  {
    id: 9055,
    text: "SCOTTISH BORDERS",
  },
  {
    id: 9056,
    text: "CLACKMANNAN",
  },
  {
    id: 9057,
    text: "WEST DUNBARTONSHIRE",
  },
  {
    id: 9058,
    text: "DUMFRIES AND GALLOWAY",
  },
  {
    id: 9059,
    text: "CITY OF DUNDEE",
  },
  {
    id: 9060,
    text: "EAST AYRSHIRE",
  },
  {
    id: 9061,
    text: "EAST DUNBARTONSHIRE",
  },
  {
    id: 9062,
    text: "EAST LOTHIAN",
  },
  {
    id: 9063,
    text: "EAST RENFREWSHIRE",
  },
  {
    id: 9064,
    text: "CITY OF EDINBURGH",
  },
  {
    id: 9065,
    text: "FALKIRK",
  },
  {
    id: 9066,
    text: "FIFE",
  },
  {
    id: 9067,
    text: "CITY OF GLASGOW",
  },
  {
    id: 9068,
    text: "HIGHLAND",
  },
  {
    id: 9069,
    text: "INVERCLYDE",
  },
  {
    id: 9070,
    text: "MIDLOTHIAN",
  },
  {
    id: 9071,
    text: "MORAY",
  },
  {
    id: 9072,
    text: "NORTH AYRSHIRE",
  },
  {
    id: 9073,
    text: "NORTH LANARKSHIRE",
  },
  {
    id: 9074,
    text: "PERTH AND KINROSS",
  },
  {
    id: 9075,
    text: "RENFREWSHIRE",
  },
  {
    id: 9076,
    text: "SOUTH AYRSHIRE",
  },
  {
    id: 9077,
    text: "SOUTH LANARKSHIRE",
  },
  {
    id: 9078,
    text: "STIRLING",
  },
  {
    id: 9079,
    text: "WEST LOTHIAN",
  },
];

export default DETRCodes;
