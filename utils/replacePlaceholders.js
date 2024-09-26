// Function to check and replace all placeholders dynamically
function replacePlaceholders(obj, placeholders) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // If value is a string, apply replacement for all placeholders
      if (typeof obj[key] === "string") {
        for (let placeholder in placeholders) {
          const placeholderPattern = new RegExp(`\\[${placeholder}\\]`, "gi"); // Create regex for placeholder
          obj[key] = obj[key].replace(
            placeholderPattern,
            placeholders[placeholder]
          );
        }
      }
      // If value is an object or array, recurse into it
      else if (typeof obj[key] === "object" && obj[key] !== null) {
        replacePlaceholders(obj[key], placeholders);
      }
    }
  }
}
module.exports = { replacePlaceholders };
