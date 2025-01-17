import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import {
  contentBelongsToLoggedInUserArtist,
  userAuthenticated,
} from "../../../../../auth/passport";

import prisma from "../../../../../../prisma/prisma";

export default function () {
  const operations = {
    POST: [userAuthenticated, contentBelongsToLoggedInUserArtist, POST],
    GET: [userAuthenticated, GET],
  };

  // FIXME: only allow creation of posts for
  // artists the user owns
  async function POST(req: Request, res: Response) {
    const { title, content, artistId } = req.body;
    const result = await prisma.post.create({
      data: {
        title,
        content,
        artist: { connect: { id: artistId } },
      },
    });
    res.json(result);
  }
  // FIXME: document POST

  async function GET(req: Request, res: Response) {
    const { artistId } = req.query;

    let where: Prisma.PostWhereInput = {};
    if (artistId) {
      where.artistId = Number(artistId);
    }

    const posts = await prisma.post.findMany({
      where,
    });

    res.json({
      results: posts,
    });
  }

  return operations;
}
