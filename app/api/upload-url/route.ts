import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

const client = new S3Client({
    region: "auto",
    endpoint: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const file = searchParams.get("file");

    if (!file) {
        return Response.json(
            { error: "File query parameter is required" },
            { status: 400 }
        );
    }

    const key = `resumes/${Date.now()}_${file}`;
    
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        ContentType: file.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const url = await getSignedUrl(client, command, { expiresIn: 60 });

    return Response.json({ 
        presignedUrl: url,
        key: key
    });
}
