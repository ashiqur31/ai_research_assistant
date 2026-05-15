import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const researchQueue = new Queue("research-queue", { connection });
