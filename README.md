npm install serverless -g

mkdir products; cd products

serverless create --template aws-nodejs --path products-service --name products

Create AWS Access key: https://www.youtube.com/watch?v=KngM5bfpttA

serverless config credentials --provider aws --key <Access key ID> --secret <Secret access key> --profile dev

cd products-service

sls deploy

sls logs -f addProduct
