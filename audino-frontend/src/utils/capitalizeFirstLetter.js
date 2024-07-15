export default function capitalizeFirstLetter(text) {
    const firstLetter = text[0].toUpperCase();
    const restOfTheText = text.slice(1);
    return firstLetter + restOfTheText;
}
