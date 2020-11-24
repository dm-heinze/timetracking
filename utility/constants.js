export const regexForTicketKeys = /[a-z]+\-[1-9]+[0-9]*$/i;

export const __base_url = process.server ? 'http://localhost:3000' : process.env.baseUrl;
