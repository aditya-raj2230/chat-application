import { Redis } from "@upstash/redis";
import styles from "./page.module.css";

const redis = Redis.fromEnv();
export const db = redis