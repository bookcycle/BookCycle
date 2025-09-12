import cloudinary from "../lib/cloudinary.js";

export async function signUploadCtrl(req, res) {
  const folder = (req.body?.folder || "ptb/books").trim();
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
    timestamp,
    signature,
  });
}
