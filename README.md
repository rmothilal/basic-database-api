#basic-database-api

###How to install:

```$xslt
run:
helm dep update ./helm/

next:
helm install --namespace {namespace} ./helm/

next:
 kubectl -n testdb port-forward service/{{RELEASE_NAME}}-basic-database-api 8080:80
```

###How to use

```$xslt
curl -X GET http://localhost:8080/users 

curl -X POST http://localhost:8080/add/{{userName}}
```
