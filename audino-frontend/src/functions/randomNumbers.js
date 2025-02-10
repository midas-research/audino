export function generateRandomDigit(count = 100) {
    let result = '';
    for (let i = 0; i < count; i++) {
        result += Math.floor(Math.random() * 100) + 1;
    }
    return result;
}