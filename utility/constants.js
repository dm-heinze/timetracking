export const validTimeRegex = /[0-9][0-9]\:[0-9][0-9]\:[0-9][0-9]$/; // bc Date() object is used values get parsed into the correct time format -> 00:00:90 => 00:01:30 // todo
export const regexForTicketKeys = /[a-z]+\-[1-9][0-9]+$/i;
