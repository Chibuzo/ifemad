const { Upload } = require("@aws-sdk/lib-storage"),
    { S3 } = require("@aws-sdk/client-s3");

const s3Client = new S3({});

module.exports = async (bucketName, key, body) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: body,
        };
        const upload = new Upload({
            client: s3Client,
            params
        });

        return upload.done();
    } catch (err) {
        throw new Error(err.message)
    }
};