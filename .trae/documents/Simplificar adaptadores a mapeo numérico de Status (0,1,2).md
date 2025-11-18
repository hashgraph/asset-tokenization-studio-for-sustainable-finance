## Contexto
- El SC confirma que `Status` llega siempre como enum numérico: `0=SUCCEEDED`, `1=FAILED`, `2=ALREADY_PAID`.
- El decodificador del Mirror Node convierte tipos numéricos/BigNumber a string (`"0"`, `"1"`, `"2"`).

## Objetivo
- Eliminar comprobaciones de cadenas como `"FAILED"`/`"SUCCESS"` en los adaptadores y usar únicamente mapeo numérico robusto (`Number(item.status)`).

## Cambios Propuestos
- Adaptadores:
  - `apps/treasury/api/src/port.adapter/distribution/usecase/syncdistribution/SyncDistributionNestJSEventAdapter.ts`
    - Reemplazar `statusValue === "0"/"1"/"2"` por `const code = Number(item.status); if (code===0) SUCCESS; if (code===1) FAILED; if (code===2) ALREADY_PAID`.
    - Eliminar ramas que comparan `"SUCCEEDED"`, `"SUCCESS"`, `"FAILED"`, `"ALREADYPAID"`.
  - `apps/treasury/api/src/port.adapter/redemption/usecase/syncredemption/SyncRedemptionNestJSEventAdapter.ts`
    - Aplicar la misma simplificación.
- Modelo de evento:
  - `apps/treasury/api/src/port.adapter/shared/model/PaymentResultEventModel.ts`
    - Cambiar el tipo `status` a `number` (o mantener `string | number` por compatibilidad pero documentar que se espera `"0"|"1"|"2"`); los adaptadores usarán `Number(...)` siempre.

## Tests
- Actualizar tests para usar `status` numérico (0/1/2) en los arrays de `result`.
- Re-ejecutar los tests de sincronización y lectura para asegurar compatibilidad.

## Verificación
- Correr suites:
  - `SyncDistributionNestJSEventAdapter.spec.ts`
  - `SyncRedemptionNestJSEventAdapter.spec.ts`
  - `GetDistributionHoldersHttpAdapter.spec.ts`

¿Confirmas simplificar a sólo mapeo numérico? Procedo con los cambios y actualización de tests.