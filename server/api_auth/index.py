import os
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from datetime import datetime
from cryptography.fernet import Fernet


db = boto3.resource(
        "dynamodb",
        region_name="ru-central1",
        endpoint_url=os.getenv("ENDPOINT_URL"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )


def get_table(table):
    return db.Table(table)


def is_valid(*, token: str, secret: str) -> bool:
    try:
        params = json.loads(Fernet(secret.encode()).decrypt(token.encode()).decode())
        if params["type"] == "access":
            if params["datetime"] >= datetime.now().timestamp():
                table = get_table("users")
                item = table.get_item(Key={
                    "email": params["email"]
                })
                if "Item" in item:
                    if item["Item"]["password"] == params["password"]:
                        return True
    except Exception as ex:
        print(ex)
        return False
    return False


def handler(event, context):
    headers = event['headers']
    token = headers['Authorization'][7:]
    token_secret = os.getenv('TOKEN_SECRET')
    status = is_valid(token=token, secret=token_secret)
    if status:
        return {
            'isAuthorized': True
        }
    else:
        return {
            'isAuthorized': False,
        }
