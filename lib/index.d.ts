import { Model } from "mongoose";
export default function mongooseToPrismaSchema(models: Model<any>[], schemaPath: string): Promise<void>;
