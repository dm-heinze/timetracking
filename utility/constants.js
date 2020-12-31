export const regexForTicketKeys = /[a-z]+\-[1-9]+[0-9]*$/i;

//export const __base_url = process.server ? 'http://localhost:3000' : process.env.baseUrl;
export const __base_url = process.server ? 'http://localhost:3000' : '';

export const __SHOW_START_AND_END_TIMES = 'SHOW_START_AND_END_TIMES';

export const formatAsArray = (stringToSplit) => { // used to ensure that [hh:mm] strings get formatted into the shape [hh:mm:ss]
    const __valAsArray = stringToSplit.split(":");

    __valAsArray[2] = __valAsArray[2] ? Number(__valAsArray[2]) : 0;
    return __valAsArray;
}

export const formatArrayAsDate = (arrayToFormat) => {
    const __helperDate = new Date(); // todo

    return new Date(
        __helperDate.getFullYear(),
        __helperDate.getMonth(),
        __helperDate.getDate(),
        arrayToFormat[0], // hours
        arrayToFormat[1], // minutes
        arrayToFormat[2], // seconds
        0
    )
}

export const formatAsDate = (stringToCastIntoDate) => { // todo: rename to formatStringAsDate
    const __valAsArray = stringToCastIntoDate.split(":");

    // use Date object to create a helper that automatically calculates valid time values
    const __helperDate = new Date(); // todo

    return new Date(
        __helperDate.getFullYear(),
        __helperDate.getMonth(),
        __helperDate.getDate(),
        Number(__valAsArray[0]), // hours
        Number(__valAsArray[1]), // minutes
        __valAsArray[2] ? Number(__valAsArray[2]) : 0, // position only available if seconds has non-zero val
        0
    )
}

export const formatMilliSecondsAsDate = (valInMilliseconds) => {
    // use Date object to create a helper that automatically calculates valid time values
    const __helperDate = new Date(); // todo

    return new Date(
        __helperDate.getFullYear(),
        __helperDate.getMonth(),
        __helperDate.getDate(),
        0,
        0,
        0,
        valInMilliseconds // milliseconds
    )
}
