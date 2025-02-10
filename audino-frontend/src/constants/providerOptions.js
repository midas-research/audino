export const PROVIDER_OPTIONS = [
    {
      provider: "AWS S3",
      value: "AWS_S3_BUCKET",
      config: {
        bucketField: "Bucket name",
        authentication: [
          {
            type: "Key id and secret access key pair",
            value: "KEY_SECRET_KEY_PAIR",
            fields: ["Access key id", "Secret access key"],
          },
          {
             type: "Anonymous access", 
             value: "ANONYMOUS_ACCESS",
             fields: [] },
        ],
      },
    },
   
  ];
  