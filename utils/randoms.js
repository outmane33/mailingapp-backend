//return random caracters
function random(choice, count) {
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  let characters = "";

  switch (choice) {
    case "text":
    case "t":
      characters = lowerCase;
      break;
    case "TEXT":
    case "T":
      characters = upperCase;
      break;
    case "TEXTtext":
    case "textTEXT":
    case "tT":
    case "Tt":
      characters = upperCase + lowerCase;
      break;
    case "number":
    case "Number":
    case "NUMBER":
    case "n":
    case "N":
      characters = digits;
      break;
    case "TEXTnumber":
    case "TEXTNumber":
    case "TEXTNUMBER":
    case "numberTEXT":
    case "NumberTEXT":
    case "NUMBERTEXT":
    case "NT":
    case "nT":
    case "Tn":
    case "TN":
      characters = upperCase + digits;
      break;
    case "textnumber":
    case "textNumber":
    case "textNUMBER":
    case "numbertext":
    case "Numbertext":
    case "NUMBERtext":
    case "tn":
    case "tN":
    case "nt":
    case "Nt":
      characters = lowerCase + digits;
      break;
    case "numberTEXTtext":
    case "numbertextTEXT":
    case "NumberTEXTtext":
    case "NumbertextTEXT":
    case "NUMBERTEXTtext":
    case "NUMBERtextTEXT":
    case "TEXTnumbertext":
    case "TEXTNumbertext":
    case "TEXTtextNumber":
    case "TEXTtextnumber":
    case "TEXTtextNUMBER":
    case "TEXTNUMBERtext":
    case "textNumberTEXT":
    case "textnumberTEXT":
    case "textTEXTnumber":
    case "textTEXTNumber":
    case "textTEXTNUMBER":
    case "textNUMBERTEXT":
    case "ntT":
    case "nTt":
    case "NtT":
    case "NTt":
    case "tTn":
    case "tnT":
    case "tTN":
    case "tNT":
    case "Ttn":
    case "Tnt":
    case "TtN":
    case "TNt":
      characters = digits + upperCase + lowerCase;
      break;
    default:
      return "Invalid choice!";
  }

  let result = "";
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

// Function to check and replace in all object properties
function replaceRandomInObject(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // If value is a string, apply replacement
      if (typeof obj[key] === "string") {
        obj[key] = obj[key].replace(
          /random\('(\w+)',\s*(\d+)\)/g,
          function (match, choice, count) {
            return random(choice, parseInt(count));
          }
        );
      }
      // If value is an object or array, recurse into it
      else if (typeof obj[key] === "object" && obj[key] !== null) {
        replaceRandomInObject(obj[key]);
      }
    }
  }
}

module.exports = { random, replaceRandomInObject };
