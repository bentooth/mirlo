#!/usr/bin/env node

import * as dotenv from "dotenv";
dotenv.config();

import yargs from "yargs";
import { Job, Worker } from "bullmq";
import winston from "winston";
import convertAudioJob from "./convert-audio";
import optimizeImage from "./optimize-image";

import { REDIS_CONFIG } from "../config/redis";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "background-queue" },
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
  ],
});

const workerOptions = {
  prefix: "mirlo",
  connection: REDIS_CONFIG,
};

yargs // eslint-disable-line
  .command("run", "starts file processing queue", (argv: any) => {
    logger.info("STARTING WORKER QUEUE");
    audioQueue();
    // audioDurationQueue();
    imageQueue();
  })
  .help().argv;

async function imageQueue() {
  const worker = new Worker("optimize-image", optimizeImage, workerOptions);
  logger.info("Optimize Image worker started");

  worker.on("completed", (job: Job) => {
    logger.info("completed:optimize-image");
  });

  worker.on("failed", (job?: Job, err?: any) => {
    logger.error("failed:optimize-image", err);
  });

  worker.on("error", (err: any) => {
    logger.error("error:optimize-image", err);
  });
}

async function audioQueue() {
  const worker = new Worker("convert-audio", convertAudioJob, workerOptions);
  logger.info("Convert Audio worker started");

  worker.on("completed", (job: any) => {
    logger.info("completed:convert-audio");
  });

  worker.on("failed", (job: any, err: any) => {
    logger.error("failed:convert-audio", err);
  });

  worker.on("error", (err: any) => {
    logger.error("error:convert-audio", err);
  });
}
