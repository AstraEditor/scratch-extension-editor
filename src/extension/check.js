export function isValidExtID(name) {
    const regex = /^[a-z0-9]+$/;
    return regex.test(name);
}