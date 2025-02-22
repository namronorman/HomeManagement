import asyncio
import json
from aiohttp import ClientSession
from thinqconnect.thinq_api import ThinQApi


async def test_devices_list(access_token: str, client_id: str):
    async with ClientSession() as session:
        thinq_api = ThinQApi(session=session, access_token=access_token, country_code='US', client_id=client_id)
        response = await thinq_api.async_get_device_list()
        print("device_list : %s", response)


if __name__ == '__main__':
    with open('.secrets.json', 'r') as secrets_file:
        secrets = json.load(secrets_file)

    asyncio.run(test_devices_list(secrets['homeAdmin'], secrets['clientId']))
