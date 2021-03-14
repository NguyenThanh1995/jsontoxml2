function getTagName(key) {
  return key.replace(/\s/g, "-");
}
function getValue(value, callback = (e) => e) {
  if (typeof value === "function") {
    return callback(value());
  } else {
    return callback(value);
  }
}
function getAttrs(object) {
  const attrs = [];
  for (const attrName in object) {
    attrs.push(`${getTagName(attrName)}="${getValue(object[attrName])}"`);
  }
  return attrs.join(" ");
}
function objectToXML(object, valueCallback) {
  if (typeof object === "object") {
    let xml = "";
    let hasAttr = false;
    const attr = {};
    for (const key in object) {
      const tagName = getTagName(key);
      if (key === "@inner") {
        xml += object[key];
      } else if (Array.isArray(object[key])) {
        /////////
        object[key].forEach((item) => {
          const chidlren = objectToXML(item, valueCallback);
          if (typeof chidlren === "object") {
            xml += `<${tagName} ${chidlren.value}>${chidlren.xml}</${tagName}>`;
          } else {
            xml += `<${tagName}>${chidlren}</${tagName}>`;
          }
        });
      } else if (typeof object[key] === "object" && object[key] !== null) {
        if (key === "@") {
          hasAttr = true;
          attr.value = getAttrs(object[key]);
        } else {
          const chidlren = objectToXML(object[key], valueCallback);
          if (typeof chidlren === "object") {
            xml += `<${tagName} ${chidlren.value}>${chidlren.xml}</${tagName}>`;
          } else {
            xml += `<${tagName}>${chidlren}</${tagName}>`;
          }
        }
      } else {
        xml += `<${tagName}>${getValue(
          object[key],
          valueCallback
        )}</${tagName}>`;
      }
    }
    return hasAttr ? { ...attr, xml } : xml;
  } else {
    return object;
  }
}

export default {
  render: (object, xmlHeader = "") => {
    return (
      (xmlHeader ? `<?xml version="1.0" encoding="UTF-8"?>` : "") +
      objectToXML(object)
    );
  },
  cdata: (object) => {
    return (
      (xmlHeader ? `<?xml version="1.0" encoding="UTF-8"?>` : "") +
      objectToXML(object, (e) => `<![CDATA[ ${e} ]]`)
    );
  },
};
