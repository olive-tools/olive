# Olive

Built with Serverless Framework

# Run

Start localstack

`docker compose up -d`

change env var ENVIRIONMENT to "local", this way will be possible to test queues locally

# Generate google drive token

1. Run lambda in offline mode
2. Execute generate script
3. Copy code sent to local host url


# Big picture archtecture

1. go daddy domain
2. aws route 53 domain management
3. api gateway sub domain config (api.olivetrees.com.br)
4. serverless framework orcherstrating lambda and aws resources creation
