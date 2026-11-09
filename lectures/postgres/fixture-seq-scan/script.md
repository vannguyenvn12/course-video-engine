# Sequential scan

When PostgreSQL must read every row, it performs a sequential scan on the table.

Every row in the heap gets examined before the filter can reject it.

```sql
EXPLAIN SELECT * FROM orders WHERE status = 'pending';
```

That plan often shows a sequential scan because no index covers the predicate.

Every matching row still costs IO when the table grows.

The scan is simple but every row adds latency when data is wide.
