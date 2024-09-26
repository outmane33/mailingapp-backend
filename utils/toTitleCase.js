//title case sender_gmail  => Sender_Gmail
function toTitleCase(text) {
  return text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("_");
}

module.exports = { toTitleCase };
