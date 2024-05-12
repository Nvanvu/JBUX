const random_code = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
const random_password = () => {
    const randomstring = Math.random().toString(36).slice(-8);
    return randomstring;
}
const reset_password_code = () => {
    return random_code(100000, 999999)
}

module.exports = {
    reset_password_code,
    random_password
}