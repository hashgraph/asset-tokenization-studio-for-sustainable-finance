## Alcance y Suposiciones
- Backend consumirá un único array `result` de structs `HolderPaymentResult { address holder, Status status, uint256 amount }` para eventos de pago de Distribución y Redención.
- `Status` es enum `succeeded | failed | alreadyPaid` en SC; lo trataremos como `uint8` en la firma del evento y lo mapearemos a estados de dominio (`SUCCESS | FAILED | ALREADY_PAID`).

## Cambios en Filtros de Eventos
- Actualizar firmas suscritas en: `apps/treasury/api/src/port.adapter/treasury/usecase/createtreasuryfilters/CreateTreasuryFiltersNestJSEventAdapter.ts:30` a tuple arrays:
  - DistributionExecuted: `DistributionExecuted(uint256 distributionID, uint256 pageIndex, uint256 pageLength, (address holder, uint8 status, uint256 amount)[] result)`
  - DistributionByAddressesExecuted: `DistributionByAddressesExecuted(uint256 distributionID, address[] holders, (address holder, uint8 status, uint256 amount)[] result)`
  - RedemptionExecuted: `RedemptionExecuted(uint256 pageIndex, uint256 pageLength, (address holder, uint8 status, uint256 amount)[] result)`
  - RedemptionByAddressesExecuted: `RedemptionByAddressesExecuted(address[] holders, (address holder, uint8 status, uint256 amount)[] result)`
- El decodificador soporta `tuple[]` y BigNumber→string: `packages/shared/blockchain-listener/src/port.adapter/blockchain/HederaMirrorNodeAdapter.ts:254`.

## Modelo de Evento Compartido
- Reemplazar `PaymentResultEventModel` por items:
  - `apps/treasury/api/src/port.adapter/shared/model/PaymentResultEventModel.ts:3` → definir `export interface PaymentResultItemEventModel { holder: string; status: string | number; amount: string }` y usar `result: PaymentResultItemEventModel[]` en los modelos de eventos:
    - Distribución: `BaseDistributionExecutedDLTEvent` y derivados: `apps/treasury/api/src/port.adapter/distribution/usecase/syncdistribution/model/BaseDistributionExecutedDLTEvent.ts:8`.
    - Redención: `BaseRedemptionExecutedDLTEvent`: `apps/treasury/api/src/port.adapter/redemption/usecase/syncredemption/model/BaseRedemptionExecutedDLTEvent.ts:7`.

## Adaptadores de Eventos (Sync)
- Distribución: `apps/treasury/api/src/port.adapter/distribution/usecase/syncdistribution/SyncDistributionNestJSEventAdapter.ts:28`
  - Iterar `event.result` y agrupar:
    - SUCCESS: `successAddresses` + `paidAmounts` cuando `status` mapeado a `SUCCESS` y `holder` != zero.
    - FAILED: `failedAddresses` cuando `status` mapeado a `FAILED` y `holder` != zero.
    - ALREADY_PAID: `alreadyPaidAddresses` + `alreadyPaidAmounts` cuando aplique.
  - Convertir EVM→Hedera (`convertToHederaFormat`) y delegar al servicio con nuevo DTO.
- Redención: `apps/treasury/api/src/port.adapter/redemption/usecase/syncredemption/SyncRedemptionNestJSEventAdapter.ts:27`
  - Misma lógica de agrupación, conversión y delegación.

## DTOs de Servicio
- Distribución: `apps/treasury/api/src/app/distribution/syncdistribution/service/model/SyncDistributionAppServiceRequest.ts:13`
  - Añadir `alreadyPaidAddresses: string[]` y `alreadyPaidAmounts: string[]`.
- Redención: `apps/treasury/api/src/app/redemption/syncredemption/model/SyncRedemptionAppServiceRequest.ts:5`
  - Añadir campos equivalentes.

## Servicios de Aplicación
- Distribución: `apps/treasury/api/src/app/distribution/syncdistribution/service/SyncDistributionAppService.ts:29`
  - Añadir `processAlreadyPaidHolders(addresses, amounts, distributionId, paymentTokenId)` emitiendo `AddDistributionHolderCommand` con estado `ALREADY_PAID`.
- Redención: `apps/treasury/api/src/app/redemption/syncredemption/SyncRedemptionAppService.ts:26`
  - Añadir `processAlreadyPaidHolders(addresses, amounts, treasuryId, paymentTokenId)`.

## Estados de Dominio y Validaciones
- Enums:
  - Distribución: `apps/treasury/api/src/domain/distribution/model/DistributionHolderStatus.ts:3` → añadir `ALREADY_PAID`.
  - Redención: `apps/treasury/api/src/domain/redemption/model/RedemptionHolderStatus.ts:3` → añadir `ALREADY_PAID`.
- Comandos:
  - Distribución: `apps/treasury/api/src/app/distribution/adddistributionholder/command/AddDistributionHolderCommand.ts:10` → incluir `ALREADY_PAID` en `@IsIn` y eliminar `@NotEquals("0")` de `amount`.
  - Redención: `apps/treasury/api/src/app/redemption/addredemptionholder/AddRedemptionHolderCommand.ts:10` → cambios equivalentes.

## Filtros y Endpoints de Lectura
- Permitir `ALREADY_PAID` en filtros de status para distribución:
  - `apps/treasury/api/src/app/distribution/getdistributionholders/query/GetDistributionHoldersQuery.ts:22`.
- Para redención, ampliar filtros si aplica en su endpoint/queries.

## Normalización de Status (en adaptadores Sync)
- Si `status` llega como número (p. ej., "0", "1", "2"): mapear `0→FAILED`, `1→SUCCESS`, `2→ALREADY_PAID`.
- Si llega como string (p. ej., `"succeeded"`, `"failed"`, `"alreadyPaid"`): normalizar a mayúsculas y convertir `SUCCEEDED→SUCCESS`, `FAILED→FAILED`, `ALREADYPAID→ALREADY_PAID`.

## Pruebas
- Actualizar tests que construyen `PaymentResultEventModel`:
  - Distribución: `apps/treasury/api/test/port.adapter/distribution/usecase/syncdistribution/SyncDistributionNestJSEventAdapter.spec.ts:103` y siguientes.
  - Redención: `apps/treasury/api/test/port.adapter/redemption/usecase/syncredemption/SyncRedemptionNestJSEventAdapter.spec.ts:100` y siguientes.
- Añadir casos `ALREADY_PAID` verificando persistencia y filtros.

## Compatibilidad y Despliegue
- Coordinación necesaria con el despliegue del SC que cambia la firma del evento.
- Validar end-to-end: detección de eventos, decodificación, persistencia y respuestas de API con el nuevo estado.

¿Confirmas y procedo con la implementación y actualización de pruebas?