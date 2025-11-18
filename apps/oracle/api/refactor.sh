#!/bin/bash

# Script de refactorización masiva para Oracle API
# Este script actualiza imports y nombres de archivos siguiendo la arquitectura de ATS

echo "Iniciando refactorización de Oracle API..."

cd "$(dirname "$0")/src"

# 1. Actualizar imports de entidades en todo el proyecto
echo "Actualizando imports de entidades..."
find . -type f -name "*.ts" -exec sed -i 's/OracleRegistryEntity/OracleRegistryPersistence/g' {} +
find . -type f -name "*.ts" -exec sed -i 's/ScheduledTaskResultEntity/ScheduledTaskResultPersistence/g' {} +

# 2. Actualizar imports de repositorios
echo "Actualizando imports de repositorios..."
find . -type f -name "*.ts" -exec sed -i 's/PostgresOracleRegistryRepository/OracleRegistryTypeOrmRepository/g' {} +
find . -type f -name "*.ts" -exec sed -i 's/PostgresScheduledTaskRepository/ScheduledTaskTypeOrmRepository/g' {} +

# 3. Actualizar nombres de interfaces (quitar prefijo I)
echo "Actualizando nombres de interfaces..."
find . -type f -name "*.ts" -exec sed -i 's/IOracleRegistryRepository/OracleRegistryRepository/g' {} +
find . -type f -name "*.ts" -exec sed -i 's/IScheduledTaskRepository/ScheduledTaskRepository/g' {} +
find . -type f -name "*.ts" -exec sed -i 's/IIndexerPort/IndexerPort/g' {} +
find . -type f -name "*.ts" -exec sed -i 's/IBlockchainPort/BlockchainPort/g' {} +

# 4. Actualizar paths de imports de entities
echo "Actualizando paths de imports..."
find . -type f -name "*.ts" -exec sed -i 's|from "./entities/OracleRegistry|from "../model/OracleRegistry|g' {} +
find . -type f -name "*.ts" -exec sed -i 's|from "./entities/ScheduledTaskResult|from "../model/ScheduledTaskResult|g' {} +
find . -type f -name "*.ts" -exec sed -i 's|from "./OracleRegistryMapper"|from "../OracleRegistryMapper"|g' {} +
find . -type f -name "*.ts" -exec sed -i 's|from "./ScheduledTaskResultMapper"|from "../ScheduledTaskResultMapper"|g' {} +

echo "Refactorización de nombres completada!"
echo "Nota: Aún necesitas renombrar archivos de interfaces en domain/ manualmente"
