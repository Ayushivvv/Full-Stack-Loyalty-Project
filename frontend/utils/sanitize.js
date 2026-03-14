const protocolRegex = /(javascript:|data:|vbscript:)/i;
const escapeRegex = /[&<>"'`]/g;

const sanitize = (value) => {
  if (value === undefined || value === null) return "";

  const input = String(value).trim();
  if (protocolRegex.test(input)) {
    throw new Error("Input contains disallowed content");
  }

  return escapeRegex.test(input)
    ? input.replace(escapeRegex, "")
    : input;
};

export default sanitize;
