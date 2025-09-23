import { ProxyAdmin } from '@contracts/index'
import { getProxyAdminOwnerEnv } from '@scripts/utils'
import { BaseContract } from 'ethers'

export async function upgradeContract<C extends BaseContract>(
    proxyAdmin: ProxyAdmin,
    proxy: string,
    logic: C
) {
    await proxyAdmin
        .connect(await getProxyAdminOwnerEnv())
        .upgrade(proxy, logic.address)
}
