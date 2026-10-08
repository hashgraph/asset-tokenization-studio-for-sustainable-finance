import { PaymentResultItemAppServiceRequestModel } from "@app/shared/model/PaymentResultItemAppServiceRequestModel"
import { ConverterUtils } from "@hashgraph/green-bonds-shared-core/dist/utils/ConverterUtils"
import { PaymentResultEventModel } from "@port/shared/model/PaymentResultEventModel"

export abstract class BasePaymentNestJSEventAdapter {
  protected async mapResults(results: PaymentResultEventModel[]): Promise<PaymentResultItemAppServiceRequestModel[]> {
    return Promise.all(
      results.map(async (item) => ({
        holder: await ConverterUtils.getHederaAddressFromEvm(String(item.holder)),
        status: Number(item.status),
        amount: item.amount,
      })),
    )
  }
}
