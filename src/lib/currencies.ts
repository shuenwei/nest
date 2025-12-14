
const raw = [
  [
    "AED",
    "UAE Dirham"
  ],
  [
    "AFN",
    "Afghan Afghani"
  ],
  [
    "ALL",
    "Albanian Lek"
  ],
  [
    "AMD",
    "Armenian Dram"
  ],
  [
    "ANG",
    "Netherlands Antillian Guilder"
  ],
  [
    "AOA",
    "Angolan Kwanza"
  ],
  [
    "ARS",
    "Argentine Peso"
  ],
  [
    "AUD",
    "Australian Dollar"
  ],
  [
    "AWG",
    "Aruban Florin"
  ],
  [
    "AZN",
    "Azerbaijani Manat"
  ],
  [
    "BAM",
    "Bosnia and Herzegovina Convertible Mark"
  ],
  [
    "BBD",
    "Barbados Dollar"
  ],
  [
    "BDT",
    "Bangladeshi Taka"
  ],
  [
    "BGN",
    "Bulgarian Lev"
  ],
  [
    "BHD",
    "Bahraini Dinar"
  ],
  [
    "BIF",
    "Burundian Franc"
  ],
  [
    "BMD",
    "Bermudian Dollar"
  ],
  [
    "BND",
    "Brunei Dollar"
  ],
  [
    "BOB",
    "Bolivian Boliviano"
  ],
  [
    "BRL",
    "Brazilian Real"
  ],
  [
    "BSD",
    "Bahamian Dollar"
  ],
  [
    "BTN",
    "Bhutanese Ngultrum"
  ],
  [
    "BWP",
    "Botswana Pula"
  ],
  [
    "BYN",
    "Belarusian Ruble"
  ],
  [
    "BZD",
    "Belize Dollar"
  ],
  [
    "CAD",
    "Canadian Dollar"
  ],
  [
    "CDF",
    "Congolese Franc"
  ],
  [
    "CHF",
    "Swiss Franc"
  ],
  [
    "CLP",
    "Chilean Peso"
  ],
  [
    "CNY",
    "Chinese Renminbi"
  ],
  [
    "COP",
    "Colombian Peso"
  ],
  [
    "CRC",
    "Costa Rican Colon"
  ],
  [
    "CUP",
    "Cuban Peso"
  ],
  [
    "CVE",
    "Cape Verdean Escudo"
  ],
  [
    "CZK",
    "Czech Koruna"
  ],
  [
    "DJF",
    "Djiboutian Franc"
  ],
  [
    "DKK",
    "Danish Krone"
  ],
  [
    "DOP",
    "Dominican Peso"
  ],
  [
    "DZD",
    "Algerian Dinar"
  ],
  [
    "EGP",
    "Egyptian Pound"
  ],
  [
    "ERN",
    "Eritrean Nakfa"
  ],
  [
    "ETB",
    "Ethiopian Birr"
  ],
  [
    "EUR",
    "Euro"
  ],
  [
    "FJD",
    "Fiji Dollar"
  ],
  [
    "FKP",
    "Falkland Islands Pound"
  ],
  [
    "FOK",
    "Faroese Króna"
  ],
  [
    "GBP",
    "Pound Sterling"
  ],
  [
    "GEL",
    "Georgian Lari"
  ],
  [
    "GGP",
    "Guernsey Pound"
  ],
  [
    "GHS",
    "Ghanaian Cedi"
  ],
  [
    "GIP",
    "Gibraltar Pound"
  ],
  [
    "GMD",
    "Gambian Dalasi"
  ],
  [
    "GNF",
    "Guinean Franc"
  ],
  [
    "GTQ",
    "Guatemalan Quetzal"
  ],
  [
    "GYD",
    "Guyanese Dollar"
  ],
  [
    "HKD",
    "Hong Kong Dollar"
  ],
  [
    "HNL",
    "Honduran Lempira"
  ],
  [
    "HRK",
    "Croatian Kuna"
  ],
  [
    "HTG",
    "Haitian Gourde"
  ],
  [
    "HUF",
    "Hungarian Forint"
  ],
  [
    "IDR",
    "Indonesian Rupiah"
  ],
  [
    "ILS",
    "Israeli New Shekel"
  ],
  [
    "IMP",
    "Manx Pound"
  ],
  [
    "INR",
    "Indian Rupee"
  ],
  [
    "IQD",
    "Iraqi Dinar"
  ],
  [
    "IRR",
    "Iranian Rial"
  ],
  [
    "ISK",
    "Icelandic Króna"
  ],
  [
    "JEP",
    "Jersey Pound"
  ],
  [
    "JMD",
    "Jamaican Dollar"
  ],
  [
    "JOD",
    "Jordanian Dinar"
  ],
  [
    "JPY",
    "Japanese Yen"
  ],
  [
    "KES",
    "Kenyan Shilling"
  ],
  [
    "KGS",
    "Kyrgyzstani Som"
  ],
  [
    "KHR",
    "Cambodian Riel"
  ],
  [
    "KID",
    "Kiribati Dollar"
  ],
  [
    "KMF",
    "Comorian Franc"
  ],
  [
    "KRW",
    "South Korean Won"
  ],
  [
    "KWD",
    "Kuwaiti Dinar"
  ],
  [
    "KYD",
    "Cayman Islands Dollar"
  ],
  [
    "KZT",
    "Kazakhstani Tenge"
  ],
  [
    "LAK",
    "Lao Kip"
  ],
  [
    "LBP",
    "Lebanese Pound"
  ],
  [
    "LKR",
    "Sri Lanka Rupee"
  ],
  [
    "LRD",
    "Liberian Dollar"
  ],
  [
    "LSL",
    "Lesotho Loti"
  ],
  [
    "LYD",
    "Libyan Dinar"
  ],
  [
    "MAD",
    "Moroccan Dirham"
  ],
  [
    "MDL",
    "Moldovan Leu"
  ],
  [
    "MGA",
    "Malagasy Ariary"
  ],
  [
    "MKD",
    "Macedonian Denar"
  ],
  [
    "MMK",
    "Burmese Kyat"
  ],
  [
    "MNT",
    "Mongolian Tögrög"
  ],
  [
    "MOP",
    "Macanese Pataca"
  ],
  [
    "MRU",
    "Mauritanian Ouguiya"
  ],
  [
    "MUR",
    "Mauritian Rupee"
  ],
  [
    "MVR",
    "Maldivian Rufiyaa"
  ],
  [
    "MWK",
    "Malawian Kwacha"
  ],
  [
    "MXN",
    "Mexican Peso"
  ],
  [
    "MYR",
    "Malaysian Ringgit"
  ],
  [
    "MZN",
    "Mozambican Metical"
  ],
  [
    "NAD",
    "Namibian Dollar"
  ],
  [
    "NGN",
    "Nigerian Naira"
  ],
  [
    "NIO",
    "Nicaraguan Córdoba"
  ],
  [
    "NOK",
    "Norwegian Krone"
  ],
  [
    "NPR",
    "Nepalese Rupee"
  ],
  [
    "NZD",
    "New Zealand Dollar"
  ],
  [
    "OMR",
    "Omani Rial"
  ],
  [
    "PAB",
    "Panamanian Balboa"
  ],
  [
    "PEN",
    "Peruvian Sol"
  ],
  [
    "PGK",
    "Papua New Guinean Kina"
  ],
  [
    "PHP",
    "Philippine Peso"
  ],
  [
    "PKR",
    "Pakistani Rupee"
  ],
  [
    "PLN",
    "Polish Złoty"
  ],
  [
    "PYG",
    "Paraguayan Guaraní"
  ],
  [
    "QAR",
    "Qatari Riyal"
  ],
  [
    "RON",
    "Romanian Leu"
  ],
  [
    "RSD",
    "Serbian Dinar"
  ],
  [
    "RUB",
    "Russian Ruble"
  ],
  [
    "RWF",
    "Rwandan Franc"
  ],
  [
    "SAR",
    "Saudi Riyal"
  ],
  [
    "SBD",
    "Solomon Islands Dollar"
  ],
  [
    "SCR",
    "Seychellois Rupee"
  ],
  [
    "SDG",
    "Sudanese Pound"
  ],
  [
    "SEK",
    "Swedish Krona"
  ],
  [
    "SGD",
    "Singapore Dollar"
  ],
  [
    "SHP",
    "Saint Helena Pound"
  ],
  [
    "SLE",
    "Sierra Leonean Leone"
  ],
  [
    "SLL",
    "Sierra Leonean Leone"
  ],
  [
    "SOS",
    "Somali Shilling"
  ],
  [
    "SRD",
    "Surinamese Dollar"
  ],
  [
    "SSP",
    "South Sudanese Pound"
  ],
  [
    "STN",
    "São Tomé and Príncipe Dobra"
  ],
  [
    "SYP",
    "Syrian Pound"
  ],
  [
    "SZL",
    "Eswatini Lilangeni"
  ],
  [
    "THB",
    "Thai Baht"
  ],
  [
    "TJS",
    "Tajikistani Somoni"
  ],
  [
    "TMT",
    "Turkmenistan Manat"
  ],
  [
    "TND",
    "Tunisian Dinar"
  ],
  [
    "TOP",
    "Tongan Paʻanga"
  ],
  [
    "TRY",
    "Turkish Lira"
  ],
  [
    "TTD",
    "Trinidad and Tobago Dollar"
  ],
  [
    "TVD",
    "Tuvaluan Dollar"
  ],
  [
    "TWD",
    "New Taiwan Dollar"
  ],
  [
    "TZS",
    "Tanzanian Shilling"
  ],
  [
    "UAH",
    "Ukrainian Hryvnia"
  ],
  [
    "UGX",
    "Ugandan Shilling"
  ],
  [
    "USD",
    "United States Dollar"
  ],
  [
    "UYU",
    "Uruguayan Peso"
  ],
  [
    "UZS",
    "Uzbekistani So'm"
  ],
  [
    "VES",
    "Venezuelan Bolívar Soberano"
  ],
  [
    "VND",
    "Vietnamese Đồng"
  ],
  [
    "VUV",
    "Vanuatu Vatu"
  ],
  [
    "WST",
    "Samoan Tālā"
  ],
  [
    "XAF",
    "Central African CFA Franc"
  ],
  [
    "XCD",
    "East Caribbean Dollar"
  ],
  [
    "XCG",
    "Caribbean Guilder"
  ],
  [
    "XDR",
    "Special Drawing Rights"
  ],
  [
    "XOF",
    "West African CFA franc"
  ],
  [
    "XPF",
    "CFP Franc"
  ],
  [
    "YER",
    "Yemeni Rial"
  ],
  [
    "ZAR",
    "South African Rand"
  ],
  [
    "ZMW",
    "Zambian Kwacha"
  ],
  [
    "ZWL",
    "Zimbabwean Dollar"
  ]
];

export const CURRENCY_FLAGS: Record<string, string> = {
  AED: "🇦🇪",
  AFN: "🇦🇫",
  ALL: "🇦🇱",
  AMD: "🇦🇲",
  ANG: "🇨🇼",
  AOA: "🇦🇴",
  ARS: "🇦🇷",
  AUD: "🇦🇺",
  AWG: "🇦🇼",
  AZN: "🇦🇿",
  BAM: "🇧🇦",
  BBD: "🇧🇧",
  BDT: "🇧🇩",
  BGN: "🇧🇬",
  BHD: "🇧🇭",
  BIF: "🇧🇮",
  BMD: "🇧🇲",
  BND: "🇧🇳",
  BOB: "🇧🇴",
  BRL: "🇧🇷",
  BSD: "🇧🇸",
  BTN: "🇧🇹",
  BWP: "🇧🇼",
  BYN: "🇧🇾",
  BZD: "🇧🇿",
  CAD: "🇨🇦",
  CDF: "🇨🇩",
  CHF: "🇨🇭",
  CLP: "🇨🇱",
  CNY: "🇨🇳",
  COP: "🇨🇴",
  CRC: "🇨🇷",
  CUP: "🇨🇺",
  CVE: "🇨🇻",
  CZK: "🇨🇿",
  DJF: "🇩🇯",
  DKK: "🇩🇰",
  DOP: "🇩🇴",
  DZD: "🇩🇿",
  EGP: "🇪🇬",
  ERN: "🇪🇷",
  ETB: "🇪🇹",
  EUR: "🇪🇺",
  FJD: "🇫🇯",
  FKP: "🇫🇰",
  FOK: "🇫🇴",
  GBP: "🇬🇧",
  GEL: "🇬🇪",
  GGP: "🇬🇬",
  GHS: "🇬🇭",
  GIP: "🇬🇮",
  GMD: "🇬🇲",
  GNF: "🇬🇳",
  GTQ: "🇬🇹",
  GYD: "🇬🇾",
  HKD: "🇭🇰",
  HNL: "🇭🇳",
  HRK: "🇭🇷",
  HTG: "🇭🇹",
  HUF: "🇭🇺",
  IDR: "🇮🇩",
  ILS: "🇮🇱",
  IMP: "🇮🇲",
  INR: "🇮🇳",
  IQD: "🇮🇶",
  IRR: "🇮🇷",
  ISK: "🇮🇸",
  JEP: "🇯🇪",
  JMD: "🇯🇲",
  JOD: "🇯🇴",
  JPY: "🇯🇵",
  KES: "🇰🇪",
  KGS: "🇰🇬",
  KHR: "🇰🇭",
  KID: "🇰🇮",
  KMF: "🇰🇲",
  KRW: "🇰🇷",
  KWD: "🇰🇼",
  KYD: "🇰🇾",
  KZT: "🇰🇿",
  LAK: "🇱🇦",
  LBP: "🇱🇧",
  LKR: "🇱🇰",
  LRD: "🇱🇷",
  LSL: "🇱🇸",
  LYD: "🇱🇾",
  MAD: "🇲🇦",
  MDL: "🇲🇩",
  MGA: "🇲🇬",
  MKD: "🇲🇰",
  MMK: "🇲🇲",
  MNT: "🇲🇳",
  MOP: "🇲🇴",
  MRU: "🇲🇷",
  MUR: "🇲🇺",
  MVR: "🇲🇻",
  MWK: "🇲🇼",
  MXN: "🇲🇽",
  MYR: "🇲🇾",
  MZN: "🇲🇿",
  NAD: "🇳🇦",
  NGN: "🇳🇬",
  NIO: "🇳🇮",
  NOK: "🇳🇴",
  NPR: "🇳🇵",
  NZD: "🇳🇿",
  OMR: "🇴🇲",
  PAB: "🇵🇦",
  PEN: "🇵🇪",
  PGK: "🇵🇬",
  PHP: "🇵🇭",
  PKR: "🇵🇰",
  PLN: "🇵🇱",
  PYG: "🇵🇾",
  QAR: "🇶🇦",
  RON: "🇷🇴",
  RSD: "🇷🇸",
  RUB: "🇷🇺",
  RWF: "🇷🇼",
  SAR: "🇸🇦",
  SBD: "🇸🇧",
  SCR: "🇸🇨",
  SDG: "🇸🇩",
  SEK: "🇸🇪",
  SGD: "🇸🇬",
  SHP: "🇸🇭",
  SLE: "🇸🇱",
  SLL: "🇸🇱",
  SOS: "🇸🇴",
  SRD: "🇸🇷",
  SSP: "🇸🇸",
  STN: "🇸🇹",
  SYP: "🇸🇾",
  SZL: "🇸🇿",
  THB: "🇹🇭",
  TJS: "🇹🇯",
  TMT: "🇹🇲",
  TND: "🇹🇳",
  TOP: "🇹🇴",
  TRY: "🇹🇷",
  TTD: "🇹🇹",
  TVD: "🇹🇻",
  TWD: "🇹🇼",
  TZS: "🇹🇿",
  UAH: "🇺🇦",
  UGX: "🇺🇬",
  USD: "🇺🇸",
  UYU: "🇺🇾",
  UZS: "🇺🇿",
  VES: "🇻🇪",
  VND: "🇻🇳",
  VUV: "🇻🇺",
  WST: "🇼🇸",
  XAF: "🇨🇫",
  XCD: "🇦🇬",
  XCG: "🇨🇼",
  XDR: "🏦",
  XOF: "🇧🇯",
  XPF: "🇵🇫",
  YER: "🇾🇪",
  ZAR: "🇿🇦",
  ZMW: "🇿🇲",
  ZWL: "🇿🇼"
};

export const getCurrencyFlag = (code: string): string => {
  return CURRENCY_FLAGS[code] || "🏳️";
};

export const SUPPORTED_CURRENCIES = raw.map(([code, name]) => ({
  code,
  name,
  flag: getCurrencyFlag(code)
}));



export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  AD: "EUR",
  AE: "AED",
  AF: "AFN",
  AG: "XCD",
  AI: "XCD",
  AL: "ALL",
  AM: "AMD",
  AO: "AOA",
  AR: "ARS",
  AS: "USD",
  AT: "EUR",
  AU: "AUD",
  AW: "AWG",
  AX: "EUR",
  AZ: "AZN",
  BA: "BAM",
  BB: "BBD",
  BD: "BDT",
  BE: "EUR",
  BF: "XOF",
  BG: "BGN",
  BH: "BHD",
  BI: "BIF",
  BJ: "XOF",
  BL: "EUR",
  BM: "BMD",
  BN: "BND",
  BO: "BOB",
  BQ: "USD",
  BR: "BRL",
  BS: "BSD",
  BT: "BTN",
  BV: "NOK",
  BW: "BWP",
  BY: "BYN",
  BZ: "BZD",
  CA: "CAD",
  CC: "AUD",
  CD: "CDF",
  CF: "XAF",
  CG: "XAF",
  CH: "CHF",
  CI: "XOF",
  CK: "NZD",
  CL: "CLP",
  CM: "XAF",
  CN: "CNY",
  CO: "COP",
  CR: "CRC",
  CU: "CUP",
  CV: "CVE",
  CW: "ANG",
  CX: "AUD",
  CY: "EUR",
  CZ: "CZK",
  DE: "EUR",
  DJ: "DJF",
  DK: "DKK",
  DM: "XCD",
  DO: "DOP",
  DZ: "DZD",
  EC: "USD",
  EE: "EUR",
  EG: "EGP",
  EH: "MAD",
  ER: "ERN",
  ES: "EUR",
  ET: "ETB",
  FI: "EUR",
  FJ: "FJD",
  FK: "FKP",
  FM: "USD",
  FO: "DKK",
  FR: "EUR",
  GA: "XAF",
  GB: "GBP",
  GD: "XCD",
  GE: "GEL",
  GF: "EUR",
  GG: "GBP",
  GH: "GHS",
  GI: "GIP",
  GL: "DKK",
  GM: "GMD",
  GN: "GNF",
  GP: "EUR",
  GQ: "XAF",
  GR: "EUR",
  GS: "GBP",
  GT: "GTQ",
  GU: "USD",
  GW: "XOF",
  GY: "GYD",
  HK: "HKD",
  HM: "AUD",
  HN: "HNL",
  HR: "EUR",
  HT: "HTG",
  HU: "HUF",
  ID: "IDR",
  IE: "EUR",
  IL: "ILS",
  IM: "GBP",
  IN: "INR",
  IO: "USD",
  IQ: "IQD",
  IR: "IRR",
  IS: "ISK",
  IT: "EUR",
  JE: "GBP",
  JM: "JMD",
  JO: "JOD",
  JP: "JPY",
  KE: "KES",
  KG: "KGS",
  KH: "KHR",
  KI: "AUD",
  KM: "KMF",
  KN: "XCD",
  KP: "KPW",
  KR: "KRW",
  KW: "KWD",
  KY: "KYD",
  KZ: "KZT",
  LA: "LAK",
  LB: "LBP",
  LC: "XCD",
  LI: "CHF",
  LK: "LKR",
  LR: "LRD",
  LS: "LSL",
  LT: "EUR",
  LU: "EUR",
  LV: "EUR",
  LY: "LYD",
  MA: "MAD",
  MC: "EUR",
  MD: "MDL",
  ME: "EUR",
  MF: "EUR",
  MG: "MGA",
  MH: "USD",
  MK: "MKD",
  ML: "XOF",
  MM: "MMK",
  MN: "MNT",
  MO: "MOP",
  MP: "USD",
  MQ: "EUR",
  MR: "MRU",
  MS: "XCD",
  MT: "EUR",
  MU: "MUR",
  MV: "MVR",
  MW: "MWK",
  MX: "MXN",
  MY: "MYR",
  MZ: "MZN",
  NA: "NAD",
  NC: "XPF",
  NE: "XOF",
  NF: "AUD",
  NG: "NGN",
  NI: "NIO",
  NL: "EUR",
  NO: "NOK",
  NP: "NPR",
  NR: "AUD",
  NU: "NZD",
  NZ: "NZD",
  OM: "OMR",
  PA: "PAB",
  PE: "PEN",
  PF: "XPF",
  PG: "PGK",
  PH: "PHP",
  PK: "PKR",
  PL: "PLN",
  PM: "EUR",
  PN: "NZD",
  PR: "USD",
  PS: "ILS",
  PT: "EUR",
  PW: "USD",
  PY: "PYG",
  QA: "QAR",
  RE: "EUR",
  RO: "RON",
  RS: "RSD",
  RU: "RUB",
  RW: "RWF",
  SA: "SAR",
  SB: "SBD",
  SC: "SCR",
  SD: "SDG",
  SE: "SEK",
  SG: "SGD",
  SH: "SHP",
  SI: "EUR",
  SJ: "NOK",
  SK: "EUR",
  SL: "SLL",
  SM: "EUR",
  SN: "XOF",
  SO: "SOS",
  SR: "SRD",
  SS: "SSP",
  ST: "STN",
  SV: "USD",
  SX: "ANG",
  SY: "SYP",
  SZ: "SZL",
  TC: "USD",
  TD: "XAF",
  TF: "EUR",
  TG: "XOF",
  TH: "THB",
  TJ: "TJS",
  TK: "NZD",
  TL: "USD",
  TM: "TMT",
  TN: "TND",
  TO: "TOP",
  TR: "TRY",
  TT: "TTD",
  TV: "AUD",
  TW: "TWD",
  TZ: "TZS",
  UA: "UAH",
  UG: "UGX",
  UM: "USD",
  US: "USD",
  UY: "UYU",
  UZ: "UZS",
  VA: "EUR",
  VC: "XCD",
  VE: "VES",
  VG: "USD",
  VI: "USD",
  VN: "VND",
  VU: "VUV",
  WF: "XPF",
  WS: "WST",
  YE: "YER",
  YT: "EUR",
  ZA: "ZAR",
  ZM: "ZMW",
  ZW: "ZWL",
};

export const getCurrencyFromCountryCode = (countryCode: string): string => {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || "SGD";
};
