from mangum import Mangum
from fastapi import FastAPI, Header, status, Depends, Request
from fastapi.responses import JSONResponse, Response
from fastapi.exceptions import HTTPException
from pydantic import BaseModel, Field
import boto3
import requests
from boto3.dynamodb.conditions import Key, Attr
import os
import smtplib
import json
import uuid
from datetime import datetime, timedelta
from models import RequestModel, User, Login, RefreshToken, ResetPasswordEmail, ResetPassword, PutRequest
import hashlib
from cryptography.fernet import Fernet
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


db = boto3.resource(
        "dynamodb",
        region_name="ru-central1",
        endpoint_url=os.getenv("ENDPOINT_URL"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )


app = FastAPI()


# Получение идентификатора пользователя из токена
def get_user_email(
    authorization: str = Header(default="Bearer"),
) -> str:
    token = authorization.split(" ")[1]
    secret = os.getenv('TOKEN_SECRET')
    params = json.loads(Fernet(secret.encode()).decrypt(token.encode()).decode())
    return params["email"]


def get_table(table):
    return db.Table(table)


def encrypt_data(token: bytes, data: bytes):
    return Fernet(token).encrypt(data)


def decrypt_data(token: bytes, data: bytes):
    return Fernet(token).decrypt(data)


def get_tokens(email: str, password: str, is_admin: int):
    access_data = json.dumps({
        "email": email,
        "is_admin": is_admin,
        "type": "access",
        "password": password,
        "datetime": round((datetime.now() + timedelta(days=1)).timestamp())
    })
    access_token = encrypt_data(os.getenv('TOKEN_SECRET').encode(), access_data.encode()).decode()
    refresh_data = json.dumps({
        "email": email, 
        "is_admin": is_admin, 
        "type": "refresh",
        "password": password,
        "datetime": round((datetime.now() + timedelta(days=3)).timestamp())
    })
    refresh_token = encrypt_data(os.getenv('TOKEN_SECRET').encode(), refresh_data.encode()).decode()
    return (access_token, refresh_token)


def check_password(password_hash: str, password: str):
    h = hashlib.new('md5')
    h.update((password + os.getenv("PASSWORD_SALT")).encode())
    return h.hexdigest() == password_hash


def create_password(password: str):
    h = hashlib.new('md5')
    h.update((password + os.getenv("PASSWORD_SALT")).encode())
    return h.hexdigest()


def send_email(to_: str, msg: str):
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(os.getenv("GOOGLE_EMAIL"), os.getenv("GOOGLE_SECRET"))
    server.sendmail(
        os.getenv("GOOGLE_EMAIL"),
        to_,
        msg
    )
    server.quit()


def send_register_email(to_: str, link: str):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = "Подтверждение регистрации на status-requests"
    msg['From'] = os.getenv("GOOGLE_EMAIL")
    msg['To'] = to_
    text = (f'Здравствуйте, ваша ссылка для подтверждения регистрации на сайте {os.getenv("WEB_URL")}\n\n'
            f'{link}\n\n'
            f'Ссылка действительна в течении 15 минут.\n\n'
            f'Если вы не регистрировались на сайте - просто проигнорируйте данное письмо.')
    html = f'''\
    <html>
      <head></head>
      <body>
        <p>
           Здравствуйте, ваша ссылка для подтверждения регистрации на сайте <a href="{os.getenv("WEB_URL")}">status-requests</a><br><br>
           <a href="{link}">Нажмите для перехода...</a><br><br>
           Ссылка действительна в течении 15 минут.<br><br>
           Если вы не регистрировались на сайте - просто проигнорируйте данное письмо.
        </p>
      </body>
    </html>
    '''

    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')

    msg.attach(part1)
    msg.attach(part2)

    send_email(to_, msg.as_string())


def send_reset_password_email(to_: str, link: str):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = "Сброс пароля на status-requests"
    msg['From'] = os.getenv("GOOGLE_EMAIL")
    msg['To'] = to_
    text = (f'Здравствуйте, ваша ссылка для сброса пароля на сайте {os.getenv("WEB_URL")}\n\n'
            f'{link}\n\n'
            f'Ссылка действительна в течении 15 минут.\n\n'
            f'Если вы не запрашивали сброс пароля - просто проигнорируйте данное письмо.')
    html = f'''\
    <html>
      <head></head>
      <body>
        <p>
           Здравствуйте, ваша ссылка для сброса пароля на сайте <a href="{os.getenv("WEB_URL")}">status-requests</a><br><br>
           <a href="{link}">Нажмите для перехода...</a><br><br>
           Ссылка действительна в течении 15 минут.<br><br>
           Если вы не запрашивали сброс пароля - просто проигнорируйте данное письмо.
        </p>
      </body>
    </html>
    '''

    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')

    msg.attach(part1)
    msg.attach(part2)

    send_email(to_, msg.as_string())


def get_register_url(data: str):
    encrypting_object = {
        "data": data,
        "datetime": (datetime.now() + timedelta(minutes=15)).timestamp()
    }
    encoded_data = encrypt_data(os.getenv("REGISTER_URL_SECRET").encode(), json.dumps(encrypting_object, ensure_ascii=False).encode()).decode()
    return f'{os.getenv("WEB_URL")}/confirm_register/{encoded_data}'


def get_reset_password_url(data: str):
    encrypting_object = {
        "data": data,
        "datetime": (datetime.now() + timedelta(minutes=15)).timestamp()
    }
    encoded_data = encrypt_data(os.getenv("RESET_PASSWORD_URL_SECRET").encode(), json.dumps(encrypting_object, ensure_ascii=False).encode()).decode()
    return f'{os.getenv("WEB_URL")}/reset_password/{encoded_data}'


def check_captcha(token: str, ip: str):
    r = requests.post(
        "https://smartcaptcha.yandexcloud.net/validate",
        data={
            "secret": os.getenv("YSC_TOKEN"),
            "token": token,
            "ip": ip
        },
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    return r.json()["status"] == "ok"


# Авторизация
@app.post("/login/{token}", status_code=status.HTTP_200_OK)
def login(token: str, data: Login, request: Request):
    if not check_captcha(token, request.client.host):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "The captcha token is incorrect."},
        )
    data_serialized = data.model_dump()
    table = get_table("users")
    item = table.get_item(Key={
        "email": data_serialized["email"]
    })
    if "Item" not in item:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "The authorization data is incorrect."},
        )
    if check_password(item["Item"]["password"], data_serialized["password"]):
        tokens = get_tokens(data_serialized["email"], item["Item"]["password"], int(item["Item"]["is_admin"]))
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "access_token": tokens[0],
                "refresh_token": tokens[1],
            },
        )
    else:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "The authorization data is incorrect."},
        )


# Регистрация
@app.post("/register/{token}", status_code=status.HTTP_200_OK)
def register(token: str, data: User, request: Request):
    if not check_captcha(token, request.client.host):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "The captcha token is incorrect."},
        )
    data_serialized = data.model_dump()
    table = get_table("users")
    item = table.get_item(Key={
        "email": data_serialized["email"]
    })
    if "Item" in item:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "A user with such an email already exists."},
        )
    user_item = {
        'username': data_serialized["username"],
        'password': create_password(data_serialized["password"]),
        'phone_number': data_serialized["phone_number"],
        'email': data_serialized["email"],
        'is_admin': 0,
        'datetime': round(datetime.now().timestamp())
    }
    url = get_register_url(json.dumps(user_item, ensure_ascii=False))
    try:
        send_register_email(
            data_serialized["email"],
            url
        )
    except Exception as ex:
        return Response(
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    return Response(status_code=status.HTTP_200_OK)


# Подтверждение регистрации
@app.post("/confirm_register/{token_data}", status_code=status.HTTP_200_OK)
def confirm_register(token_data):
    try:
        decrypted_object = json.loads(decrypt_data(os.getenv("REGISTER_URL_SECRET").encode(), token_data.encode()).decode())
        if decrypted_object["datetime"] < datetime.now().timestamp():
            return JSONResponse(
                status_code=status.HTTP_408_REQUEST_TIMEOUT,
                content={"message": "Link timeout."},
            )
        user_item = json.loads(decrypted_object["data"])
        table = get_table("users")
        item = table.get_item(Key={
            "email": user_item["email"]
        })
        if "Item" in item:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"message": "Registration has already been confirmed."},
            )
        table.put_item(Item=user_item)
        return Response(status_code=status.HTTP_200_OK)
    except Exception as ex:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "The link is invalid."},
        )


# Обновление токена
@app.post("/refresh_token", status_code=status.HTTP_200_OK)
def refresh_token(data: RefreshToken):
    data_serialized = data.model_dump()
    try:
        token_data = json.loads(decrypt_data(os.getenv("TOKEN_SECRET").encode(), data_serialized["refresh_token"].encode()).decode())
        if token_data["type"] == "refresh":
            if token_data["datetime"] >= datetime.now().timestamp():
                tokens = get_tokens(token_data["email"], token_data["password"], int(token_data["is_admin"]))
                return JSONResponse(
                    status_code=status.HTTP_200_OK,
                    content={
                        "access_token": tokens[0],
                        "refresh_token": tokens[1],
                    },
                )
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "Refresh token is invalid."}
        )
    except Exception as ex:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "Refresh token is invalid."}
        )


# Отправка ссылки на сброс пароля
@app.post("/reset_password_query/{token}", status_code=status.HTTP_200_OK)
def reset_password_send_url(token: str, data: ResetPasswordEmail, request: Request):
    if not check_captcha(token, request.client.host):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "The captcha token is incorrect."},
        )
    data_serialized = data.model_dump()
    table = get_table("users")
    item = table.get_item(Key={
        "email": data_serialized["email"]
    })
    if "Item" not in item:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "A user with such email doesn't exist."},
        )
    url = get_reset_password_url(json.dumps({
        "email": data_serialized["email"]
    }, ensure_ascii=False))
    try:
        send_reset_password_email(
            data_serialized["email"],
            url
        )
    except Exception as ex:
        return Response(
            status_code=status.HTTP_400_BAD_REQUEST
        )
    return Response(status_code=status.HTTP_200_OK)


# Проверка токена на сброс пароля
@app.get("/reset_password/{identificator}", status_code=status.HTTP_200_OK)
def reset_password_check_token(identificator):
    try:
        decrypted_object = json.loads(decrypt_data(os.getenv("RESET_PASSWORD_URL_SECRET").encode(), identificator.encode()).decode())
        if decrypted_object["datetime"] < datetime.now().timestamp():
            return JSONResponse(
                status_code=status.HTTP_408_REQUEST_TIMEOUT,
                content={"message": "Link timeout."},
            )
        user_item = json.loads(decrypted_object["data"])
        table = get_table("users")
        item = table.get_item(Key={
            "email": user_item["email"]
        })
        if "Item" not in item:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "User not found."},
            )
        return Response(status_code=status.HTTP_200_OK)
    except Exception as ex:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "The link is invalid."},
        )


# Сброс пароля через токен
@app.post("/reset_password/{identificator}", status_code=status.HTTP_200_OK)
def reset_password_post(identificator, data: ResetPassword):
    data_serialized = data.model_dump()
    try:
        decrypted_object = json.loads(decrypt_data(os.getenv("RESET_PASSWORD_URL_SECRET").encode(), identificator.encode()).decode())
        if decrypted_object["datetime"] < datetime.now().timestamp():
            return JSONResponse(
                status_code=status.HTTP_408_REQUEST_TIMEOUT,
                content={"message": "Link timeout."},
            )
        user_item = json.loads(decrypted_object["data"])
        table = get_table("users")
        item = table.get_item(Key={
            "email": user_item["email"]
        })
        if "Item" not in item:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "User not found."},
            )
        if item["Item"]["password"] == create_password(data_serialized["password"]):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"message": "The passwords match."},
            )
        table.update_item(
            Key={"email": user_item["email"]},
            UpdateExpression="set password = :p",
            ExpressionAttributeValues={
                ":p": create_password(data_serialized["password"]),
            },
            ReturnValues="UPDATED_NEW",
        )
        return Response(status_code=status.HTTP_200_OK)
    except Exception as ex:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "The link is invalid."},
        )


# Отправка заявки
@app.post("/requests/{token}", status_code=status.HTTP_200_OK)
def post_requests(token: str, data: RequestModel, request: Request, email: str = Depends(get_user_email)):
    if not check_captcha(token, request.client.host):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "The captcha token is incorrect."},
        )
    data_serialized = data.model_dump()
    table = get_table("users")
    item = table.get_item(Key={
        "email": email
    })
    if "Item" not in item:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "User not found."},
        )
    if item["Item"]["is_admin"] == 1:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "User is administrator."},
        )
    request_id = str(uuid.uuid4()).split("-")[0]
    table = get_table("requests")
    item = {}
    item["request_id"] = request_id
    item["user_email"] = email
    item["device_type"] = data_serialized["device_type"]
    item["breakdown"] = data_serialized["breakdown"]
    item["description"] = data_serialized["description"]
    item["repair_method"] = data_serialized["repair_method"]
    item["price"] = 0
    item["warranty_period"] = ""
    item["status"] = "waiting"
    item["datetime"] = round(datetime.now().timestamp())
    table.put_item(Item=item)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"request": {
            "id": item["request_id"],
            "device_type": item["device_type"],
            "breakdown": item["breakdown"],
            "description": item["description"],
            "repair_method": item["repair_method"],
            "price": int(item["price"]),
            "datetime": int(item["datetime"]),
            "warranty_period": item["warranty_period"],
            "status": item["status"]
        }}
    )


# Получение заявок
@app.get("/requests", status_code=status.HTTP_200_OK)
def get_requests(email: str = Depends(get_user_email)):
    users_table = get_table("users")
    item = users_table.get_item(Key={
        "email": email
    })
    if "Item" not in item:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "User not found."},
        )
    requests_table = get_table("requests")
    if item["Item"]["is_admin"] == 1:
        items = requests_table.scan()["Items"]
        items = [{
            "id": i["request_id"],
            "email": i["user_email"],
            "device_type": i["device_type"],
            "breakdown": i["breakdown"],
            "description": i["description"],
            "repair_method": i["repair_method"],
            "price": int(i["price"]),
            "datetime": int(i["datetime"]),
            "warranty_period": i["warranty_period"],
            "status": i["status"]
        } for i in items]
        for i in range(len(items)):
            user = users_table.get_item(
                Key={
                    "email": items[i]["email"]
                }
            )
            if "Item" not in user:
                items[i]["error"] = "User not found."
                continue
            items[i]["credentials"] = user["Item"]["username"]
            items[i]["phone_number"] = user["Item"]["phone_number"]
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"requests": items},
        )
    else:
        items = requests_table.scan(
            FilterExpression=Attr('user_email').eq(email)
        )["Items"]
        items = [{
            "id": i["request_id"],
            "device_type": i["device_type"],
            "breakdown": i["breakdown"],
            "description": i["description"],
            "repair_method": i["repair_method"],
            "price": int(i["price"]),
            "datetime": int(i["datetime"]),
            "warranty_period": i["warranty_period"],
            "status": i["status"]
        } for i in items]
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"requests": items},
        )


# Получение профиля
@app.get("/profile", status_code=status.HTTP_200_OK)
def get_profile(email: str = Depends(get_user_email)):
    users_table = get_table("users")
    item = users_table.get_item(Key={
        "email": email
    })
    if "Item" not in item:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "User not found."},
        )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "email": item["Item"]["email"],
            "username": item["Item"]["username"],
            "phone_number": item["Item"]["phone_number"],
            "is_admin": int(item["Item"]["is_admin"]),
            "datetime": int(item["Item"]["datetime"]),
        },
    )


# Изменение заявки
@app.put("/requests/{request_id}", status_code=status.HTTP_200_OK)
def put_requests(request_id: str, data: PutRequest, email: str = Depends(get_user_email)):
    data_serialized = data.model_dump()
    table = get_table("users")
    item = table.get_item(Key={
        "email": email
    })
    if "Item" not in item:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "User not found."},
        )
    if item["Item"]["is_admin"] != 1:
        return JSONResponse(
            status_code=status.HTTP_403_NOT_FOUND,
            content={"message": "User is not an administrator."},
        )
    table = get_table("requests")
    item = table.get_item(Key={
        "user_email": data_serialized["email"],
        "request_id": request_id
    })
    if "Item" not in item:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "Request not found."},
        )
    table.update_item(
        Key={
            "user_email": data_serialized["email"],
            "request_id": request_id
        },
        UpdateExpression="SET status = :s, warranty_period = :w, price = :p",
        ExpressionAttributeValues={":s": data_serialized["status"], ":w": data_serialized["warranty_period"], ":p": data_serialized["price"]}
    )
    return Response(status_code=status.HTTP_200_OK)


handler = Mangum(app)