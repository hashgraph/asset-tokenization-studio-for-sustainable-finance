#!/bin/bash

# Update all command handlers
find ./src/app/oracle -name "*Handler.ts" -type f | while read file; do
  if grep -q "Command" "$file"; then
    # It's a command handler
    sed -i 's/@Injectable()/@CommandHandler/' "$file"
    sed -i 's/import { Inject, Injectable,/import { Inject,/' "$file"
    sed -i 's/import { Injectable, /import { /' "$file"
    sed -i '/^import.*@nestjs\/common/a import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";' "$file"
  fi
done

# Update all query handlers
find ./src/app/oracle -name "*Handler.ts" -type f | while read file; do
  if grep -q "Query" "$file"; then
    # It's a query handler
    sed -i 's/@Injectable()/@QueryHandler/' "$file"
    sed -i 's/import { Inject, Injectable,/import { Inject,/' "$file"
    sed -i 's/import { Injectable, /import { /' "$file"
    sed -i '/^import.*@nestjs\/common/a import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";' "$file"
  fi
done

echo "Handlers updated!"
