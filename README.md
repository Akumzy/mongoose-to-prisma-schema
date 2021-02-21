# mongoose-to-prisma-schema

Convert your mongoose models to prisma schema

## mongoose model

```ts
// ./models/Activity.ts
import { Document, model, Schema } from "mongoose"

export enum Services {
  Article = "Article",
  Resource = "Resource",
  Comment = "Comment",
  Post = "Post",
  Appreciation = "Appreciation",
}

export interface ActivityModel extends Document {
  item_id: string
  user_id: string
  service: Services
  created_at?: Date
}
const ActivitySchema: Schema<ActivityModel> = new Schema({
  item_id: Schema.Types.ObjectId,
  user_id: Schema.Types.ObjectId,
  service: { type: String, enum: Object.keys(Services) },
  created_at: Date,
})

export default model<ActivityModel>("Activity", ActivitySchema)
```

```ts
// ./index.ts
import ToPrismaSchame from "mongoose-to-prisma-schema"
import Activity from "./models/Activity"

await ToPrismaSchame(
  [Activity]
  join(process.cwd(), "prisma/schema.prisma"),
)

// You could also do this to transform your entire mongoose models
  await ToPrisma(
    Object.values(Activity.db.models).map((v) => v),
    join(process.cwd(), 'prisma/schema.prisma')
  )
```

## Prisma Schema



The mongoose model will be transform to this

```prisma
//./prisma/schema.prisma

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema


generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}

model Activity {
  id String  @id @default(cuid())
  item_id String
  user_id String
  service Service
}


enum Service {
  Article
  Resource
  Comment
  Post
  Appreciation
}
```
