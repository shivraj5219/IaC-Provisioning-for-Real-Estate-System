# Database: MongoDB Atlas (Free Tier)
# AWS DocumentDB is not available on free-tier AWS accounts.
# Using MongoDB Atlas M0 (free forever) as the database.
#
# Steps to set up MongoDB Atlas:
# 1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account
# 2. Create a free M0 cluster (choose any region, e.g., AWS us-east-1)
# 3. Under Security > Database Access: create a user with read/write permissions
# 4. Under Security > Network Access: add 0.0.0.0/0 (allow all IPs, since ECS IPs are dynamic)
# 5. Click Connect > Connect your application > copy the connection string
#    It looks like: mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
# 6. Set it as mongo_uri in your terraform.tfvars file
