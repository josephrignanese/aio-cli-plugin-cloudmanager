const { setStore, set } = require('@adobe/aio-lib-core-config')
const migrate = require('../../src/hooks/migrate-jwt-context-hook')

test('migrate -- no existing jwt', async () => {
    setStore({})
    let runResult = migrate()
    await expect(runResult instanceof Promise).toBeTruthy()
    await expect(set.mock.calls.length).toBe(0)
})

test('migrate -- existing jwt and existing CM context', async () => {
    setStore({
        'jwt-auth': {},
        'ims.contexts.aio-cli-plugin-cloudmanager': {}
    })
    let result = migrate()
    await expect(result instanceof Promise).toBeTruthy()
    await expect(result).resolves.toEqual(undefined)
    await expect(set.mock.calls.length).toBe(0)
})

test('migrate -- existing jwt and no existing CM context', async () => {
    setStore({
        'jwt-auth': {
            client_id: "1234",
            client_secret: "5678",
            jwt_payload: {
                iss: "someorg@AdobeOrg",
                sub: "4321@techacct.adobe.com",
                "https://ims-na1.adobelogin.com/s/ent_adobeio_sdk": true,
                "https://ims-na1.adobelogin.com/s/ent_cloudmgr_sdk": true,
                aud: "https://ims-na1.adobelogin.com/c/4bc4f99554834477a0de0244d46a575f"
            },
            jwt_private_key: "-----BEGIN PRIVATE KEY-----\n-----END PRIVATE KEY-----\n",
        },
        'ims.contexts.something-else': {}
    })
    let result = migrate()
    await expect(result instanceof Promise).toBeTruthy()
    await expect(result).resolves.toEqual(undefined)
    await expect(set.mock.calls.length).toBe(1)
    await expect(set.mock.calls[0][0]).toEqual('ims.contexts.aio-cli-plugin-cloudmanager')
    await expect(set.mock.calls[0][1]).toEqual({
        client_id: "1234",
        client_secret: "5678",
        ims_org_id: "someorg@AdobeOrg",
        technical_account_id: "4321@techacct.adobe.com",
        technical_account_email: "unused",
        meta_scopes: [
            "ent_adobeio_sdk",
            "ent_cloudmgr_sdk"
        ],
        private_key: "-----BEGIN PRIVATE KEY-----\n-----END PRIVATE KEY-----\n"
    })
})
