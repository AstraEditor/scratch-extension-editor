export function isValidExtID(name) {
    const regex = /^[a-z0-9]+$/;
    return regex.test(name);
}

export function spawnExtID(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}