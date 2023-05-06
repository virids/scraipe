/**
 * This script returns server location
 * */

const server = process.env.SERVER;

export default async function (_, res) {
  res.status(200).json({ server: server });
}