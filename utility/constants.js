export const regexForTicketKeys = /[a-z]+\-[1-9]+[0-9]*$/i;

export const __baseURL = (process.env.VERCEL_ENV !== 'preview') ? 'http://localhost:3000' : process.env.VERCEL_URL; // todo
