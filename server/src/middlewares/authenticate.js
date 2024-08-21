import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

// const publicKey = process.env.jwtSecretKey;

const publicKey = fs.readFileSync(
  path.join(__dirname, "../../../auth-keys/public_key.pem"),
  "utf-8"
);

export default async (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  let token;

  if (authorizationHeader) {
    token = authorizationHeader.split(" ")[1];
  }
  if (token) {
    jwt.verify(
      token,
      publicKey,
      { algorithm: ["RS256"] },
      async (err, decoded) => {
        if (err) {
          console.log(err);
          res.status(400).json({
            error: 400,
            message: "Failed to authenticate",
          });
        } else {
          const { accountId } = decoded;

          try {
            let userPermissions = await req.db.query(
              `
              SELECT *
              FROM credentials
              WHERE
                accountId = ?
            `,
              accountId
            );

            req.currentUser = JSON.parse(
              JSON.stringify({
                accountId,
                permissions: userPermissions,
              })
            );
            next();
          } catch (err) {
            next(err);
          }
        }
      }
    );
  } else {
    res.status(401).json({
      error: 401,
      message: "No token provided",
    });
  }
};
