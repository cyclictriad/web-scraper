import { connectDB } from "../db/mongoose";

export default defineNitroPlugin(connectDB)