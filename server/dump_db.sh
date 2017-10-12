#!/bin/bash
colls=( receipts customeredits reconciliations autobuyrates customers batches inventories reserves stores buyrates denialpayments systemsettings cards retailers companies companysettings users )
for c in ${colls[@]}
do
  mongodump -d gcmanager -c $c --out .
done
