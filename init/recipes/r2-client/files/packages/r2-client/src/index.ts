import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function r2FromEnv(env: Record<string, string | undefined> = process.env): S3Client {
  const accountId = env["CLOUDFLARE_ACCOUNT_ID"];
  const accessKeyId = env["R2_ACCESS_KEY_ID"];
  const secretAccessKey = env["R2_SECRET_ACCESS_KEY"];
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 client requires CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY",
    );
  }
  return createR2Client({ accountId, accessKeyId, secretAccessKey });
}

export async function putObject(
  client: S3Client,
  bucket: string,
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string,
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function getObject(
  client: S3Client,
  bucket: string,
  key: string,
): Promise<Uint8Array> {
  const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return new Uint8Array(
    await (
      result.Body as { transformToByteArray: () => Promise<Uint8Array> }
    ).transformToByteArray(),
  );
}
