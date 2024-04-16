import "../../firebase.config.admin";
import slugify from "slugify";
import admin from "firebase-admin";

// Assuming admin is already initialized elsewhere if this file isn't the first entry
export const storage = admin.storage();

/**
 * Deletes a file from the specified bucket
 * @param bucketName The name of the bucket to delete the file from
 * @param url The URL of the file to delete
 */
export const deleteFile = async (
  bucketName: string,
  url?: string,
): Promise<void> => {
  const bucket = storage.bucket();
  const parsedUrl = new URL(url ?? "");

  let fileName = parsedUrl.pathname.substring(1).split("/").pop();
  if (fileName) {
    const fileRef = bucket.file(`${bucketName}/${fileName}`);
    await fileRef.delete();
  }
};

/**
 * Uploads a file to the specified bucket
 * @param file The file to upload
 * @param bucketName The name of the bucket to upload the file to
 * @returns The URL of the uploaded file
 */
export const uploadFile = async (
  file: File,
  bucketName: string,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    // file to blob
    const blob = new Blob([file], { type: file.type });
    // blob to Buffer object
    const buffer = Buffer.from(await blob.arrayBuffer());
    const fileName = slugify(file.name, { lower: true });
    const bucket = storage.bucket();

    // Create a file reference
    const fileRef = bucket.file(`${bucketName}/${fileName}`);

    // Upload the file
    try {
      await fileRef.save(buffer); // Assuming 'file' is a Buffer
      // After upload, generate a signed URL for public access (if the file should be publicly accessible)
      const signedUrls = await fileRef.getSignedUrl({
        action: "read",
        expires: "03-09-2491", // Use an appropriate expiry date
      });
      resolve(signedUrls[0]); // Resolve with the URL
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Downloads a file from the specified bucket
 * @param bucketName The name of the bucket to download the file from
 * @param url The URL of the file to download
 * @returns The file as a Buffer
 */
export const downloadFile = async (
  bucketName: string,
  url: string,
): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    const parsedUrl = new URL(url);
    const fileName = parsedUrl.pathname.substring(1).split("/").pop();
    const bucket = storage.bucket();
    const fileRef = bucket.file(`${bucketName}/${fileName}`);

    try {
      const [file] = await fileRef.download();
      resolve(file);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Update a file in the specified bucket
 * @param file The file to update
 * @param bucketName The name of the bucket to update the file in
 * @param url The URL of the file to update
 * @returns The URL of the updated file
 */
export const updateFile = async (
  file: File,
  bucketName: string,
  url: string,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const parsedUrl = new URL(url);
    const fileName = parsedUrl.pathname.substring(1).split("/").pop();
    const bucket = storage.bucket();
    const fileRef = bucket.file(`${bucketName}/${fileName}`);

    // file to blob
    const blob = new Blob([file], { type: file.type });
    // blob to Buffer object
    const buffer = Buffer.from(await blob.arrayBuffer());

    try {
      await fileRef.save(buffer);
      const signedUrls = await fileRef.getSignedUrl({
        action: "read",
        expires: "03-09-2491", // Use an appropriate expiry date
      });
      resolve(signedUrls[0]);
    } catch (err) {
      reject(err);
    }
  });
};