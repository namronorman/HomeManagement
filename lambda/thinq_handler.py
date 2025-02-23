import asyncio
import boto3
import json
import logging
import os
import urllib3
from aiohttp import ClientSession
from thinqconnect.thinq_api import ThinQApi


logger = logging.getLogger()
log_level = os.environ.get('LOG_LEVEL', 'INFO')
logger.setLevel(log_level)


async def get_devices_list(access_token: str, client_id: str):
    async with ClientSession() as session:
        thinq_api = ThinQApi(session=session, access_token=access_token, country_code='US', client_id=client_id)
        response = await thinq_api.async_get_device_list()
        # print("device_list : %s", response)
        return response


async def get_device_status(access_token: str, client_id: str, device_id: str):
    async with ClientSession() as session:
        thinq_api = ThinQApi(session=session, access_token=access_token, country_code='US', client_id=client_id)
        response = await thinq_api.async_get_device_status(device_id)
        return response


def ddb_get_device_status(device_id: str):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ.get('THINQ_TABLE_NAME'))

    device_status = table.get_item(Key={'deviceId': device_id})

    if 'Item' in device_status.keys():
        return device_status['Item']
    else:
        return None
    
def ddb_set_device_status(device_id: str, device_status: str):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ.get('THINQ_TABLE_NAME'))
    response = table.put_item(Item={'deviceId': device_id, 'deviceStatus': device_status})


def send_discord_alert(message: str):
    webhook_url = boto3.client('ssm').get_parameter(Name=os.environ.get('PARAMETER_STORE_NAME'))['Parameter']['Value']
    
    http = urllib3.PoolManager()
    response = http.request(
        'POST',
        webhook_url,
        body=json.dumps({'content': message}),
        headers={'Content-Type': 'application/json'}
    )
    
    return {
        'statusCode': response.status,
        'body': response.data
    }



def handler(event, context):
    try:
        secrets_manager = boto3.client('secretsmanager')
        secret_response = secrets_manager.get_secret_value(SecretId=os.environ.get('THINQ_SECRET_ID'))
        secrets = json.loads(secret_response['SecretString'])

        access_token = secrets['accessToken']
        client_id = secrets['clientId']
    except Exception as e:
        logger.error(e)
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps('Error retrieving secrets')
        }

    devices = asyncio.run(get_devices_list(access_token, client_id))
    for device in devices:
        device_id = device['deviceId']
        device_type = device['deviceInfo']['deviceType']

        device_status = asyncio.run(get_device_status(access_token, client_id, device_id))

        # Sometimes device status is a single item list.
        if type(device_status) is list:
            device_status = device_status[0]

        current_state = device_status['runState']['currentState']
        ddb_state = ddb_get_device_status(device_id).get('deviceStatus', None)

        if ddb_state is None:
            ddb_set_device_status(device_id, current_state)
            continue

        if current_state != ddb_state:
            ddb_set_device_status(device_id, current_state)

            if current_state in ('END', 'POWER_OFF') and ddb_state not in ('END', 'ERROR', 'POWER_OFF'):
                # Send notification
                if device_type == "DEVICE_WASHTOWER_DRYER":
                    send_discord_alert("The dryer has finished running!")
                if device_type == "DEVICE_WASHTOWER_WASHER":
                    send_discord_alert("The washer has finished running!")
            elif current_state == 'ERROR'  and ddb_state not in ('END', 'ERROR', 'POWER_OFF'):
                # Send notification
                if device_type == "DEVICE_WASHTOWER_DRYER":
                    send_discord_alert("The dryer has encountered an error!")
                if device_type == "DEVICE_WASHTOWER_WASHER":
                    send_discord_alert("The washer has encountered an error!")
        else:
            logger.info("No change in device status")
