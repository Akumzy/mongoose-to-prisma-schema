"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const types = {
    String: "String",
    Number: "Int",
    Boolean: "Boolean",
    ObjectId: "String",
    Date: "DateTime",
};
const setup = `// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url = env("DATABASE_URL")\n}\n\n`;
async function mongooseToPrismaSchema(models, schemaPath) {
    let schema = setup +
        models
            .map(({ modelName: name, schema: { obj } }) => parseCollection({ name, obj }))
            .join("\n\n");
    await promises_1.writeFile(schemaPath, schema, { encoding: "utf-8" });
}
exports.default = mongooseToPrismaSchema;
function parseObjectType(obj, propName) {
    let em = "", typ = "";
    if (Array.isArray(obj)) {
        let ob = obj[0];
        if (typeof ob === "function") {
            typ = `${types[ob.name]}[]`;
        }
        else {
            typ = `${capitalise(propName)}[]`;
            em = parseCollection({ name: propName, obj: ob });
        }
    }
    else {
        if ("type" in obj) {
            typ = types[obj.type.name];
            if ("enum" in obj) {
                typ = capitalise(propName);
                em = `enum ${typ} {\n  `;
                em += obj.enum.join("\n  ") + "\n}";
            }
            if ("unique" in obj) {
                typ += " @unique";
            }
            if ("default" in obj) {
                let d = obj.default;
                typ += ` @default(${em ? d : typ === "String" ? `'${d}'` : d})`;
            }
        }
        else {
            typ = capitalise(propName);
            em = parseCollection({ name: propName, obj });
        }
    }
    return { table: em, type: typ };
}
function parseCollection(props) {
    const { name, obj } = props;
    let table = `model ${capitalise(name)} {\n  id String  @id @default(cuid())\n`;
    let subTables = "";
    for (const [key, value] of Object.entries(obj)) {
        let typ = "";
        if (typeof value === "function") {
            typ = types[value.name];
        }
        else {
            const v = parseObjectType(value, key);
            if (v.table)
                subTables += `\n\n${v.table}`;
            typ = v.type;
        }
        table += `  ${key} ${typ}\n`;
    }
    table += "}" + subTables;
    return table;
}
function capitalise(name) {
    if (name.includes("_")) {
        return name.split("_").map(capitalise).join("");
    }
    return name.slice(0, 1).toUpperCase() + name.slice(1);
}
//# sourceMappingURL=index.js.map