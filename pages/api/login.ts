import { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default function (req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    "Set-cookie",
    cookie.serialize("token", req.body.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 60 * 60,
      sameSite: "strict",
      path: "/",
    })
  );

  res.status(200).json({ success: true });
}
