export const VARIABLES = {
  JWT_SECRET: process.env.JWT_SECRET || "fcbarcelona",
  PORT: process.env.PORT || 4000,
};

export const URLS_DRIVE = {
  ROTACION:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQymxGabuvnQHcAgcJnJE75amAwmPnfsMiQTz2lygjgTlbI4ExSTWcpzL_uqbRfFpghUJQkSl3TRyyy/pub?output=csv",
  AUSENTISMO:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQymxGabuvnQHcAgcJnJE75amAwmPnfsMiQTz2lygjgTlbI4ExSTWcpzL_uqbRfFpghUJQkSl3TRyyy/pub?gid=1278263054&single=true&output=csv",
};
