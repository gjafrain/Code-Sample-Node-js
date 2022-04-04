exports.startDate = (date = new Date()) => {
    return new Date(date).setHours(0, 0, 0, 0)
}

exports.endDate = (date = new Date()) => {
    return new Date(date).setHours(23,59,59,999)
}