# Backend Architecture — OJTFlow

## Request Path and Layer Rules

```text
HTTP request
  -> Middleware (CORS, Origin check, authenticate, role, validate, rate limit)
    -> Route -> Controller -> Service -> Repository -> MySQL
                                  \
                                   +--> AI adapter (assistant only; never the database)