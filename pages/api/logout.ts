import { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default function (req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    "Set-cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      expires: new Date(0),
      sameSite: "strict",
      path: "/",
    })
  );

  res.status(200).json({ success: true });
}
