import { Model } from "mongoose"
import { writeFile } from "fs/promises"

const types: { [k: string]: string } = {
  String: "String",
  Number: "Int",
  Boolean: "Boolean",
  ObjectId: "String",
  Date: "DateTime",
}

const setup = `// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url = env("DATABASE_URL")\n}\n\n`

export default async function mongooseToPrismaSchema(
  models: Model<any>[],
  schemaPath: string,
) {
  let schema =
    setup +
    models
      .map(({ modelName: name, schema: { obj } }) =>
        parseCollection({ name, obj }),
      )
      .join("\n\n")
  await writeFile(schemaPath, schema, { encoding: "utf-8" })
}

type ParseObjectType = { [x: string]: any } | { [x: string]: any }[]

function parseObjectType(obj: ParseObjectType, propName: string) {
  let em = "",
    typ = ""
  if (Array.isArray(obj)) {
    let ob = obj[0]
    if (typeof ob === "function") {
      typ = `${types[ob.name]}[]`
    } else {
      typ = `${capitalise(propName)}[]`
      em = parseCollection({ name: propName, obj: ob })
    }
  } else {
    if ("type" in obj) {
      typ = types[obj.type.name]
      if ("enum" in obj) {
        typ = capitalise(propName)
        em = `enum ${typ} {\n  `
        em += obj.enum.join("\n  ") + "\n}"
      }
      if ("unique" in obj) {
        typ += " @unique"
      }
      if ("default" in obj) {
        let d = obj.default
        typ += ` @default(${em ? d : typ === "String" ? `'${d}'` : d})`
      }
    } else {
      typ = capitalise(propName)
      em = parseCollection({ name: propName, obj })
    }
  }
  return { table: em, type: typ }
}
type ParseCollection = {
  name: string
  obj: ParseObjectType
}

function parseCollection(props: ParseCollection) {
  const { name, obj } = props
  let table = `model ${capitalise(name)} {\n  id String  @id @default(cuid())\n`
  let subTables = ""

  for (const [key, value] of Object.entries(obj)) {
    let typ: string = ""
    if (typeof value === "function") {
      typ = types[value.name]
    } else {
      const v = parseObjectType(value, key)
      if (v.table) subTables += `\n\n${v.table}`
      typ = v.type
    }
    table += `  ${key} ${typ}\n`
  }
  table += "}" + subTables
  return table
}

function capitalise(name: string): string {
  if (name.includes("_")) {
    return name.split("_").map(capitalise).join("")
  }
  return name.slice(0, 1).toUpperCase() + name.slice(1)
}
