
# status_requests

A web application for creating and processing repair requests

## Demo
![Preview of the application](/screen.png)

## Design and assets files
### You can find the frames exported from Figma with the prepared application design [here](/design).
### You can also find the assets (screenshots of the working application) [here](/assets).

## Tech Stack

**Client:** React, Redux

**Server:** Yandex Cloud

**Server resources:** *Serverless technologies*
- API-gateway
- Cloud Logging
- Cloud functions (main handler and api-token authorization functions, written in Python)
- Object Storage (The static build of the application is being maintained)
- Managed Service for YDB (see the database structure below)
## Server configuration
### I chose Yandex Cloud as the server, but you can choose another one. On my part, a RESTful API and the ability to work with the database were implemented. You will also need 12 variables:
- #### "TOKEN_SECRET" - it contains a randomly generated Fernet key and is used to create new API keys to implement the authorization feature.
- #### "PASSWORD_SALT" - it contains the salt used to hash passwords.
- #### "REGISTER_URL_SECRET" - it contains a randomly generated Fernet key and is used to create unique links to implement registration verification.
- #### "RESET_PASSWORD_URL_SECRET" - it contains a randomly generated Fernet key and is used to create unique links to implement password reset.
- #### "AWS_ACCESS_KEY_ID" - it contains the access key for accessing Yandex Cloud services.
- #### "AWS_SECRET_ACCESS_KEY" - in contains the secret access key for accessing Yandex Cloud services.
- #### "ENDPOINT_URL" - it contains the endpoint url for accessing Yandex Cloud DataBase (YDB).
- #### "GOOGLE_EMAIL" - it contains the email address that emails are sent from.
- #### "GOOGLE_SECRET" - it contains the email secret for accessing the mail API via SMTP.
- #### "YSC_TOKEN" - it contains the token from the Yandex captcha service.
- #### "WEB_URL" - it contains the link to the server that serves the site's statics (frontend, react).
- #### "API_URL" - it contains the link to the server that serves the API (backend, FastAPI).
### If you want to use the same Yandex Cloud technologies as me, then you will also need to configure [`.env`](/server/.env) file and specify these variables there:

```diff
# Link to the endpoint URL to the Yandex DataBase
PASSWORD_SALT = ""
REGISTER_URL_SECRET = ""
TOKEN_SECRET = ""
RESET_PASSWORD_URL_SECRET = ""

AWS_ACCESS_KEY_ID = ""
AWS_SECRET_ACCESS_KEY = ""
ENDPOINT_URL = ""

GOOGLE_EMAIL = ""
GOOGLE_SECRET = ""

YSC_TOKEN = ""

WEB_URL = ""
API_URL = ""
```

### Also configure [`api_configuration.txt`](/server/api_configuration.txt) replacing the variables values with your own. ([OpenAPI 3.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md))

### And [`requirements.txt`](/server/requirements.txt) of my python functions:

```bash
  boto3
  cryptography
```
## Database structure

#### The database used is NoSQL document-oriented Yandex DataBase ([YDB](https://ydb.tech)) (AWS DynamoDB analog). The server is responsible for fulfilling all implicit restrictions (all except column types), such as maximum length, date patterns, etc.! There are 2 tables:

### "users" - Contains information about existing users

| Column     | Type       | Description                                               |
| :--------- | :--------- | :-------------------------------------------------------- |
| `email` | `utf8`     | **Required. Unique**. An email can be used.            |
| `username` | `utf8`     | **Required. Unique**. A nickname can be used.            |
| `password` | `utf8`     | **Required**. A hashed password of user.        |
| `phone_number` | `utf8`     | **Required**. A phone number can be used.            |
| `is_admin` | `DyNumber` | **Required**. `1` if the user is an admin, `0` otherwise. |
| `datetime` | `DyNumber`     | **Required**. The date and time of account creation (timestamp). .            |

### "requests" - Contains information about existing requests

| Column     | Type   | Description                                 |
| :--------- | :----- | :------------------------------------------ |
| `status` | `utf8` | **Required. Unique**. The status of request.  |
| `warranty_period`    | `utf8` | **Required**. Warranty_period of request. |
| `description`    | `utf8` | **Required**. The description of request. |
| `datetime`    | `DyNumber` | **Required**. The date and time of request creation (timestamp). |
| `user_email`    | `utf8` | **Required**. The email of request creator (user). |
| `request_id`    | `utf8` | **Required**. The unique request id. |
| `repair_method`    | `utf8` | **Required**. The repair method of device. Value from the list. (see [`.env`](/server/api/models.py)) |
| `price`    | `DyNumber` | **Required**. Token used in authentication. |
| `device_type`    | `utf8` | **Required**. Token used in authentication. |
| `breakdown`    | `utf8` | **Required**. The breakdown of device. Value from the list. (see [`.env`](/server/api/models.py)) |

## Installation

```bash
  git clone https://github.com/AtmSpheree/status_requests
  cd status_requests
  npm install
```

### Before working with the project, you will need to configure the [`.env`](/.env) file as follows:

```python
# The URL of your API server or gateway where requests will be sent
VITE_API_URL = 

# The URL of your server that serves the react application build
VITE_PUBLIC_URL = 

# A public token for using Yandex captcha
VITE_YSC_TOKEN = 
```
## Run Locally

```bash
  cd status_requests
  npm run start
```

## Deployment

```bash
  cd status_requests
  npm run build
```

## API Reference
### Unfortunately, this project was done in a hurry, so I can't say for sure if I used the Postman collection, or if I made the API right from memory.
## Appendix

### To create a user with administrator rights, you need to register the user (using the API or through the client side) and manually change the value of `role` from 0 to 1 in the database in the `users` table.
### Despite the tight deadlines, the project turned out to be really high-quality. It contains mechanisms for restoring account access, using external mailbox APIs (gmail), Yandex captcha, as well as a manually written link generation mechanism for confirming registration and password recovery (by creating strings with encrypted information using Fernet)
Good luck. 👋
