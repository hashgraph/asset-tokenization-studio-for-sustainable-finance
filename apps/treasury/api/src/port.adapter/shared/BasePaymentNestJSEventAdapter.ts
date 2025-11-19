import { ConverterUtils } from "@hashgraph/green-bonds-shared-core/dist/utils/ConverterUtils"
import { PaymentResultEventModel } from "@port/shared/model/PaymentResultEventModel"
import { PaymentResultItemModel } from "@port/shared/model/PaymentResultItemModel"

export abstract class BasePaymentNestJSEventAdapter {
  protected async mapResults(results: PaymentResultEventModel[]): Promise<PaymentResultItemModel[]> {
    return Promise.all(
      results.map(async (item) => ({
        holder: await ConverterUtils.getHederaAddressFromEvm(String(item.holder)),
        status: item.status,
        amount: item.amount,
      })),
    )
  }
}
